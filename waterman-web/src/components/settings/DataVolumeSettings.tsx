import { useEffect } from 'react';
import { NumberInput, Select, Stack, Button, Group, Paper, Title, Divider, LoadingOverlay, Tooltip, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { DataVolumeParams, TestDuration } from '../../types/parameters';

interface DataVolumeSettingsProps {
  params: DataVolumeParams | null;
  loading: boolean;
  onUpdate: (params: DataVolumeParams) => void;
}

export function DataVolumeSettings({ params, loading, onUpdate }: DataVolumeSettingsProps) {
  const form = useForm<DataVolumeParams>({
    initialValues: {
      num_channels: 10,
      float_precision: 1e8,
      data_rate_hz: 100,
      test_duration: TestDuration.Medium,
    },
    validate: {
      num_channels: (value: number) => (value < 1 ? 'Number of channels must be at least 1' : null),
      float_precision: (value: number) => (value <= 0 ? 'Precision must be positive' : null),
      data_rate_hz: (value: number) => (value <= 0 ? 'Data rate must be positive' : null),
    },
  });

  useEffect(() => {
    if (params) {
      form.setValues(params);
    }
  }, [params]);

  const handleSubmit = (values: DataVolumeParams) => {
    onUpdate(values);
  };

  // Label with tooltip helper component
  const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <Group gap="xs">
      <Text>{label}</Text>
      <Tooltip
        label={tooltip}
        position="top"
        withArrow
        arrowSize={6}
        transitionProps={{ transition: 'pop' }}
        multiline
        w={220}
      >
        <IconInfoCircle size={16} style={{ cursor: 'help' }} />
      </Tooltip>
    </Group>
  );

  return (
    <Paper p="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      <Title order={3} mb="md">Data Volume Settings</Title>
      <Divider mb="md" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <NumberInput
            label={
              <LabelWithTooltip 
                label="Number of Channels" 
                tooltip="Controls how many separate data channels are generated. Higher values increase CPU and memory load."
              />
            }
            description="Number of data channels to generate (1, 10, 100, 1000)"
            min={1}
            max={1000}
            step={1}
            {...form.getInputProps('num_channels')}
          />

          <NumberInput
            label={
              <LabelWithTooltip 
                label="Floating Point Precision" 
                tooltip="Sets the maximum precision of floating point values. Higher values test numerical precision and can impact performance."
              />
            }
            description="Precision for floating point values (1e4, 1e8, 1e16, 1e32)"
            min={1}
            step={1000}
            {...form.getInputProps('float_precision')}
          />

          <NumberInput
            label={
              <LabelWithTooltip 
                label="Data Rate (Hz)" 
                tooltip="Controls how frequently data is generated per second. Higher rates increase CPU usage and network bandwidth."
              />
            }
            description="The rate at which data is generated (50Hz, 500Hz, 50kHz)"
            min={0.1}
            max={100000}
            step={10}
            {...form.getInputProps('data_rate_hz')}
          />

          <Select
            label={
              <LabelWithTooltip 
                label="Test Duration" 
                tooltip="Determines how long the data streaming test will run before automatically stopping."
              />
            }
            description="How long the test should run"
            data={[
              { value: TestDuration.Short, label: 'Short (10s)' },
              { value: TestDuration.Medium, label: 'Medium (100s)' },
              { value: TestDuration.Long, label: 'Long (1000s)' },
              { value: TestDuration.Hour, label: 'Hour (3600s)' },
              { value: TestDuration.OpenEnded, label: 'Open-ended' },
            ]}
            {...form.getInputProps('test_duration')}
          />

          <Group justify="flex-end" mt="md">
            <Tooltip label="Save the current settings to the server" position="top">
              <Button type="submit" color="blue">
                Save Changes
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
} 