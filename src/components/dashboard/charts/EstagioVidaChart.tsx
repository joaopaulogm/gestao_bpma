
import React from 'react';
import ChartCard from '../ChartCard';
import { ChartDataItem } from '@/types/hotspots';

interface EstagioVidaChartProps {
  data: ChartDataItem[];
}

const EstagioVidaChart: React.FC<EstagioVidaChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Estágio de Vida" 
      data={data} 
      type="pie" 
      dataKey="value" 
      nameKey="name"
    />
  );
};

export default EstagioVidaChart;
