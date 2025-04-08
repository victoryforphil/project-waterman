import { Container, Grid, Title, Paper } from '@mantine/core'
import { useArrowWebSocket } from '../../hooks/useArrowWebSocket'
import { ConnectionStats } from '../ConnectionStats'
import { StatsChart } from '../StatsChart'

/**
 * StatsView - Statistics view component
 * 
 * Displays Arrow WebSocket connection statistics
 */
export function StatsView() {
  const { 
    isConnected, 
    stats
  } = useArrowWebSocket();

  return (
    <Container size="100%" py="xl">
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Title order={2} mb="md">Connection Statistics</Title>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ConnectionStats 
            stats={stats}
            isConnected={isConnected}
          />
        </Grid.Col>
        
        <Grid.Col span={12}>
          <StatsChart 
            stats={stats}
            isConnected={isConnected}
          />
        </Grid.Col>
      </Grid>
    </Container>
  )
} 