
import React from 'react';
import ChartCard from '../ChartCard';
import { ChartDataItem } from '@/types/hotspots';

interface ClasseTaxonomicaChartProps {
  data: ChartDataItem[];
}

const ClasseTaxonomicaChart: React.FC<ClasseTaxonomicaChartProps> = ({ data }) => {
  return (
    <ChartCard 
      title="Classe Taxonômica" 
      data={data.slice(0, 8)} 
      type="bar" 
      dataKey="value" 
      nameKey="name"
      showLegend={false}
    />
  );
};

export default ClasseTaxonomicaChart;
