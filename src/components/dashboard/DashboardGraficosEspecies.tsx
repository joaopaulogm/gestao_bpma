
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import RescuedSpeciesChart from './charts/RescuedSpeciesChart';
import SeizedSpeciesChart from './charts/SeizedSpeciesChart';
import RoadkillSpeciesChart from './charts/RoadkillSpeciesChart';
import LifeStageChart from './charts/LifeStageChart';
import RoadkillDistributionChart from './charts/RoadkillDistributionChart';
import QuantityStatisticsChart from './charts/QuantityStatisticsChart';

interface DashboardGraficosEspeciesProps {
  data: DashboardData;
}

const DashboardGraficosEspecies = ({ data }: DashboardGraficosEspeciesProps) => {
  return (
    <div className="space-y-8">
      <RescuedSpeciesChart data={data.especiesMaisResgatadas} />
      
      <SeizedSpeciesChart data={data.especiesMaisApreendidas} />
      
      <RoadkillSpeciesChart data={data.especiesAtropeladas} />
      
      <LifeStageChart data={data.estagioVidaDistribuicao} />
      
      <RoadkillDistributionChart data={data.atropelamentoDistribuicao} />
      
      <QuantityStatisticsChart data={data.quantidadePorOcorrencia} />
    </div>
  );
};

export default DashboardGraficosEspecies;
