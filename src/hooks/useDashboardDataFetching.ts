
import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '@/types/hotspots';
import { fetchRegistryData } from '@/services/dashboardService';
import { processDashboardData } from '@/utils/dashboardDataProcessor';
import { FilterState } from './useFilterState';

/**
 * Hook for fetching and processing dashboard data based on filters
 */
export const useDashboardDataFetching = (filters: FilterState) => {
  const fetchDashboardData = async (): Promise<DashboardData> => {
    try {
      // Fetch the raw data from Supabase
      const registros = await fetchRegistryData(filters);
      
      // Validar dados recebidos
      if (!Array.isArray(registros)) {
        console.warn('fetchDashboardData: dados recebidos não são um array');
        return processDashboardData([]);
      }
      
      // Process the raw data into dashboard data
      return processDashboardData(registros);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      // Retornar estrutura vazia ao invés de lançar erro
      return processDashboardData([]);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Tentar novamente até 2 vezes em caso de erro
    retryDelay: 1000 // Esperar 1 segundo entre tentativas
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
