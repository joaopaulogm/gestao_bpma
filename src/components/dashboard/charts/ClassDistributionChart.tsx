
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import ChartCard from '../ChartCard';
import { CHART_COLORS, CustomTooltip, renderCustomizedLabel } from './ChartUtils';
import { ChartDataItem } from '@/types/hotspots';

interface ClassDistributionChartProps {
  data: ChartDataItem[];
}

const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data }) => {
  return (
    <ChartCard title="Distribuição por Classe">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius="80%"
            innerRadius="40%"
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ClassDistributionChart;
