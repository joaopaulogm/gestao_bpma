
import { useFilterState } from './useFilterState';
import { useDashboardDataFetching } from './useDashboardDataFetching';

/**
 * Main dashboard data hook that combines filter state and data fetching
 */
export const useDashboardData = () => {
  const { filters, updateFilters, resetFilters } = useFilterState(2025); // Default to year 2025
  const { data, isLoading, error, refetch } = useDashboardDataFetching(filters);

  return {
    data,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch
  };
};

// Re-export FilterState type for convenience
export type { FilterState } from './useFilterState';
