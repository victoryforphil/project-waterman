import { useState, useEffect, useRef, useCallback } from 'react';
import { RecordBatch, tableFromIPC } from 'apache-arrow';

export interface Stats {
  messagesPerSecond: number;
  rowsPerSecond: number;
  bytesPerSecond: number;
  lastMessageTime: number;
  totalMessages: number;
  totalRows: number;
  totalBytes: number;
}

interface ArrowWebSocketHook {
  isConnected: boolean;
  lastBatch: RecordBatch | null;
  schema: any;
  stats: Stats;
  connect: (url: string) => void;
  disconnect: () => void;
  error: string | null;
}

const initialStats: Stats = {
  messagesPerSecond: 0,
  rowsPerSecond: 0,
  bytesPerSecond: 0,
  lastMessageTime: 0,
  totalMessages: 0,
  totalRows: 0,
  totalBytes: 0,
};

export const useArrowWebSocket = (): ArrowWebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBatch, setLastBatch] = useState<RecordBatch | null>(null);
  const [schema, setSchema] = useState<any>(null);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const statsRef = useRef<Stats>({...initialStats});
  const statsIntervalRef = useRef<number | null>(null);
  const lastMessagesRef = useRef<number[]>([]);
  
  // Calculate stats every second
  const calculateStats = useCallback(() => {
    const now = Date.now();
    // Keep only messages from the last second for rate calculation
    const recentMessages = lastMessagesRef.current.filter(time => now - time < 1000);
    lastMessagesRef.current = recentMessages;
    
    if (recentMessages.length > 0) {
      setStats(prev => ({
        ...prev,
        messagesPerSecond: recentMessages.length,
      }));
    }
    
    // Update other stats based on accumulated totals
    const timeDiff = (now - statsRef.current.lastMessageTime) / 1000;
    if (timeDiff > 0 && statsRef.current.totalMessages > 0) {
      setStats({
        ...statsRef.current,
        rowsPerSecond: statsRef.current.totalRows / timeDiff,
        bytesPerSecond: statsRef.current.totalBytes / timeDiff,
      });
    }
  }, []);
  
  // Parse Arrow IPC buffer
  const parseArrowData = useCallback((buffer: ArrayBuffer) => {
    try {
      // Convert ArrayBuffer to Arrow Table using tableFromIPC
      const table = tableFromIPC(buffer);
      
      if (!table || table.numRows === 0 || table.batches.length === 0) {
        console.warn('Received empty Arrow table');
        return null;
      }
      
      // Get the first batch
      const batch = table.batches[0];
      
      // Extract schema information
      const schemaObj = { 
        fields: batch.schema.fields.map((f: any) => ({
          name: f.name,
          type: f.type.toString(),
          nullable: f.nullable
        }))
      };
      
      return { batch, schema: schemaObj, table };
    } catch (error) {
      console.error('Error parsing Arrow IPC data:', error);
      throw error;
    }
  }, []);
  
  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      // Process binary data as Arrow RecordBatch
      const data = event.data;
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        // Convert Blob to ArrayBuffer if needed
        const processBuffer = async (buffer: ArrayBuffer) => {
          try {
            // Track message receipt time for rate calculation
            const now = Date.now();
            lastMessagesRef.current.push(now);
            
            // Parse the Arrow IPC data
            const result = parseArrowData(buffer);
            
            if (result) {
              const { batch, schema: schemaObj } = result;
              
              // Update state with batch and schema
              setLastBatch(batch);
              setSchema(schemaObj);
              
              // Update stats
              const messageSize = buffer.byteLength;
              const rowCount = batch.numRows;
              
              statsRef.current = {
                ...statsRef.current,
                lastMessageTime: now,
                totalMessages: statsRef.current.totalMessages + 1,
                totalRows: statsRef.current.totalRows + rowCount,
                totalBytes: statsRef.current.totalBytes + messageSize,
              };
              
              // Clear any previous errors
              if (error) setError(null);
            }
          } catch (e) {
            setError(`Error processing arrow data: ${e instanceof Error ? e.message : String(e)}`);
            console.error('Error processing arrow data:', e);
          }
        };
        
        if (data instanceof Blob) {
          data.arrayBuffer().then(processBuffer);
        } else {
          processBuffer(data);
        }
      }
    } catch (e) {
      setError(`Failed to process message: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [error, parseArrowData]);
  
  // Connect to WebSocket
  const connect = useCallback((url: string) => {
    try {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Reset stats
      statsRef.current = {...initialStats, lastMessageTime: Date.now()};
      setStats(statsRef.current);
      lastMessagesRef.current = [];
      setError(null);
      
      const socket = new WebSocket(url);
      
      socket.binaryType = 'arraybuffer';
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
      };
      
      socket.onmessage = handleMessage;
      
      socket.onerror = (event) => {
        const errorMsg = `WebSocket error: ${event.type}`;
        console.error(errorMsg);
        setError(errorMsg);
        setIsConnected(false);
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };
      
      socketRef.current = socket;
      
      // Start stats calculation interval
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      
      statsIntervalRef.current = window.setInterval(calculateStats, 200);
    } catch (e) {
      setError(`Failed to connect: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [handleMessage, calculateStats]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    isConnected,
    lastBatch,
    schema,
    stats,
    connect,
    disconnect,
    error,
  };
}; 