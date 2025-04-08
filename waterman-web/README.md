# Waterman WebSocket Client

A React-based WebSocket client that connects to the Waterman Bridge server and displays Arrow RecordBatch data in real-time.

## Features

- Connect to WebSocket servers with WS/WSS support
- Visualize Arrow RecordBatch data in a table
- Monitor connection statistics:
  - Messages per second
  - Rows per second
  - Bytes per second
- View schema information
- Real-time performance charts

## Technologies

- React 19
- Mantine UI v7
- Vite
- TypeScript
- Apache Arrow
- Recharts for data visualization
- MantineReactTable for data display

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended for faster development)

### Installation

1. Install dependencies:

```bash
# Using npm
npm install

# Using Bun
bun install
```

2. Start the development server:

```bash
# Using npm
npm run dev

# Using Bun
bun dev
```

3. Build for production:

```bash
# Using npm
npm run build

# Using Bun
bun run build
```

## Usage

1. Start the Waterman Bridge server
2. Open the Waterman WebSocket Client in your browser
3. Enter the host and port (default: `localhost:8080`)
4. Click "Connect" to establish a WebSocket connection
5. The client will automatically:
   - Display real-time statistics
   - Show record batch data
   - Display the schema
   - Graph performance metrics

## WebSocket Data Format

The client expects the WebSocket server to send Arrow RecordBatch data in the IPC format. Each message should contain a complete RecordBatch that can be parsed with the Apache Arrow JS library.

## Project Structure

- `src/hooks/useArrowWebSocket.ts` - Custom hook for handling WebSocket connections and processing Arrow data
- `src/components/` - UI components
- `src/App.tsx` - Main application component
