# Waterman Bridge

A WebSocket and Arrow-based data streaming bridge designed for performance testing and benchmarking of real-time data visualization applications.

## Overview

Waterman Bridge generates configurable data streams over WebSockets using Apache Arrow for efficient serialization. It provides a comprehensive set of parameters that allow for testing various data streaming scenarios, volumes, and patterns.

## Features

- **WebSocket Streaming**: Sends data in efficient Arrow format over WebSockets
- **Configurable Parameters**: Adjust all aspects of the data stream via HTTP API
- **Various Data Patterns**: Generate sine waves, random noise, step functions, impulse responses, or mixed patterns
- **Performance Testing**: Test with different data volumes, rates, and connection scenarios
- **Controlled Network Conditions**: Simulate network latency and disconnections

## Installation

### Prerequisites

- Rust 1.68 or higher
- Cargo package manager

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/project-waterman.git
cd project-waterman/waterman-bridge

# Build the project
cargo build --release

# Run the application
cargo run --release
```

## Usage

### Starting the Server

```bash
# Run with default settings (100Hz data rate)
cargo run --release

# Run with custom settings
cargo run --release -- --address 0.0.0.0 --port 3031 --rate 500 --http-port 3032
```

### Command-line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--address`, `-a` | WebSocket server address | 127.0.0.1 |
| `--port`, `-p` | WebSocket server port | 3031 |
| `--rate`, `-r` | Data generation rate in Hz | 100.0 |
| `--http-port` | HTTP API port for parameter adjustment | 3032 |

## HTTP API

The Waterman Bridge exposes an HTTP API for adjusting parameters in real-time:

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/parameters` | GET | Get all current parameters |
| `/parameters` | PUT | Update all parameters |
| `/parameters/data_volume` | GET | Get data volume parameters |
| `/parameters/data_volume` | PUT | Update data volume parameters |
| `/parameters/data_characteristics` | GET | Get data characteristics parameters |
| `/parameters/data_characteristics` | PUT | Update data characteristics parameters |
| `/parameters/websocket` | GET | Get WebSocket parameters |
| `/parameters/websocket` | PUT | Update WebSocket parameters |
| `/status` | GET | Get current server status |

### Example: Updating Data Rate

```bash
curl -X PUT http://localhost:3032/parameters/data_volume \
  -H "Content-Type: application/json" \
  -d '{"num_channels": 100, "float_precision": 1e8, "data_rate_hz": 500, "test_duration": "Medium"}'
```

## Configurable Parameters

### Data Volume Parameters
- Number of data channels (1, 10, 100, 1000)
- Floating point precision (1e4, 1e8, 1e16, 1e32)
- Data rate (Hz) for streaming tests (50Hz, 500Hz, 50kHz)
- Test duration (10s, 100s, 1000s, 3600s, open-ended)

### Data Characteristics
- Data type (float32, float64, int32, array, nested object)
- Missing data points
- Data gaps
- Signal patterns (sine waves, random noise, step functions, impulse responses, mixed)
- Presence of outliers/spikes

### WebSocket Parameters
- Batch size (points per message)
- Message size (bytes)
- Message frequency
- Connection stability tests (network latency simulation)

## WebSocket Client Connection

Connect to the WebSocket server at:

```
ws://localhost:3031/ws
```

Data is sent in the Apache Arrow IPC format, which provides efficient serialization of columnar data.

## Development

### Project Structure

- `src/main.rs`: Application entry point and server setup
- `src/parameters.rs`: Parameter definitions and management
- `src/state.rs`: Application state management
- `src/data_gen.rs`: Data generation with various patterns
- `src/ws_handler.rs`: WebSocket connection handling
- `src/http_handler.rs`: HTTP API for parameter adjustment

## License

This project is licensed under the MIT License - see the LICENSE file for details. 