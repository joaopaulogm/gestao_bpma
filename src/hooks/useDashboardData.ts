
import { useFilterState } from './useFilterState';
import { useDashboardDataFetching } from './useDashboardDataFetching';

/**
 * Main dashboard data hook that combines filter state and data fetching
 */
export const useDashboardData = () => {
  const { filters, updateFilters, resetFilters } = useFilterState(2026); // Default to year 2026
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
