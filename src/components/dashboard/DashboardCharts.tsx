
import React, { useMemo } from 'react';
import { DashboardData } from '@/types/hotspots';
import ClassDistributionChart from './charts/ClassDistributionChart';
import DestinationsChart from './charts/DestinationsChart';
import OutcomesChart from './charts/OutcomesChart';
import RescuedSpeciesChart from './charts/RescuedSpeciesChart';
import RescueStatisticsCards from './charts/RescueStatisticsCards';
import WeekdayScatterChart from './charts/WeekdayScatterChart';
import { 
  transformHistoricalRescueStatistics, 
  transformCurrentRescueStatistics,
  transformWeekdayDistribution,
  RescueStatistics
} from '@/utils/dashboard/rescueStatisticsTransformations';

interface DashboardChartsProps {
  data: DashboardData;
  year?: number;
}

const DashboardCharts = ({ data, year = 2025 }: DashboardChartsProps) => {
  // Calcular estatísticas baseado no ano (hooks no topo para regras do React)
  const rescueStatistics: RescueStatistics = useMemo(() => {
    if (!data?.rawData) return {} as RescueStatistics;
    const rawData = data.rawData;
    if (year >= 2020 && year <= 2025) {
      return transformHistoricalRescueStatistics(rawData);
    }
    return transformCurrentRescueStatistics(rawData as unknown[]);
  }, [data?.rawData, year]);

  const weekdayDistribution = useMemo(() => {
    return transformWeekdayDistribution(data?.rawData || []);
  }, [data?.rawData]);

  // Validar dados para render
  if (!data) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Dados não disponíveis para exibição
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Estatísticas de Resgate - Cards */}
      <RescueStatisticsCards statistics={rescueStatistics} />
      
      {/* Gráfico de dispersão por dia da semana */}
      <WeekdayScatterChart data={weekdayDistribution} />
      
      {/* Grid de gráficos existentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ClassDistributionChart data={data.distribuicaoPorClasse || []} />
        </div>
        <DestinationsChart data={data.destinos || []} />
        <OutcomesChart data={data.desfechos || []} />
        <div className="lg:col-span-2">
          <RescuedSpeciesChart data={data.especiesMaisResgatadas || []} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
