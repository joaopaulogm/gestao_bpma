
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
    // Fetch the raw data from Supabase
    const registros = await fetchRegistryData(filters);
    
    // Process the raw data into dashboard data
    return processDashboardData(registros);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
