
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
import { ChartDataItem } from '@/types/hotspots';

interface OutcomesChartProps {
  data: ChartDataItem[];
}

const OutcomesChart: React.FC<OutcomesChartProps> = ({ data }) => {
  return (
    <ChartCard title="Desfechos de Apreensão">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
          barSize={25}
        >
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
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
            <LabelList dataKey="value" position="top" style={{ fontSize: '11px' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default OutcomesChart;
