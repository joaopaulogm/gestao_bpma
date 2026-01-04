
import { useState } from 'react';

export interface FilterState {
  year: number;
  month: number | null;
  classeTaxonomica: string | null;
  origem: string | null;
  // Novos filtros avançados
  especie: string | null; // especie_id
  regiaoAdministrativa: string | null; // ra_id ou nome
  desfecho: string | null; // desfecho_id ou nome
  tipoRegistro: string | null; // 'resgate' | 'historico' | 'apreensao'
  exotica: boolean | null; // true | false | null (todos)
  ameacada: boolean | null; // true | false | null (todos)
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
    especie: null,
    regiaoAdministrativa: null,
    desfecho: null,
    tipoRegistro: null,
    exotica: null,
    ameacada: null,
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
      especie: null,
      regiaoAdministrativa: null,
      desfecho: null,
      tipoRegistro: null,
      exotica: null,
      ameacada: null,
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters
  };
};
