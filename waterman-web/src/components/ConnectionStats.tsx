import { Paper, Grid, Text, Title, Group, Badge } from '@mantine/core';
import { Stats } from '../hooks/useArrowWebSocket';

interface StatsProps {
  stats: Stats;
  isConnected: boolean;
}

export function ConnectionStats({ stats, isConnected }: StatsProps) {
  const formatNumber = (num: number, decimals = 2) => {
    if (num > 1000000) {
      return `${(num / 1000000).toFixed(decimals)} M`;
    } else if (num > 1000) {
      return `${(num / 1000).toFixed(decimals)} K`;
    }
    return num.toFixed(decimals);
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes > 1073741824) {
      return `${(bytes / 1073741824).toFixed(2)} GB`;
    } else if (bytes > 1048576) {
      return `${(bytes / 1048576).toFixed(2)} MB`;
    } else if (bytes > 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes.toFixed(0)} B`;
  };

  // Color coding based on rate values
  const getColorForRate = (rate: number, type: 'messages' | 'rows' | 'bytes') => {
    if (!isConnected) return "dimmed";
    
    // Different thresholds for different types
    if (type === 'messages') {
      if (rate === 0) return "red";
      if (rate < 5) return "orange";
      return "green";
    } else if (type === 'rows') {
      if (rate === 0) return "red";
      if (rate < 100) return "orange";
      return "blue";
    } else { // bytes
      if (rate === 0) return "red";
      if (rate < 1024) return "orange";
      return "violet";
    }
  };
  
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={4}>Connection Statistics</Title>
        <Badge 
          color={isConnected ? "green" : "red"} 
          variant="filled"
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </Group>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Messages/sec:</Text>
              <Text 
                size="sm" 
                fw={700} 
                c={getColorForRate(stats.messagesPerSecond, 'messages')}
              >
                {formatNumber(stats.messagesPerSecond, 0)}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Rows/sec:</Text>
              <Text 
                size="sm" 
                fw={700} 
                c={getColorForRate(stats.rowsPerSecond, 'rows')}
              >
                {formatNumber(stats.rowsPerSecond, 0)}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Data rate:</Text>
              <Text 
                size="sm" 
                fw={700} 
                c={getColorForRate(stats.bytesPerSecond, 'bytes')}
              >
                {`${formatBytes(stats.bytesPerSecond)}/s`}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Total messages:</Text>
              <Text size="sm" fw={700}>{formatNumber(stats.totalMessages, 0)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Total rows:</Text>
              <Text size="sm" fw={700}>{formatNumber(stats.totalRows, 0)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">Total data:</Text>
              <Text size="sm" fw={700}>{formatBytes(stats.totalBytes)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  );
} 