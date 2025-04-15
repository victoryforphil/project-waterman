import { useState } from 'react'
import { 
  MantineProvider, 
  Container, 
  Grid, 
  AppShell, 
  Text, 
  Group, 
  Title, 
  Tabs,
  ActionIcon,
  Box,
  Switch,
  Tooltip,
  Alert,
  Badge
} from '@mantine/core'
import { IconGauge, IconSettings, IconRocket, IconInfoCircle } from '@tabler/icons-react'
import { useArrowWebSocket } from './hooks/useArrowWebSocket'
import { ConnectionSettings } from './components/ConnectionSettings'
import { ConnectionStats } from './components/ConnectionStats'
import { SchemaDisplay } from './components/SchemaDisplay'
import { DataTable } from './components/DataTable'
import { StatsChart } from './components/StatsChart'
import { SettingsPage } from './components/settings/SettingsPage'
import { FastModeProvider, useFastMode } from './hooks/useFastMode'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/code-highlight/styles.css';
import { theme } from './theme'
import './index.css'

function AppContent() {
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');
  const { fastMode, setFastMode } = useFastMode();
  
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
    <AppShell header={{ height: 70 }}>
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Title order={2}>Waterman WebSocket Client</Title>
            {fastMode && (
              <Badge color="teal" size="lg" variant="light">
                <Group gap={5}><IconRocket size={14} /> Fast Mode</Group>
              </Badge>
            )}
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab 
                  value="dashboard" 
                  leftSection={<IconGauge size={16} />}
                >
                  Dashboard
                </Tabs.Tab>
                <Tabs.Tab 
                  value="settings" 
                  leftSection={<IconSettings size={16} />}
                >
                  Settings
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Group>
          <Group>
            <Tooltip label={fastMode ? "Disable Fast Mode" : "Enable Fast Mode (hides data table and schema)"}>
              <Switch
                checked={fastMode}
                onChange={(event) => setFastMode(event.currentTarget.checked)}
                size="md"
                label={<Group gap={5}><IconRocket size={16} /> Fast Mode</Group>}
                labelPosition="left"
                color="teal"
              />
            </Tooltip>
            <Text>Arrow RecordBatch WebSocket Monitor</Text>
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Main>
        {activeTab === 'dashboard' ? (
          <Container fluid py="xl" px="md">
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
              
              {fastMode ? (
                <Grid.Col span={12}>
                  <Alert 
                    title="Fast Mode Enabled" 
                    color="teal" 
                    icon={<IconInfoCircle />}
                    withCloseButton={false}
                  >
                    Data table and schema display are hidden to improve performance. 
                    Toggle Fast Mode off to view the full data.
                  </Alert>
                </Grid.Col>
              ) : (
                <Grid.Col span={12}>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, lg: 3 }}>
                      <SchemaDisplay schema={schema} />
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, lg: 9 }}>
                      <DataTable recordBatch={lastBatch} />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
              )}
            </Grid>
          </Container>
        ) : (
          <SettingsPage />
        )}
      </AppShell.Main>
    </AppShell>
  )
}

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <FastModeProvider>
        <AppContent />
      </FastModeProvider>
    </MantineProvider>
  )
}

export default App
