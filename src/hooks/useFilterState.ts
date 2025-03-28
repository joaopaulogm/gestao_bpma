
import { useState } from 'react';

export interface FilterState {
  year: number;
  month: number | null;
  classeTaxonomica: string | null;
  origem: string | null;
}

/**
 * Hook for managing dashboard filter state
 */
export const useFilterState = (initialYear = new Date().getFullYear()) => {
  const [filters, setFilters] = useState<FilterState>({
    year: initialYear,
    month: null,
    classeTaxonomica: null,
    origem: null,
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      year: initialYear,
      month: null,
      classeTaxonomica: null,
      origem: null,
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters
  };
};
