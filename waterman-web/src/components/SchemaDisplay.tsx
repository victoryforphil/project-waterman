import { Paper, Title, Divider, Code } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface SchemaDisplayProps {
  schema: any;
}

export function SchemaDisplay({ schema }: SchemaDisplayProps) {
  if (!schema) {
    return (
      <Paper p="md" withBorder>
        <Title order={4} mb="md">Schema</Title>
        <Divider mb="md" />
        <Code block>// No schema available yet</Code>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">Schema</Title>
      <Divider mb="md" />
      <JsonView data={schema} />
    </Paper>
  );
} 