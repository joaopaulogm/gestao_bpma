
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
import { ChartDataItem } from '@/types/hotspots';
import { CHART_COLORS_ARRAY, CustomTooltip } from './ChartUtils';

interface DestinacaoTiposPieChartProps {
  data: ChartDataItem[];
}

const DestinacaoTiposPieChart = ({ data }: DestinacaoTiposPieChartProps) => {
  return (
    <ChartCard title="Destinação dos Animais" subtitle="Para onde os animais foram encaminhados">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
            outerRadius="70%"
            innerRadius="40%"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]} 
                stroke="#fff"
              />
            ))}
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

export default DestinacaoTiposPieChart;
