
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import RescuedSpeciesChart from './charts/RescuedSpeciesChart';
import QuantityStatisticsChart from './charts/QuantityStatisticsChart';
import ClassDistributionDonutChart from './charts/ClassDistributionDonutChart';

interface DashboardGraficosEspeciesProps {
  data: DashboardData;
}

const DashboardGraficosEspecies = ({ data }: DashboardGraficosEspeciesProps) => {
  // Validar dados
  if (!data) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Dados não disponíveis
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <RescuedSpeciesChart data={data.especiesMaisResgatadas || []} />
      
      <ClassDistributionDonutChart data={data} />
      
      <QuantityStatisticsChart data={data.quantidadePorOcorrencia || { min: 0, max: 0, avg: 0, median: 0 }} />
    </div>
  );
};

export default DashboardGraficosEspecies;
