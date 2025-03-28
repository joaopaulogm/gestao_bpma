
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import ChartCard from '../ChartCard';
import { ChartDataItem } from '@/types/hotspots';
import { CustomTooltip } from './ChartUtils';

interface DestinacaoTiposBarChartProps {
  data: ChartDataItem[];
}

const DestinacaoTiposBarChart = ({ data }: DestinacaoTiposBarChartProps) => {
  return (
    <ChartCard title="Detalhamento por Tipo de Destinação" subtitle="Visualização detalhada por tipo">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name="Quantidade" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
          >
            <LabelList 
              dataKey="value" 
              position="top" 
              fill="#666" 
              fontSize={12} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DestinacaoTiposBarChart;
