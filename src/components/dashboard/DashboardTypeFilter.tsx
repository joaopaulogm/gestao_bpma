
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DashboardTypeFilterProps {
  origem: string | null;
  classeTaxonomica: string | null;
  classesDisponiveis: string[];
  onFilterChange: (filters: {
    origem?: string | null;
    classeTaxonomica?: string | null;
  }) => void;
}

const DashboardTypeFilter: React.FC<DashboardTypeFilterProps> = ({
  origem,
  classeTaxonomica,
  classesDisponiveis,
  onFilterChange,
}) => {
  const hasFilters = origem !== null || classeTaxonomica !== null;
  
  const clearFilters = () => {
    onFilterChange({
      origem: null,
      classeTaxonomica: null,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 border-border ${
              hasFilters ? 'bg-primary/10 text-primary border-primary/30' : 'bg-background'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtrar</span>
            {hasFilters && (
              <Badge 
                variant="secondary" 
                className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                {(origem !== null ? 1 : 0) + (classeTaxonomica !== null ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros</h4>
              {hasFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar todos
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-foreground">Origem</h5>
              <Select
                value={origem || "all"}
                onValueChange={(value) => onFilterChange({
                  origem: value === "all" ? null : value,
                })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
                  <SelectItem value="Apreensão">Apreensão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-foreground">Classe Taxonômica</h5>
              <Select
                value={classeTaxonomica || "all"}
                onValueChange={(value) => onFilterChange({
                  classeTaxonomica: value === "all" ? null : value,
                })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas as classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as classes</SelectItem>
                  {classesDisponiveis.map((classe) => (
                    <SelectItem key={classe} value={classe}>
                      {classe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full"
              size="sm"
              onClick={() => {
                // Aplica os filtros (já foram aplicados via Select)
              }}
            >
              Aplicar Filtros
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {origem && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              Origem: {origem}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFilterChange({ origem: null })}
              />
            </Badge>
          )}
          
          {classeTaxonomica && (
            <Badge 
              variant="outline"
              className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
            >
              Classe: {classeTaxonomica}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFilterChange({ classeTaxonomica: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardTypeFilter;
