import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStatistics,
  getTimeSeriesResgates,
  getTopEspeciesResgatadas,
  getDistribuicaoClasse,
  getEstatisticasRegiao,
  getEstatisticasDestinacao,
  getEstatisticasAtropelamentos,
  getResgatesAgregados,
  getCrimesAgregados,
  getApreensoesAgregadas,
  type DashboardStatistics,
  type TimeSeriesData,
  type TopEspecie,
  type DistribuicaoClasse,
  type EstatisticasRegiao,
  type EstatisticasDestinacao,
  type EstatisticasAtropelamento
} from '@/services/dashboardStatisticsService';
import { FilterState } from './useFilterState';

export interface EnhancedDashboardData {
  statistics: DashboardStatistics;
  timeSeries: TimeSeriesData[];
  topEspecies: TopEspecie[];
  distribuicaoClasse: DistribuicaoClasse[];
  estatisticasRegiao: EstatisticasRegiao[];
  estatisticasDestinacao: EstatisticasDestinacao[];
  estatisticasAtropelamentos: EstatisticasAtropelamento[];
  resgatesAgregados: any[];
  crimesAgregados: any[];
  apreensoesAgregadas: any[];
  ultimaAtualizacao: string;
}

/**
 * Hook para buscar dados do dashboard usando views materializadas
 * Mais eficiente que processar dados brutos no frontend
 */
export const useDashboardStatistics = (filters: FilterState) => {
  const fetchDashboardStatistics = async (): Promise<EnhancedDashboardData> => {
    // Buscar todas as estatísticas em paralelo
    const [
      statistics,
      timeSeries,
      topEspecies,
      distribuicaoClasse,
      estatisticasRegiao,
      estatisticasDestinacao,
      estatisticasAtropelamentos,
      resgatesAgregados,
      crimesAgregados,
      apreensoesAgregadas
    ] = await Promise.all([
      getDashboardStatistics(filters.year, filters.month || undefined, filters.classeTaxonomica || undefined),
      getTimeSeriesResgates(2020, 2025, filters.classeTaxonomica || undefined),
      getTopEspeciesResgatadas(10, filters.year, filters.classeTaxonomica || undefined),
      getDistribuicaoClasse(filters.year),
      getEstatisticasRegiao(filters.year),
      getEstatisticasDestinacao(filters.year),
      getEstatisticasAtropelamentos(filters.year, filters.classeTaxonomica || undefined),
      getResgatesAgregados(filters.year, filters.month || undefined, filters.classeTaxonomica || undefined),
      getCrimesAgregados(filters.year, filters.month || undefined),
      getApreensoesAgregadas(filters.year, filters.month || undefined)
    ]);

    return {
      statistics,
      timeSeries,
      topEspecies,
      distribuicaoClasse,
      estatisticasRegiao,
      estatisticasDestinacao,
      estatisticasAtropelamentos,
      resgatesAgregados,
      crimesAgregados,
      apreensoesAgregadas,
      ultimaAtualizacao: new Date().toISOString()
    };
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStatistics', filters],
    queryFn: fetchDashboardStatistics,
    staleTime: 2 * 60 * 1000, // 2 minutos (views são atualizadas automaticamente)
    refetchOnWindowFocus: false
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

