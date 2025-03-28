
import React from 'react';
import ChartCard from '../ChartCard';
import { ChartDataItem } from '@/types/hotspots';

interface OrigemDistribuicaoChartProps {
  data: ChartDataItem[];
}

const OrigemDistribuicaoChart: React.FC<OrigemDistribuicaoChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Origem" 
      data={data} 
      type="pie" 
      dataKey="value" 
      nameKey="name"
    />
  );
};

export default OrigemDistribuicaoChart;
