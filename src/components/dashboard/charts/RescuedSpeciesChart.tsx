
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

const RescuedSpeciesChart: React.FC<SpeciesChartProps> = ({ data }) => {
  // Validar e limitar dados
  const validData = Array.isArray(data) && data.length > 0 
    ? data.slice(0, 10).filter(item => item && item.name && typeof item.quantidade === 'number')
    : [];
  
  if (validData.length === 0) {
    return (
      <ChartCard title="Espécies Mais Resgatadas" subtitle="Top 10 espécies em número de resgates">
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Nenhum dado disponível
        </div>
      </ChartCard>
    );
  }
  
  return (
    <ChartCard title="Espécies Mais Resgatadas" subtitle="Top 10 espécies em número de resgates">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={validData} 
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
            fill="#f97316" 
            radius={[0, 4, 4, 0]} 
          >
            <LabelList dataKey="quantidade" position="right" style={{ fontSize: '12px', fontWeight: 'bold' }} fill="#666" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RescuedSpeciesChart;
