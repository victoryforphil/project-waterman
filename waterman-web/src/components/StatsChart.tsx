import { useEffect, useState } from 'react';
import { Paper, Title, Divider, SegmentedControl } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Stats } from '../hooks/useArrowWebSocket';

interface StatsChartProps {
  stats: Stats;
  isConnected: boolean;
}

interface ChartDataPoint {
  time: string;
  messagesPerSecond: number;
  rowsPerSecond: number;
  bytesPerSecond: number;
}

export function StatsChart({ stats, isConnected }: StatsChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<'messages' | 'rows' | 'bytes'>('messages');
  
  // Update chart data with current stats
  useEffect(() => {
    if (isConnected) {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setChartData(prevData => {
        // Keep only the last 30 data points
        const newData = [...prevData, {
          time: timeString,
          messagesPerSecond: stats.messagesPerSecond,
          rowsPerSecond: stats.rowsPerSecond,
          bytesPerSecond: stats.bytesPerSecond,
        }];
        
        if (newData.length > 30) {
          return newData.slice(newData.length - 30);
        }
        
        return newData;
      });
    }
  }, [stats, isConnected]);
  
  // Format Y-axis tick values
  const formatYAxis = (value: number) => {
    if (chartType === 'bytes') {
      if (value > 1048576) {
        return `${(value / 1048576).toFixed(1)} MB`;
      } else if (value > 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
      }
      return `${value.toFixed(1)} B`;
    }
    
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(1);
  };
  
  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">Performance Monitor</Title>
      
      <SegmentedControl
        value={chartType}
        onChange={(value) => setChartType(value as 'messages' | 'rows' | 'bytes')}
        data={[
          { label: 'Messages/s', value: 'messages' },
          { label: 'Rows/s', value: 'rows' },
          { label: 'Bytes/s', value: 'bytes' },
        ]}
        mb="md"
      />
      
      <Divider mb="md" />
      
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={(value: number) => {
                if (chartType === 'bytes') {
                  if (value > 1048576) {
                    return [`${(value / 1048576).toFixed(2)} MB`, 'Rate'];
                  } else if (value > 1024) {
                    return [`${(value / 1024).toFixed(2)} KB`, 'Rate'];
                  }
                  return [`${value.toFixed(2)} B`, 'Rate'];
                }
                return [value.toFixed(2), 'Rate'];
              }}
            />
            <Legend />
            {chartType === 'messages' && (
              <Line 
                type="monotone" 
                dataKey="messagesPerSecond" 
                name="Messages/sec" 
                stroke="#2C8A52" 
                activeDot={{ r: 8 }} 
              />
            )}
            {chartType === 'rows' && (
              <Line 
                type="monotone" 
                dataKey="rowsPerSecond" 
                name="Rows/sec" 
                stroke="#339AF0" 
                activeDot={{ r: 8 }} 
              />
            )}
            {chartType === 'bytes' && (
              <Line 
                type="monotone" 
                dataKey="bytesPerSecond" 
                name="Bytes/sec" 
                stroke="#845EF7" 
                activeDot={{ r: 8 }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
} 