
import React from 'react';
import ChartCard from '../ChartCard';
import { HealthDistribution } from '@/types/hotspots';

interface EstadoSaudeChartProps {
  data: HealthDistribution[];
}

const EstadoSaudeChart: React.FC<EstadoSaudeChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Estado de Saúde" 
      data={data.map(item => ({ 
        name: item.estado, 
        value: item.quantidade 
      }))} 
      type="pie" 
      dataKey="value" 
      nameKey="name"
    />
  );
};

export default EstadoSaudeChart;
