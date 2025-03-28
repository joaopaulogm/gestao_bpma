
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

interface MotivosEntregaCEAPAChartProps {
  data: ChartDataItem[];
}

const MotivosEntregaCEAPAChart = ({ data }: MotivosEntregaCEAPAChartProps) => {
  if (data.length === 0) {
    return null;
  }
  
  return (
    <ChartCard title="Motivos de Entrega no CEAPA" subtitle="Principais causas de entrega">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 140, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name="Quantidade" 
            fill="#8b5cf6" 
            background={{ fill: "#f8fafc" }}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="value" 
              position="right" 
              fill="#666" 
              fontSize={12} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default MotivosEntregaCEAPAChart;
