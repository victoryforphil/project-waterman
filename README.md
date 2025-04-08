# project-waterman
Proof of concept / benchmark for Arrow over WebSocket for visualization tooling.

## Services

The project consists of two main services:

1. **waterman-bridge** - Rust WebSocket server (port 3031)
   - Generates data and sends it over WebSocket
   - Configurable data rate (default: 1000.0 Hz in Docker)

2. **waterman-web** - Web frontend (port 80)
   - Connects to the WebSocket server
   - Visualizes the data in real-time

## Running with Docker Compose

```bash
# Build and start all services
docker compose up --build

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

## Configuration

The waterman-bridge service can be configured with these parameters:
- `--address`: WebSocket server address (default: 127.0.0.1, in Docker: 0.0.0.0)
- `--port`: WebSocket server port (default: 3031)
- `--rate`: Data send rate in Hz (default: 100.0, in Docker: 1000.0)
