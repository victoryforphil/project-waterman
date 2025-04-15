import { useMemo } from 'react';
import { Paper, Title, Divider, Box, ScrollArea } from '@mantine/core';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { RecordBatch } from 'apache-arrow';

interface DataTableProps {
  recordBatch: RecordBatch | null;
}

export function DataTable({ recordBatch }: DataTableProps) {
  // Convert RecordBatch to array of objects for MantineReactTable
  const data = useMemo(() => {
    if (!recordBatch) return [];
    
    const rows = [];
    for (let i = 0; i < recordBatch.numRows; i++) {
      const row: Record<string, any> = {};
      recordBatch.schema.fields.forEach((field) => {
        const column = recordBatch.getChildAt(recordBatch.schema.fields.findIndex(f => f.name === field.name));
        if (column) {
          row[field.name] = column.get(i)?.toString() ?? null;
        }
      });
      rows.push(row);
    }
    return rows;
  }, [recordBatch]);
  
  // Create columns configuration
  const columns = useMemo<MRT_ColumnDef<Record<string, any>>[]>(() => {
    if (!recordBatch) return [];
    
    return recordBatch.schema.fields.map((field) => ({
      accessorKey: field.name,
      header: field.name,
      // Using smaller width for columns to fit more in view
      size: 120,
      minSize: 80,
      maxSize: 200,
    }));
  }, [recordBatch]);
  
  if (!recordBatch) {
    return (
      <Paper p="md" withBorder h="100%">
        <Title order={4} mb="md">Data</Title>
        <Divider mb="md" />
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          No data available yet
        </div>
      </Paper>
    );
  }
  
  return (
    <Paper p="md" withBorder h="100%">
      <Title order={4} mb="md">Data</Title>
      <Divider mb="md" />
      <Box style={{ overflow: 'auto' }}>
        <MantineReactTable
          columns={columns}
          data={data}
          enableTableHead
          enableColumnResizing
          enablePinning
          enableRowVirtualization
          enableColumnVirtualization
          enableGlobalFilter={false}
          enableRowSelection={false}
          enableDensityToggle={true}
          enableFullScreenToggle={true}
          enablePagination
          initialState={{
            pagination: {
              pageIndex: 0,
              pageSize: 10,
            },
            density: 'xs',
            columnVisibility: {},
          }}
          mantinePaperProps={{
            shadow: 'none',
            withBorder: false,
            style: { maxWidth: '100%' }
          }}
          mantineTableContainerProps={{
            style: { maxWidth: '100%' }
          }}
          mantineTableProps={{
            striped: true,
            highlightOnHover: true,
            withColumnBorders: true,
            style: { tableLayout: 'auto' }
          }}
        />
      </Box>
    </Paper>
  );
} 