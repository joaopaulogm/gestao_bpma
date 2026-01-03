
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
  // Validar dados
  if (!data) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Dados não disponíveis para exibição
      </div>
    );
  }

  // Calcular estatísticas baseado no ano
  const rescueStatistics: RescueStatistics = useMemo(() => {
    const rawData = data.rawData || [];
    
    // Para anos 2020-2025, usar dados agregados das tabelas históricas
    if (year >= 2020 && year <= 2025) {
      return transformHistoricalRescueStatistics(rawData);
    }
    
    // Para 2026+, usar dados do formulário de resgate
    return transformCurrentRescueStatistics(rawData as any);
  }, [data.rawData, year]);

  // Calcular distribuição por dia da semana
  const weekdayDistribution = useMemo(() => {
    return transformWeekdayDistribution(data.rawData || []);
  }, [data.rawData]);
  
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
