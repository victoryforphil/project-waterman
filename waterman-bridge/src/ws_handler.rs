use crate::data_gen::DataGenerator;
use crate::state::StateHandle;
use arrow::ipc::writer::FileWriter;
use log::{debug, error, info};
use parquet::arrow::ArrowWriter;
use std::collections::BTreeMap;
use warp::ws::{Message, WebSocket};
use warp::{Rejection, Reply};
type Result<T> = std::result::Result<T, Rejection>;
use futures::{FutureExt, SinkExt, StreamExt};
use arrow::error::ArrowError;


use arrow::record_batch::RecordBatch;

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
        while let Some(message) = rx.recv().await {
            let schema = message.schema();
        
            // Create buffer to write IPC format
            let mut buffer = Vec::new();
            {
                let mut writer = FileWriter::try_new(&mut buffer, &schema).unwrap();
                writer.write(&message).unwrap();
                writer.finish().unwrap();
            }
        
            
            let result = client_ws_sender.send(Message::binary(buffer)).await;
            
            if let Err(e) = result {
                error!("Error sending message: {}", e);
                break;
            }
        }
    });

    tokio::spawn(async move {
        let mut last_send_time = 0;
        let send_interval = (1.0 / state_clone.lock().unwrap().send_rate_hz) * 1000.0;
        loop {
            let loop_start = std::time::Instant::now();
            let current_time = start_time.elapsed().as_millis() as u64;
            if current_time - last_send_time >= send_interval as u64 {
                last_send_time = current_time;
                let state_clone = state.clone();

                
                let message = DataGenerator::new().generate_record_batch(10);
                
                state_clone.lock().unwrap().tick(send_interval as u64);
                state_clone.lock().unwrap().update_last_t();
                
                if let Err(e) = tx.send(message).await {
                    error!("Error sending to channel: {}", e);
                    break;
                }
            }
            
            let elapsed = loop_start.elapsed().as_millis() as u64;
            let sleep_time = if elapsed < send_interval as u64 {
                send_interval as u64 - elapsed
            } else {
                0
            };
            
            tokio::time::sleep(std::time::Duration::from_millis(sleep_time)).await;
        }
    });
}
