
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
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
    <ChartCard title="Espécies Mais Apreendidas">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
          barSize={25}
          layout="vertical"
        >
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            width={120}
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
            <LabelList dataKey="quantidade" position="right" style={{ fontSize: '11px' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SeizedSpeciesChart;
