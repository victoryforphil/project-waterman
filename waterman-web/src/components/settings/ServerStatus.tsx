import { useEffect, useState } from 'react';
import { Paper, Title, Divider, LoadingOverlay, Text, Stack, Group, Button, Alert } from '@mantine/core';
import { IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import { ServerStatus as ServerStatusType } from '../../types/parameters';

interface ServerStatusProps {
  status: ServerStatusType | null;
  loading: boolean;
  onRefresh: () => void;
  error: string | null;
}

export function ServerStatus({ status, loading, onRefresh, error }: ServerStatusProps) {
  // Format milliseconds to human-readable time
  const formatTime = (ms: number | null | undefined) => {
    if (ms === null || ms === undefined) return 'N/A';
    
    // For small values, just show milliseconds
    if (ms < 1000) return `${ms}ms`;
    
    // Convert to seconds and show with ms precision
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    
    // Convert to minutes:seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  return (
    <Paper p="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      <Group justify="space-between" mb="md">
        <Title order={3}>Server Status</Title>
        <Button 
          leftSection={<IconRefresh size={16} />} 
          variant="subtle" 
          onClick={onRefresh} 
          loading={loading}
        >
          Refresh
        </Button>
      </Group>
      <Divider mb="md" />

      {error ? (
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Connection Error" 
          color="red" 
          variant="filled"
        >
          {error}
        </Alert>
      ) : !status ? (
        <Text c="dimmed">No status data available. Click refresh to fetch status.</Text>
      ) : (
        <Stack gap="md">
          <Group>
            <Text fw={500} size="sm" w={160}>Server Uptime:</Text>
            <Text>{formatTime(status.time_ms)}</Text>
          </Group>

          <Group>
            <Text fw={500} size="sm" w={160}>Last Update:</Text>
            <Text>{status.last_update_ms ? formatTime(status.last_update_ms) : 'None'}</Text>
          </Group>

          <Group>
            <Text fw={500} size="sm" w={160}>Current Data Rate:</Text>
            <Text>{status.data_rate_hz.toFixed(2)} Hz</Text>
          </Group>
        </Stack>
      )}
    </Paper>
  );
} 