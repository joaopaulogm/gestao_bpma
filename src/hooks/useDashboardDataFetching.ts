
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
      console.log('🔄 [Hook] Iniciando fetchDashboardData...');
      
      // Fetch the raw data from Supabase
      const registros = await fetchRegistryData(filters);
      
      console.log('📦 [Hook] Dados recebidos:', registros?.length || 0, 'registros');
      
      // Validar dados recebidos
      if (!Array.isArray(registros)) {
        console.warn('⚠️ [Hook] Dados recebidos não são um array, usando array vazio');
        return processDashboardData([]);
      }
      
      // Process the raw data into dashboard data
      const processedData = processDashboardData(registros);
      console.log('✅ [Hook] Dados processados com sucesso');
      return processedData;
    } catch (error: any) {
      // NUNCA lançar erro - sempre retornar dados processados (mesmo que vazios)
      console.warn('⚠️ [Hook] Erro capturado (retornando dados vazios):', error?.message || error);
      return processDashboardData([]);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // Desabilitar retry - sempre retornamos dados válidos
    retryOnMount: false,
    // Garantir que mesmo com erro, não marque como erro se retornarmos dados
    throwOnError: false
  });

  return {
    data,
    isLoading,
    error: null, // Sempre retornar null para error - nunca mostrar tela de erro
    refetch
  };
};
