import { useState, useEffect } from 'react';
import { TextInput, Group, Button, Paper, Title, Text, Switch } from '@mantine/core';

interface ConnectionSettingsProps {
  onConnect: (url: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  error: string | null;
}

export function ConnectionSettings({ 
  onConnect, 
  onDisconnect, 
  isConnected, 
  error 
}: ConnectionSettingsProps) {
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3031');
  const [secure, setSecure] = useState(false);
  const [path, setPath] = useState('/ws');
  
  // Construct WebSocket URL
  const getWebSocketUrl = () => {
    const protocol = secure ? 'wss' : 'ws';
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}://${host}:${port}${formattedPath}`;
  };
  
  // Handle connect button click
  const handleConnect = () => {
    onConnect(getWebSocketUrl());
  };
  
  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="sm">Connection Settings</Title>
      
      <Group align="end" mb="sm">
        <TextInput
          label="Host"
          placeholder="localhost"
          value={host}
          onChange={(event) => setHost(event.currentTarget.value)}
          disabled={isConnected}
        />
        
        <TextInput
          label="Port"
          placeholder="3031"
          value={port}
          onChange={(event) => setPort(event.currentTarget.value)}
          disabled={isConnected}
        />
        
        <TextInput
          label="Path"
          placeholder="/ws"
          value={path}
          onChange={(event) => setPath(event.currentTarget.value)}
          disabled={isConnected}
        />
      </Group>
      
      <Group mb="sm">
        <Switch
          label="Secure WebSocket (WSS)"
          checked={secure}
          onChange={(event) => setSecure(event.currentTarget.checked)}
          disabled={isConnected}
        />
      </Group>
      
      <Group mb={error ? "sm" : 0}>
        {!isConnected ? (
          <Button onClick={handleConnect} color="blue">
            Connect
          </Button>
        ) : (
          <Button onClick={onDisconnect} color="red">
            Disconnect
          </Button>
        )}
        
        <Text c={isConnected ? "green" : "gray"}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </Group>
      
      {error && <Text c="red" size="sm">{error}</Text>}
    </Paper>
  );
} 