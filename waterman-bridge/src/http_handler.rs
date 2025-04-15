use crate::parameters::Parameters;
use crate::state::StateHandle;
use log::{debug, error, info};
use serde_json::json;
use warp::{Filter, Rejection, Reply};
use std::convert::Infallible;
use std::fs::File;
use std::io::Write;

// Function to save parameters to a YAML file
fn save_parameters_to_yaml(params: &Parameters) -> std::io::Result<()> {
    let yaml_content = serde_yaml::to_string(params).map_err(|e| {
        error!("Failed to serialize parameters to YAML: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;
    
    let file_path = "config/parameters.yaml";
    
    // Create directories if they don't exist
    if let Some(parent) = std::path::Path::new(file_path).parent() {
        std::fs::create_dir_all(parent)?;
    }
    
    let mut file = File::create(file_path)?;
    file.write_all(yaml_content.as_bytes())?;
    
    info!("Parameters saved to {}", file_path);
    Ok(())
}

pub type Result<T> = std::result::Result<T, Rejection>;

// Function to create all HTTP routes
pub fn get_routes(
    state: StateHandle,
) -> impl Filter<Extract = impl Reply, Error = Rejection> + Clone {
    let state_filter = warp::any().map(move || state.clone());

    // GET routes (no body parsing issues)
    let get_parameters = warp::path("parameters")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_get_parameters);

    let get_data_volume = warp::path!("parameters" / "data_volume")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_get_data_volume);

    let get_data_characteristics = warp::path!("parameters" / "data_characteristics")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_get_data_characteristics);

    let get_websocket_params = warp::path!("parameters" / "websocket")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_get_websocket_params);

    let get_yaml = warp::path!("parameters" / "yaml")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_get_yaml);

    let status = warp::path!("status")
        .and(warp::get())
        .and(state_filter.clone())
        .and_then(handle_status);

    // PUT routes (need careful body handling)
    let update_parameters = warp::path("parameters")
        .and(warp::put())
        .and(warp::body::content_length_limit(1024 * 1024))
        .and(warp::body::json())
        .and(state_filter.clone())
        .and_then(handle_update_parameters);

    let update_data_volume = warp::path!("parameters" / "data_volume")
        .and(warp::put())
        .and(warp::body::content_length_limit(1024 * 1024))
        .and(warp::body::json())
        .and(state_filter.clone())
        .and_then(handle_update_data_volume);

    let update_data_characteristics = warp::path!("parameters" / "data_characteristics")
        .and(warp::put())
        .and(warp::body::content_length_limit(1024 * 1024))
        .and(warp::body::json())
        .and(state_filter.clone())
        .and_then(handle_update_data_characteristics);

    let update_websocket_params = warp::path!("parameters" / "websocket")
        .and(warp::put())
        .and(warp::body::content_length_limit(1024 * 1024))
        .and(warp::body::json())
        .and(state_filter.clone())
        .and_then(handle_update_websocket_params);
    
    // CORS settings for the API
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
        .allow_headers(vec!["Content-Type", "Authorization"]);

    // Combine GET and PUT routes separately to avoid body parsing conflicts
    let get_routes = get_parameters
        .or(get_data_volume)
        .or(get_data_characteristics)
        .or(get_websocket_params)
        .or(get_yaml)
        .or(status);
        
    let put_routes = update_data_volume
        .or(update_data_characteristics)
        .or(update_websocket_params)
        .or(update_parameters);
    
    // Combine all routes, GET routes first
    get_routes
        .or(put_routes)
        .with(cors)
        .with(warp::log("http_api"))
}

// Handler functions
async fn handle_get_parameters(state: StateHandle) -> Result<impl Reply> {
    let parameters = state.lock().unwrap().get_parameters();
    Ok(warp::reply::json(&parameters))
}

async fn handle_update_parameters(new_params: Parameters, state: StateHandle) -> Result<impl Reply> {
    {
        let mut state_guard = state.lock().unwrap();
        state_guard.update_parameters(new_params.clone());
        
        // Save parameters to YAML file
        if let Err(e) = save_parameters_to_yaml(&new_params) {
            error!("Failed to save parameters to YAML: {}", e);
        }
    }
    
    info!("Parameters updated via API");
    let params = state.lock().unwrap().get_parameters();
    Ok(warp::reply::json(&params))
}

async fn handle_get_data_volume(state: StateHandle) -> Result<impl Reply> {
    let data_volume = state.lock().unwrap().get_parameters().data_volume;
    Ok(warp::reply::json(&data_volume))
}

async fn handle_update_data_volume(
    data_volume: crate::parameters::DataVolumeParams,
    state: StateHandle,
) -> Result<impl Reply> {
    {
        let mut state_guard = state.lock().unwrap();
        let before_params = state_guard.get_parameters();
        
        info!("Before update - data_rate_hz: {}", before_params.data_volume.data_rate_hz);
        info!("Received update - data_rate_hz: {}", data_volume.data_rate_hz);
        
        let mut params = state_guard.get_parameters();
        params.data_volume = data_volume;
        state_guard.update_parameters(params.clone());
        
        // Verify that parameters were updated
        let after_params = state_guard.get_parameters();
        info!("After update - data_rate_hz: {}", after_params.data_volume.data_rate_hz);
        
        // Save updated parameters to YAML file
        if let Err(e) = save_parameters_to_yaml(&params) {
            error!("Failed to save parameters to YAML: {}", e);
        }
    }
    
    info!("Data volume parameters updated via API");
    Ok(warp::reply::with_status(
        "Data volume parameters updated",
        warp::http::StatusCode::OK,
    ))
}

async fn handle_get_data_characteristics(state: StateHandle) -> Result<impl Reply> {
    let data_characteristics = state.lock().unwrap().get_parameters().data_characteristics;
    Ok(warp::reply::json(&data_characteristics))
}

async fn handle_update_data_characteristics(
    data_characteristics: crate::parameters::DataCharacteristicsParams,
    state: StateHandle,
) -> Result<impl Reply> {
    {
        let mut state_guard = state.lock().unwrap();
        let mut params = state_guard.get_parameters();
        params.data_characteristics = data_characteristics;
        state_guard.update_parameters(params.clone());
        
        // Save updated parameters to YAML file
        if let Err(e) = save_parameters_to_yaml(&params) {
            error!("Failed to save parameters to YAML: {}", e);
        }
    }
    
    info!("Data characteristics parameters updated via API");
    Ok(warp::reply::with_status(
        "Data characteristics parameters updated",
        warp::http::StatusCode::OK,
    ))
}

async fn handle_get_websocket_params(state: StateHandle) -> Result<impl Reply> {
    let websocket = state.lock().unwrap().get_parameters().websocket;
    Ok(warp::reply::json(&websocket))
}

async fn handle_update_websocket_params(
    websocket: crate::parameters::WebSocketParams,
    state: StateHandle,
) -> Result<impl Reply> {
    {
        let mut state_guard = state.lock().unwrap();
        let mut params = state_guard.get_parameters();
        params.websocket = websocket;
        state_guard.update_parameters(params.clone());
        
        // Save updated parameters to YAML file
        if let Err(e) = save_parameters_to_yaml(&params) {
            error!("Failed to save parameters to YAML: {}", e);
        }
    }
    
    info!("WebSocket parameters updated via API");
    Ok(warp::reply::with_status(
        "WebSocket parameters updated",
        warp::http::StatusCode::OK,
    ))
}

async fn handle_status(state: StateHandle) -> Result<impl Reply> {
    let state_guard = state.lock().unwrap();
    let current_rate = state_guard.parameters.data_volume.data_rate_hz;
    
    let status = json!({
        "time_ms": state_guard.t_ms,
        "last_update_ms": state_guard.last_t_ms,
        "data_rate_hz": current_rate,
    });
    
    info!("Status requested: current data_rate_hz = {}", current_rate);
    Ok(warp::reply::json(&status))
}

// New handler function to get the parameters as YAML
async fn handle_get_yaml(state: StateHandle) -> Result<impl Reply> {
    let parameters = state.lock().unwrap().get_parameters();
    
    match serde_yaml::to_string(&parameters) {
        Ok(yaml_content) => {
            // Return YAML content with text/yaml content type
            Ok(warp::reply::with_header(
                yaml_content,
                "content-type",
                "text/yaml",
            ))
        },
        Err(e) => {
            // Log the error and return an error response
            error!("Failed to serialize parameters to YAML: {}", e);
            let error_message = format!("Error generating YAML: {}", e);
            Ok(warp::reply::with_header(
                error_message,
                "content-type",
                "text/plain",
            ))
        }
    }
}
