
import { MantineProvider, Container, Grid, AppShell, Text, Group, Title } from '@mantine/core'
import { useArrowWebSocket } from './hooks/useArrowWebSocket'
import { ConnectionSettings } from './components/ConnectionSettings'
import { ConnectionStats } from './components/ConnectionStats'
import { SchemaDisplay } from './components/SchemaDisplay'
import { DataTable } from './components/DataTable'
import { StatsChart } from './components/StatsChart'

import '@mantine/core/styles.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/code-highlight/styles.css';
import { theme } from './theme'
import './index.css'
function App() {
  const { 
    isConnected, 
    lastBatch, 
    schema, 
    stats, 
    connect, 
    disconnect, 
    error
  } = useArrowWebSocket();

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AppShell header={{ height: 70 }}>
        <AppShell.Header p="md">
          <Group justify="space-between">
            <Title order={2}>Waterman WebSocket Client</Title>
            <Text>Arrow RecordBatch WebSocket Monitor</Text>
          </Group>
        </AppShell.Header>
        
        <AppShell.Main>
          <Container size="100%" py="xl">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <ConnectionSettings 
                  onConnect={connect}
                  onDisconnect={disconnect}
                  isConnected={isConnected}
                  error={error}
                />
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
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <SchemaDisplay schema={schema} />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 8 }}>
                <DataTable recordBatch={lastBatch} />
              </Grid.Col>
            </Grid>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  )
}

export default App
