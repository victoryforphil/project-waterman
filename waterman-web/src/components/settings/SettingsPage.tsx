import { useEffect, useState } from 'react';
import { Container, Grid, Tabs, Title, Alert, Button } from '@mantine/core';
import { IconSettings, IconChartBar, IconServer, IconNetwork } from '@tabler/icons-react';
import { useParameters } from '../../hooks/useParameters';
import { DataVolumeSettings } from './DataVolumeSettings';
import { DataCharacteristicsSettings } from './DataCharacteristicsSettings';
import { WebSocketSettings } from './WebSocketSettings';
import { ServerStatus } from './ServerStatus';

interface SettingsPageProps {
  apiBaseUrl?: string;
}

export function SettingsPage({ apiBaseUrl = 'http://localhost:3031' }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<string | null>('data-volume');
  
  const {
    dataVolumeParams,
    dataCharacteristicsParams,
    webSocketParams,
    serverStatus,
    loading,
    error,
    fetchDataVolumeParams,
    fetchDataCharacteristicsParams,
    fetchWebSocketParams,
    fetchServerStatus,
    updateDataVolumeParams,
    updateDataCharacteristicsParams,
    updateWebSocketParams,
  } = useParameters({ baseUrl: apiBaseUrl });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAll = async () => {
      await fetchDataVolumeParams();
      await fetchDataCharacteristicsParams();
      await fetchWebSocketParams();
      await fetchServerStatus();
    };
    
    fetchAll();
    
    // Set up periodic refresh of status
    const statusInterval = setInterval(() => {
      fetchServerStatus();
    }, 5000);
    
    return () => clearInterval(statusInterval);
  }, []);

  return (
    <Container size="xl" py="xl">
      <Grid mb="xl">
        <Grid.Col span={12}>
          <Title order={2} mb="lg">Data Stream Settings</Title>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab 
                value="data-volume" 
                leftSection={<IconChartBar size={16} />}
              >
                Data Volume
              </Tabs.Tab>
              <Tabs.Tab 
                value="data-characteristics" 
                leftSection={<IconSettings size={16} />}
              >
                Data Characteristics
              </Tabs.Tab>
              <Tabs.Tab 
                value="websocket" 
                leftSection={<IconNetwork size={16} />}
              >
                WebSocket
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="data-volume" pt="md">
              <DataVolumeSettings 
                params={dataVolumeParams}
                loading={loading}
                onUpdate={updateDataVolumeParams}
              />
            </Tabs.Panel>

            <Tabs.Panel value="data-characteristics" pt="md">
              <DataCharacteristicsSettings 
                params={dataCharacteristicsParams}
                loading={loading}
                onUpdate={updateDataCharacteristicsParams}
              />
            </Tabs.Panel>

            <Tabs.Panel value="websocket" pt="md">
              <WebSocketSettings 
                params={webSocketParams}
                loading={loading}
                onUpdate={updateWebSocketParams}
              />
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <ServerStatus 
            status={serverStatus}
            loading={loading}
            error={error}
            onRefresh={fetchServerStatus}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
} 