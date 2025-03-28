
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
import { CustomTooltip } from './ChartUtils';

interface SpeciesChartProps {
  data: { name: string; quantidade: number }[];
  title: string;
  color: string;
}

const truncateName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

const SpeciesRescueChart: React.FC<SpeciesChartProps> = ({ data, title, color }) => {
  return (
    <ChartCard title={title} subtitle="Top 10 espécies">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={120}
            tickFormatter={(value) => truncateName(value, 15)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="quantidade" 
            name="Quantidade" 
            fill={color} 
            background={{ fill: "#f8fafc" }}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="quantidade" 
              position="right" 
              fill="#666" 
              fontSize={11} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SpeciesRescueChart;
