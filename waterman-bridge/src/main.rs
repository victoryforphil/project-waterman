use warp::Filter;
use warp::{ Rejection};
use clap::Parser;
use std::fs::File;
use std::io::Read;

mod data_gen;
mod ws_handler;
mod http_handler;
mod state;
mod parameters;

// Import std::path for handling file paths
use std::path::Path;
use log::{info, warn};
use parameters::Parameters;

// Function to load parameters from YAML file
fn load_parameters_from_yaml() -> Option<Parameters> {
    let file_path = "config/parameters.yaml";
    let path = Path::new(file_path);
    
    if !path.exists() {
        warn!("Parameters file {} does not exist. Using defaults.", file_path);
        return None;
    }
    
    match File::open(path) {
        Ok(mut file) => {
            let mut contents = String::new();
            match file.read_to_string(&mut contents) {
                Ok(_) => match serde_yaml::from_str(&contents) {
                    Ok(params) => {
                        info!("Parameters loaded from {}", file_path);
                        Some(params)
                    },
                    Err(e) => {
                        warn!("Failed to parse parameters from YAML: {}", e);
                        None
                    }
                },
                Err(e) => {
                    warn!("Failed to read parameters file: {}", e);
                    None
                }
            }
        },
        Err(e) => {
            warn!("Failed to open parameters file: {}", e);
            None
        }
    }
}

/// Command line arguments for the WebSocket bridge
#[derive(Parser, Debug, Clone)]
#[clap(author, version, about)]
pub struct WSBridgeArgs {
    /// WebSocket server address
    #[clap(short, long, default_value = "127.0.0.1")]
    pub address: String,

    /// WebSocket server port
    #[clap(short, long, default_value_t = 3031)]
    pub port: u16,

    /// Data send rate in Hz
    #[clap(short, long, default_value_t = 100.0)]
    pub rate: f64,
}

#[tokio::main]
async fn main() {
    let args = WSBridgeArgs::parse();
    pretty_env_logger::init();
    log::info!("Starting Waterman Bridge: {:?}", args);
    
    // Initialize state with command line arguments
    let mut state = state::WSBridgeState::new();
    
    // Try to load parameters from YAML file
    if let Some(params) = load_parameters_from_yaml() {
        state.update_parameters(params);
        info!("Using parameters from YAML file");
    } else {
        // Use command line rate if no file is available
        state.set_send_rate_hz(args.rate);
        info!("Using default parameters with rate {} Hz", args.rate);
    }
    
    let state = state.as_handle();
    
    // WebSocket route
    let ws_route = warp::path("ws")
        // The `ws()` filter will prepare the Websocket handshake.
        .and(warp::ws())
        .and(with_state(state.clone())) 
        .and_then(ws_handler::ws_handler);

    // HTTP API routes for parameter adjustment
    let http_routes = http_handler::get_routes(state.clone());
    
    // Static files route - serve files from the static directory
    let static_dir = Path::new("static");
    let static_route = warp::fs::dir(static_dir.to_path_buf());
    
    // Route to serve index.html at the root
    let index_route = warp::path::end()
        .and(warp::fs::file(static_dir.join("index.html")));
    
    // Combine all routes (WebSocket, HTTP API, and static files) into a single server
    let combined_routes = ws_route
        .or(http_routes)
        .or(index_route)
        .or(static_route);

    // Start the server
    let server = warp::serve(combined_routes).run(([0, 0, 0, 0], args.port));
    
    info!("WebSocket server started at ws://0.0.0.0:{}", args.port);
    info!("HTTP API available at http://0.0.0.0:{}", args.port);
    
    server.await;
}

fn with_state(state: state::StateHandle) -> impl Filter<Extract = (state::StateHandle,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}
