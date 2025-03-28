
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
  return (
    <div className="grid grid-cols-1 gap-8 animate-fade-in">
      <ClassDistributionChart data={data.distribuicaoPorClasse} />
      <DestinationsChart data={data.destinos} />
      <OutcomesChart data={data.desfechos} />
      <RescuedSpeciesChart data={data.especiesMaisResgatadas} />
      <SeizedSpeciesChart data={data.especiesMaisApreendidas} />
      <RoadkillSpeciesChart data={data.atropelamentos} />
    </div>
  );
};

export default DashboardCharts;
