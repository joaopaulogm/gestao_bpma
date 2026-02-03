import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardExport from './DashboardExport';
import DashboardDateFilter from './DashboardDateFilter';
import DashboardTypeFilter from './DashboardTypeFilter';
import DashboardAdvancedFilters from './DashboardAdvancedFilters';
import { FilterState } from '@/hooks/useFilterState';
import { DashboardData } from '@/types/hotspots';

interface DashboardHeaderProps {
  year: number;
  month: number | null;
  origem: string | null;
  classeTaxonomica: string | null;
  classesDisponiveis: string[];
  ultimaAtualizacao: string;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onRefresh: () => void;
  data: DashboardData;
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  year,
  month,
  origem,
  classeTaxonomica,
  classesDisponiveis,
  ultimaAtualizacao,
  filters,
  onFilterChange,
  onRefresh,
  data,
  isLoading
}) => {
  return (
    <div className="space-y-3">
      {/* Primeira linha: Filtros básicos e ações */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filters */}
        <DashboardDateFilter
          year={year}
          month={month}
          onFilterChange={(year, month) => 
            onFilterChange({ year, month })
          }
        />
        
        <DashboardTypeFilter
          origem={origem}
          classeTaxonomica={classeTaxonomica}
          onFilterChange={(filters) => onFilterChange(filters)}
          classesDisponiveis={classesDisponiveis}
        />
        
        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            className="h-9 px-3 rounded-xl border-border/50 hover:bg-muted/50"
            title="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <DashboardExport 
            data={data} 
            year={year} 
            month={month}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Segunda linha: Filtros avançados */}
      <DashboardAdvancedFilters
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
};

export default DashboardHeader;
