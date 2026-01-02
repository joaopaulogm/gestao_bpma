
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import ClassDistributionChart from './charts/ClassDistributionChart';
import DestinationsChart from './charts/DestinationsChart';
import OutcomesChart from './charts/OutcomesChart';
import RescuedSpeciesChart from './charts/RescuedSpeciesChart';
import SeizedSpeciesChart from './charts/SeizedSpeciesChart';
import RoadkillSpeciesChart from './charts/RoadkillSpeciesChart';

interface DashboardChartsProps {
  data: DashboardData;
}

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  // Validar dados
  if (!data) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Dados não disponíveis para exibição
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <ClassDistributionChart data={data.distribuicaoPorClasse || []} />
      </div>
      <DestinationsChart data={data.destinos || []} />
      <OutcomesChart data={data.desfechos || []} />
      <div className="lg:col-span-2">
        <RescuedSpeciesChart data={data.especiesMaisResgatadas || []} />
      </div>
      <SeizedSpeciesChart data={data.especiesMaisApreendidas || []} />
      <RoadkillSpeciesChart data={data.atropelamentos || []} />
    </div>
  );
};

export default DashboardCharts;
