
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import SpeciesRescueChart from './charts/SpeciesRescueChart';
import LifeStageChart from './charts/LifeStageChart';
import RoadkillDistributionChart from './charts/RoadkillDistributionChart';
import QuantityStatisticsChart from './charts/QuantityStatisticsChart';

interface DashboardGraficosEspeciesProps {
  data: DashboardData;
}

const DashboardGraficosEspecies = ({ data }: DashboardGraficosEspeciesProps) => {
  return (
    <div className="space-y-8">
      <SpeciesRescueChart 
        data={data.especiesMaisResgatadas} 
        title="Espécies Mais Resgatadas" 
        color="#f97316" 
      />
      
      <SpeciesRescueChart 
        data={data.especiesMaisApreendidas} 
        title="Espécies Mais Apreendidas" 
        color="#10b981" 
      />
      
      <SpeciesRescueChart 
        data={data.especiesAtropeladas} 
        title="Espécies Atropeladas" 
        color="#ec4899" 
      />
      
      <LifeStageChart data={data.estagioVidaDistribuicao} />
      
      <RoadkillDistributionChart data={data.atropelamentoDistribuicao} />
      
      <QuantityStatisticsChart data={data.quantidadePorOcorrencia} />
    </div>
  );
};

export default DashboardGraficosEspecies;
