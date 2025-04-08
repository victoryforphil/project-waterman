import { Paper, Grid, Text, Title, Group } from '@mantine/core';
import { Stats } from '../hooks/useArrowWebSocket';

interface StatsProps {
  stats: Stats;
  isConnected: boolean;
}

export function ConnectionStats({ stats, isConnected }: StatsProps) {
  const formatNumber = (num: number) => {
    if (num > 1000000) {
      return `${(num / 1000000).toFixed(2)} M`;
    } else if (num > 1000) {
      return `${(num / 1000).toFixed(2)} K`;
    }
    return num.toFixed(2);
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes > 1073741824) {
      return `${(bytes / 1073741824).toFixed(2)} GB`;
    } else if (bytes > 1048576) {
      return `${(bytes / 1048576).toFixed(2)} MB`;
    } else if (bytes > 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes.toFixed(2)} B`;
  };
  
  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">Connection Statistics</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Messages/sec:</Text>
              <Text size="sm" fw={700} c={isConnected ? "green" : "dimmed"}>
                {isConnected ? formatNumber(stats.messagesPerSecond) : "0"}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Rows/sec:</Text>
              <Text size="sm" fw={700} c={isConnected ? "blue" : "dimmed"}>
                {isConnected ? formatNumber(stats.rowsPerSecond) : "0"}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Data rate:</Text>
              <Text size="sm" fw={700} c={isConnected ? "violet" : "dimmed"}>
                {isConnected ? `${formatBytes(stats.bytesPerSecond)}/s` : "0 B/s"}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Total messages:</Text>
              <Text size="sm" fw={700}>{formatNumber(stats.totalMessages)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Total rows:</Text>
              <Text size="sm" fw={700}>{formatNumber(stats.totalRows)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="xs" withBorder>
            <Group>
              <Text size="sm" fw={500} c="dimmed">Total data:</Text>
              <Text size="sm" fw={700}>{formatBytes(stats.totalBytes)}</Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Paper>
  );
} 