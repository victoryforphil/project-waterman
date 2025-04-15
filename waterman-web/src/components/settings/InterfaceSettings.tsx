import { 
  Paper,
  Switch,
  Group,
  Title,
  Text,
  Stack,
  Divider,
} from '@mantine/core';
import { IconRocket, IconTable } from '@tabler/icons-react';
import { useFastMode } from '../../hooks/useFastMode';

export function InterfaceSettings() {
  const { fastMode, setFastMode } = useFastMode();
  
  return (
    <Paper p="md" shadow="sm">
      <Title order={3} mb="md">Interface Settings</Title>
      
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <IconRocket size={20} />
            <div>
              <Text fw={500}>Fast Mode</Text>
              <Text size="xs" c="dimmed">
                Hides data table and schema display to improve performance
              </Text>
            </div>
          </Group>
          <Switch
            checked={fastMode}
            onChange={(event) => setFastMode(event.currentTarget.checked)}
            size="md"
            color="teal"
          />
        </Group>
        
        <Divider />
        
        <Text size="sm" c="dimmed" fs="italic">
          Fast Mode is recommended when dealing with high-frequency data streams to reduce browser load.
          When enabled, detailed data visualization will be hidden, but data will still be processed in the background.
        </Text>
      </Stack>
    </Paper>
  );
} 