
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
import { CHART_COLORS_ARRAY, CustomTooltip, renderCustomizedLabel } from './ChartUtils';
import { ChartDataItem } from '@/types/hotspots';

interface ClassDistributionChartProps {
  data: ChartDataItem[];
}

const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data }) => {
  // Validar dados
  const validData = Array.isArray(data) && data.length > 0 ? data : [];
  
  if (validData.length === 0) {
    return (
      <ChartCard title="Distribuição por Classe">
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Nenhum dado disponível
        </div>
      </ChartCard>
    );
  }
  
  return (
    <ChartCard title="Distribuição por Classe">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <Pie
            data={validData}
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
            {validData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]} 
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
