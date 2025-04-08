import { Container, Grid, Title, Paper, Text } from '@mantine/core'
import { useArrowWebSocket } from '../../hooks/useArrowWebSocket'
import { DataTable } from '../DataTable'

/**
 * TableView - Data table view component
 * 
 * Displays Arrow RecordBatch data in a tabular format
 */
export function TableView() {
  const { 
    isConnected, 
    lastBatch
  } = useArrowWebSocket();

  return (
    <Container size="100%" py="xl">
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Title order={2} mb="md">Data Table</Title>
        </Grid.Col>
        
        <Grid.Col span={12}>
          {isConnected ? (
            <DataTable recordBatch={lastBatch} />
          ) : (
            <Paper withBorder p="xl" style={{ textAlign: 'center' }}>
              <Text size="lg" c="dimmed">
                Connect to WebSocket to view data
              </Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  )
} 