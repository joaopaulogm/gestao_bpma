
import React from 'react';
import ChartCard from '../ChartCard';
import { ChartDataItem } from '@/types/hotspots';

interface RegioesAdministrativasChartProps {
  data: ChartDataItem[];
}

const RegioesAdministrativasChart: React.FC<RegioesAdministrativasChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Regiões Administrativas" 
      data={data.slice(0, 10)} 
      type="bar" 
      dataKey="value" 
      nameKey="name"
      showLegend={false}
    />
  );
};

export default RegioesAdministrativasChart;
