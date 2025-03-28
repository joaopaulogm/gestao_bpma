
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import ChartCard from '../ChartCard';
import { CustomTooltip } from './ChartUtils';

interface SpeciesChartProps {
  data: { name: string; quantidade: number }[];
}

const SeizedSpeciesChart: React.FC<SpeciesChartProps> = ({ data }) => {
  return (
    <ChartCard title="Espécies Mais Apreendidas" subtitle="Top 10 espécies em apreensões">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 140, bottom: 20 }}
          barSize={25}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar 
            dataKey="quantidade" 
            name="Quantidade" 
            fill="#10b981" 
            radius={[0, 4, 4, 0]} 
          >
            <LabelList dataKey="quantidade" position="right" style={{ fontSize: '12px', fontWeight: 'bold' }} fill="#666" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SeizedSpeciesChart;
