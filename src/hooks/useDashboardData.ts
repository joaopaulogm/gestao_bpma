
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '@/types/hotspots';
import { fetchRegistryData } from '@/services/dashboardService';
import { processDashboardData } from '@/utils/dashboardDataProcessor';

export interface FilterState {
  year: number;
  month: number | null;
  classeTaxonomica: string | null;
  origem: string | null;
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState<FilterState>({
    year: 2025,
    month: null,
    classeTaxonomica: null,
    origem: null,
  });

  const fetchDashboardData = async (): Promise<DashboardData> => {
    // Fetch the raw data from Supabase
    const registros = await fetchRegistryData(filters);
    
    // Process the raw data into dashboard data
    return processDashboardData(registros);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardData', filters],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch
  };
};
