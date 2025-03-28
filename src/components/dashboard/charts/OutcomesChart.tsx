
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from 'recharts';
import ChartCard from '../ChartCard';
import { CustomTooltip } from './ChartUtils';
import { ChartDataItem } from '@/types/hotspots';

interface OutcomesChartProps {
  data: ChartDataItem[];
}

const OutcomesChart: React.FC<OutcomesChartProps> = ({ data }) => {
  return (
    <ChartCard title="Desfechos de Apreensão" subtitle="Resultado das apreensões realizadas">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 30, bottom: 40 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar 
            dataKey="value" 
            name="Quantidade" 
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]} 
          >
            <LabelList dataKey="value" position="top" style={{ fontSize: '12px', fontWeight: 'bold' }} fill="#666" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default OutcomesChart;
