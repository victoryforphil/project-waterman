import { useEffect } from 'react';
import { Switch, Select, Stack, Button, Group, Paper, Title, Divider, LoadingOverlay, Tooltip, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { DataCharacteristicsParams, DataType, SignalPattern } from '../../types/parameters';

interface DataCharacteristicsSettingsProps {
  params: DataCharacteristicsParams | null;
  loading: boolean;
  onUpdate: (params: DataCharacteristicsParams) => void;
}

export function DataCharacteristicsSettings({ params, loading, onUpdate }: DataCharacteristicsSettingsProps) {
  const form = useForm<DataCharacteristicsParams>({
    initialValues: {
      data_type: DataType.Float64,
      include_missing_data: false,
      include_data_gaps: false,
      signal_pattern: SignalPattern.SineWave,
      include_outliers: false,
    },
  });

  useEffect(() => {
    if (params) {
      form.setValues(params);
    }
  }, [params]);

  const handleSubmit = (values: DataCharacteristicsParams) => {
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
      <Title order={3} mb="md">Data Characteristics Settings</Title>
      <Divider mb="md" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label={
              <LabelWithTooltip 
                label="Data Type" 
                tooltip="Defines the data type format used in the generated data stream. Different types impact memory usage and processing performance."
              />
            }
            description="Type of data to generate"
            data={[
              { value: DataType.Float32, label: 'Float32' },
              { value: DataType.Float64, label: 'Float64' },
              { value: DataType.Int32, label: 'Int32' },
              { value: DataType.Array, label: 'Array' },
              { value: DataType.NestedObject, label: 'Nested Object' },
            ]}
            {...form.getInputProps('data_type')}
          />

          <Select
            label={
              <LabelWithTooltip 
                label="Signal Pattern" 
                tooltip="Controls the pattern of the generated data. Each pattern has different characteristics that can test various aspects of data processing."
              />
            }
            description="Pattern of data to generate"
            data={[
              { value: SignalPattern.SineWave, label: 'Sine Wave' },
              { value: SignalPattern.RandomNoise, label: 'Random Noise' },
              { value: SignalPattern.StepFunction, label: 'Step Function' },
              { value: SignalPattern.ImpulseResponse, label: 'Impulse Response' },
              { value: SignalPattern.Mixed, label: 'Mixed Patterns' },
            ]}
            {...form.getInputProps('signal_pattern')}
          />

          <Switch
            label={
              <LabelWithTooltip 
                label="Include Missing Data" 
                tooltip="When enabled, some data points will be intentionally missing (null). This tests how the application handles data gaps."
              />
            }
            description="Some data points will be missing or null"
            {...form.getInputProps('include_missing_data', { type: 'checkbox' })}
          />

          <Switch
            label={
              <LabelWithTooltip 
                label="Include Data Gaps" 
                tooltip="Simulates time gaps in the data stream, useful for testing discontinuity handling and interpolation algorithms."
              />
            }
            description="Simulate gaps in the data stream"
            {...form.getInputProps('include_data_gaps', { type: 'checkbox' })}
          />

          <Switch
            label={
              <LabelWithTooltip 
                label="Include Outliers" 
                tooltip="Adds occasional outliers and spikes to the data, useful for testing anomaly detection and filtering capabilities."
              />
            }
            description="Add occasional outlier/spike values"
            {...form.getInputProps('include_outliers', { type: 'checkbox' })}
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