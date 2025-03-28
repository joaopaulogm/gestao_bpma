
import React from 'react';
import { BarChart4, RefreshCw, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardExport from './DashboardExport';
import DashboardDateFilter from './DashboardDateFilter';
import DashboardTypeFilter from './DashboardTypeFilter';

interface DashboardHeaderProps {
  year: number;
  month: number | null;
  origem: string | null;
  classeTaxonomica: string | null;
  classesDisponiveis: string[];
  ultimaAtualizacao: string;
  onFilterChange: (filters: {
    year?: number;
    month?: number | null;
    origem?: string | null;
    classeTaxonomica?: string | null;
  }) => void;
  onRefresh: () => void;
  data: any;
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  year,
  month,
  origem,
  classeTaxonomica,
  classesDisponiveis,
  ultimaAtualizacao,
  onFilterChange,
  onRefresh,
  data,
  isLoading
}) => {
  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart4 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-slate-800">
            Dashboard de Fauna
          </h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            {year}
            {month !== null ? 
              ` - ${new Date(year, month).toLocaleString('pt-BR', { month: 'long' })}` : 
              ' - Ano todo'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <DashboardExport 
            data={data} 
            year={year} 
            month={month}
            isLoading={isLoading}
          />
          <Button 
            variant="ghost" 
            onClick={onRefresh}
            className="h-9 w-9 p-0"
            title="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2 items-center">
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
        </div>
        
        <div className="text-xs text-slate-500 flex items-center">
          <Calendar className="h-3 w-3 mr-1 inline" />
          Última atualização: {ultimaAtualizacao}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
