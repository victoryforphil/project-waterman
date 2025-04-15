use crate::data_gen::DataGenerator;
use crate::state::StateHandle;
use arrow::ipc::writer::FileWriter;
use log::{debug, error, info, warn};
use parquet::arrow::ArrowWriter;
use std::collections::BTreeMap;
use warp::ws::{Message, WebSocket};
use warp::{Rejection, Reply};
type Result<T> = std::result::Result<T, Rejection>;
use futures::{FutureExt, SinkExt, StreamExt};
use arrow::error::ArrowError;
use arrow::record_batch::RecordBatch;
use std::time::{Duration, Instant};

pub async fn ws_handler(ws: warp::ws::Ws, state: StateHandle) -> Result<impl Reply> {
    Ok(ws.on_upgrade(|socket| async {
        ws_connect(socket, state).await;
    }))
}

pub type WSMessage = RecordBatch;

pub async fn ws_connect(ws: WebSocket, state: StateHandle) {
    info!("New WebSocket connection");

    let (mut client_ws_sender, _client_ws_rcv) = ws.split();

    let state_clone = state.clone();
    let start_time = std::time::Instant::now();

    let (tx, mut rx) = tokio::sync::mpsc::channel::<WSMessage>(512);

    tokio::spawn(async move {
        let mut error_count = 0;
        let mut success_count = 0;
        let mut last_log_time = Instant::now();
        
        while let Some(message) = rx.recv().await {
            let schema = message.schema();
        
            // Create buffer to write IPC format
            let mut buffer = Vec::new();
            
            // Try to serialize the message to Arrow IPC format
            let serialization_result = (|| -> std::result::Result<(), String> {
                let mut writer = match FileWriter::try_new(&mut buffer, &schema) {
                    Ok(w) => w,
                    Err(e) => return Err(format!("Failed to create IPC writer: {}", e)),
                };
                
                if let Err(e) = writer.write(&message) {
                    return Err(format!("Failed to write record batch: {}", e));
                }
                
                if let Err(e) = writer.finish() {
                    return Err(format!("Failed to finish IPC writer: {}", e));
                }
                
                Ok(())
            })();
            
            // Handle serialization errors
            if let Err(e) = serialization_result {
                error!("Error serializing message: {}", e);
                error_count += 1;
                continue;
            }
            
            // Simulate network latency if configured
            let params = state_clone.lock().unwrap().get_parameters();
            if params.websocket.simulate_latency && params.websocket.latency_ms > 0 {
                tokio::time::sleep(std::time::Duration::from_millis(params.websocket.latency_ms)).await;
            }
            
            // Simulate random disconnects if configured
            if params.websocket.simulate_disconnects {
                let disconnect_probability = params.websocket.disconnection_probability;
                if disconnect_probability > 0.0 {
                    let mut rng = rand::thread_rng();
                    if rand::Rng::gen_range(&mut rng, 0.0..1.0) < disconnect_probability {
                        warn!("Simulating random disconnect");
                        break;
                    }
                }
            }
            
            // Send the message over WebSocket
            let result = client_ws_sender.send(Message::binary(buffer)).await;
            
            match result {
                Ok(_) => {
                    success_count += 1;
                    // Log stats every few seconds
                    if last_log_time.elapsed() > Duration::from_secs(5) {
                        info!("WebSocket stats - Success: {}, Errors: {}", success_count, error_count);
                        last_log_time = Instant::now();
                    }
                },
                Err(e) => {
                    error!("Error sending message: {}", e);
                    error_count += 1;
                    break;
                }
            }
        }
        
        info!("WebSocket sender task ending. Total messages sent: {}, errors: {}", 
              success_count, error_count);
    });

    tokio::spawn(async move {
        let mut last_send_time = 0;
        let mut data_generator = DataGenerator::new();
        let mut consecutive_errors = 0;
        
        loop {
            let loop_start = std::time::Instant::now();
            let current_time = start_time.elapsed().as_millis() as u64;
            
            // Get current parameters for this iteration
            let params = {
                let state_guard = state.lock().unwrap();
                state_guard.get_parameters()
            };
            
            // Update the data generator with current parameters
            data_generator.parameters = Some(params.clone());
            
            // Calculate send interval based on current parameters
            let data_rate = params.data_volume.data_rate_hz;
            let send_interval = (1.0 / data_rate) * 1000.0;
            
            // Log current data rate periodically
            if current_time % 5000 < 10 {  // Log approximately every 5 seconds
                info!("Current data rate: {} Hz, Send interval: {} ms", data_rate, send_interval);
            }
            
            // Check for test duration limits
            if let Some(duration_seconds) = params.get_test_duration_seconds() {
                if current_time >= duration_seconds * 1000 {
                    info!("Test duration reached, stopping data generation");
                    break;
                }
            }
            
            if current_time - last_send_time >= send_interval as u64 {
                last_send_time = current_time;
                
                // Generate data with current batch size using updated generator
                let message = data_generator.generate_record_batch(params.websocket.batch_size);
                
                // Handle the Result returned by generate_record_batch
                let message = match message {
                    Ok(batch) => {
                        consecutive_errors = 0;
                        batch
                    },
                    Err(e) => {
                        error!("Error generating record batch: {}", e);
                        consecutive_errors += 1;
                        
                        if consecutive_errors >= 5 {
                            error!("Too many consecutive errors generating data, stopping generator");
                            break;
                        }
                        
                        // Skip this iteration if there was an error
                        continue;
                    }
                };
                
                {
                    let mut state_guard = state.lock().unwrap();
                    state_guard.tick(send_interval as u64);
                    state_guard.update_last_t();
                }
                
                if let Err(e) = tx.send(message).await {
                    error!("Error sending to channel: {}", e);
                    break;
                }
            }
            
            let elapsed = loop_start.elapsed().as_millis() as u64;
            let sleep_time = if elapsed < send_interval as u64 {
                send_interval as u64 - elapsed
            } else {
                // If we're running behind schedule, log it but don't sleep
                if elapsed > send_interval as u64 * 2 {
                    warn!("Data generation falling behind - iteration took {}ms, interval is {}ms", 
                           elapsed, send_interval as u64);
                }
                0
            };
            
            tokio::time::sleep(std::time::Duration::from_millis(sleep_time)).await;
        }
        
        info!("Data generation task ending");
    });
}
