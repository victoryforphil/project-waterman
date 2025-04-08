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

# Running Manually (bun + cargo)

## Backend (waterman-bridge)

```bash
# Navigate to waterman-bridge directory
cd waterman-bridge

# Build the project
cargo build --release

# Run with default settings (127.0.0.1:3031, 100Hz)
cargo run --release

# Or run with custom settings
cargo run --release -- --address=0.0.0.0 --port=3031 --rate=1000.0
```

## Frontend (waterman-web)

```bash
# Navigate to waterman-web directory
cd waterman-web

# Install dependencies
bun install

# Start development server
bun run dev

# Or build for production
bun run build

# Serve production build (using a simple server)
bun run preview
```

Note: When running manually, you'll need to ensure the WebSocket URL in the frontend code matches the address and port of your waterman-bridge instance.

## Configuration

The waterman-bridge service can be configured with these parameters:
- `--address`: WebSocket server address (default: 127.0.0.1, in Docker: 0.0.0.0)
- `--port`: WebSocket server port (default: 3031)
- `--rate`: Data send rate in Hz (default: 100.0, in Docker: 1000.0)
