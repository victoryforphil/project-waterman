use warp::Filter;
use warp::{ Rejection};
use clap::Parser;

mod data_gen;
mod ws_handler;
mod state;
// Import std::path for handling file paths
use std::path::Path;

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
    state.send_rate_hz = args.rate;
    let state = state.as_handle();
    
    // WebSocket route
    let ws_route = warp::path("ws")
        // The `ws()` filter will prepare the Websocket handshake.
        .and(warp::ws())
        .and(with_state(state)) 
        .and_then(ws_handler::ws_handler);

    // Static files route - serve files from the static directory
    let static_dir = Path::new("static");
    let static_route = warp::fs::dir(static_dir.to_path_buf());
    
    // Route to serve index.html at the root
    let index_route = warp::path::end()
        .and(warp::fs::file(static_dir.join("index.html")));
    
    // Combine all routes
    let routes = ws_route.or(index_route).or(static_route);

    log::info!("Server started at http://0.0.0.0:{}", args.port);
    
    
    warp::serve(routes).run(([0, 0, 0, 0], args.port)).await;
}

fn with_state(state: state::StateHandle) -> impl Filter<Extract = (state::StateHandle,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || state.clone())
}
