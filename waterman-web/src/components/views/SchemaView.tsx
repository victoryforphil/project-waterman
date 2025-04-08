import { Container, Grid, Title, Paper, Code, Box } from '@mantine/core'
import { useArrowWebSocket } from '../../hooks/useArrowWebSocket'
import { SchemaDisplay } from '../SchemaDisplay'

/**
 * SchemaView - Schema display component
 * 
 * Shows the Arrow RecordBatch schema details
 */
export function SchemaView() {
  const { schema } = useArrowWebSocket();

  return (
    <Container size="100%" py="xl">
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Title order={2} mb="md">Schema Information</Title>
        </Grid.Col>
        
        <Grid.Col span={12}>
          <SchemaDisplay schema={schema} />
        </Grid.Col>
        
        {schema && (
          <Grid.Col span={12}>
            <Paper withBorder p="md">
              <Title order={4} mb="md">Raw Schema Data</Title>
              <Box component="pre" style={{ maxHeight: '500px', overflow: 'auto' }}>
                <Code block>
                  {JSON.stringify(schema, null, 2)}
                </Code>
              </Box>
            </Paper>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  )
} 