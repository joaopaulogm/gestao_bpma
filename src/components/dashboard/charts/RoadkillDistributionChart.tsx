
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
import { CustomTooltip } from './ChartUtils';
import { ChartDataItem } from '@/types/hotspots';

interface RoadkillDistributionChartProps {
  data: ChartDataItem[];
}

const RoadkillDistributionChart: React.FC<RoadkillDistributionChartProps> = ({ data }) => {
  return (
    <ChartCard title="Atropelamentos" subtitle="Incidência de atropelamentos">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
              name,
            }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
              const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight="bold"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
            outerRadius="80%"
            innerRadius="55%"
            paddingAngle={5}
            dataKey="value"
          >
            <Cell fill="#ec4899" stroke="#fff" />
            <Cell fill="#9ca3af" stroke="#fff" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RoadkillDistributionChart;
