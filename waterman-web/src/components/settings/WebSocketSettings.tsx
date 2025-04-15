import { useEffect } from 'react';
import { NumberInput, Switch, Stack, Button, Group, Paper, Title, Divider, LoadingOverlay, Tooltip, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { WebSocketParams } from '../../types/parameters';

interface WebSocketSettingsProps {
  params: WebSocketParams | null;
  loading: boolean;
  onUpdate: (params: WebSocketParams) => void;
}

export function WebSocketSettings({ params, loading, onUpdate }: WebSocketSettingsProps) {
  const form = useForm<WebSocketParams>({
    initialValues: {
      batch_size: 10,
      message_size: 0, // auto
      message_frequency: 100,
      simulate_disconnects: false,
      simulate_latency: false,
      latency_ms: 0,
      disconnection_probability: 0,
    },
    validate: {
      batch_size: (value: number) => (value < 1 ? 'Batch size must be at least 1' : null),
      message_size: (value: number) => (value < 0 ? 'Message size cannot be negative' : null),
      message_frequency: (value: number) => (value <= 0 ? 'Message frequency must be positive' : null),
      latency_ms: (value: number) => (value < 0 ? 'Latency cannot be negative' : null),
      disconnection_probability: (value: number) => (
        value < 0 || value > 1 ? 'Probability must be between 0 and 1' : null
      ),
    },
  });

  useEffect(() => {
    if (params) {
      form.setValues(params);
    }
  }, [params]);

  const handleSubmit = (values: WebSocketParams) => {
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
      <Title order={3} mb="md">WebSocket Settings</Title>
      <Divider mb="md" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <NumberInput
            label={
              <LabelWithTooltip 
                label="Batch Size" 
                tooltip="Defines how many data points are sent in a single WebSocket message. Higher values reduce overhead but increase message size."
              />
            }
            description="Number of data points per message"
            min={1}
            max={10000}
            step={1}
            {...form.getInputProps('batch_size')}
          />

          <NumberInput
            label={
              <LabelWithTooltip 
                label="Message Size (bytes)" 
                tooltip="Controls the size of each WebSocket message. Set to 0 for automatic sizing based on data content."
              />
            }
            description="Size of each message in bytes (0 = auto)"
            min={0}
            step={100}
            {...form.getInputProps('message_size')}
          />

          <NumberInput
            label={
              <LabelWithTooltip 
                label="Message Frequency (Hz)" 
                tooltip="Determines how many messages are sent per second, which may differ from the actual data sampling rate."
              />
            }
            description="How often messages are sent (may differ from data rate)"
            min={0.1}
            max={10000}
            step={1}
            {...form.getInputProps('message_frequency')}
          />

          <Switch
            label={
              <LabelWithTooltip 
                label="Simulate Network Disconnects" 
                tooltip="When enabled, the system will randomly disconnect the WebSocket connection to test reconnection handling."
              />
            }
            description="Randomly disconnect the WebSocket connection"
            {...form.getInputProps('simulate_disconnects', { type: 'checkbox' })}
          />

          {form.values.simulate_disconnects && (
            <NumberInput
              label={
                <LabelWithTooltip 
                  label="Disconnection Probability" 
                  tooltip="The probability (between 0-1) that the connection will be dropped on any given message. Higher values cause more frequent disconnections."
                />
              }
              description="Probability of disconnection per message (0-1)"
              min={0}
              max={1}
              step={0.01}
              {...form.getInputProps('disconnection_probability')}
            />
          )}

          <Switch
            label={
              <LabelWithTooltip 
                label="Simulate Network Latency" 
                tooltip="When enabled, the system will add artificial delay to WebSocket messages to simulate network lag."
              />
            }
            description="Add artificial delay to messages"
            {...form.getInputProps('simulate_latency', { type: 'checkbox' })}
          />

          {form.values.simulate_latency && (
            <NumberInput
              label={
                <LabelWithTooltip 
                  label="Latency (ms)" 
                  tooltip="The amount of artificial delay in milliseconds to add to each message, simulating network latency conditions."
                />
              }
              description="Artificial latency to add to messages"
              min={0}
              max={10000}
              step={10}
              {...form.getInputProps('latency_ms')}
            />
          )}

          <Group justify="flex-end" mt="md">
            <Tooltip label="Save the current WebSocket settings to the server" position="top">
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