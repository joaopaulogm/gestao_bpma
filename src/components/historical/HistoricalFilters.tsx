import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { HistoricalFilters as Filters } from '@/hooks/useHistoricalData';
import { Filter, X } from 'lucide-react';

interface HistoricalFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  classes: string[];
  conservationStates: string[];
}

const YEARS = [2020, 2021, 2022, 2023, 2024];

export const HistoricalFilters: React.FC<HistoricalFiltersProps> = ({
  filters,
  onFilterChange,
  classes,
  conservationStates
}) => {
  const hasFilters = filters.ano || filters.classe || filters.estadoConservacao;

  const clearFilters = () => {
    onFilterChange({ ano: null, classe: null, estadoConservacao: null });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>
      
      <Select
        value={filters.ano?.toString() || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, ano: value === 'all' ? null : parseInt(value) })}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[100px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Anos</SelectItem>
          {YEARS.map(year => (
            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.classe || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, classe: value === 'all' ? null : value })}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[120px]">
          <SelectValue placeholder="Classe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Classes</SelectItem>
          {classes.map(classe => (
            <SelectItem key={classe} value={classe}>{classe}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.estadoConservacao || 'all'}
        onValueChange={(value) => onFilterChange({ ...filters, estadoConservacao: value === 'all' ? null : value })}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px]">
          <SelectValue placeholder="Estado de Conservação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Estados</SelectItem>
          {conservationStates.map(state => (
            <SelectItem key={state} value={state}>{state}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};
