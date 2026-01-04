import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';

interface DashboardAdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}

const DashboardAdvancedFilters: React.FC<DashboardAdvancedFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [especies, setEspecies] = useState<Array<{id: string, nome_popular: string, nome_cientifico: string}>>([]);
  const [regioes, setRegioes] = useState<Array<{id: string, nome: string}>>([]);
  const [desfechos, setDesfechos] = useState<Array<{id: string, nome: string}>>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Carregar espécies
        const { data: especiesData } = await supabase
          .from('dim_especies_fauna')
          .select('id, nome_popular, nome_cientifico')
          .order('nome_popular');
        
        // Carregar regiões
        const { data: regioesData } = await supabase
          .from('dim_regiao_administrativa')
          .select('id, nome')
          .order('nome');
        
        // Carregar desfechos
        const { data: desfechosData } = await supabase
          .from('dim_desfecho')
          .select('id, nome')
          .eq('tipo', 'resgate')
          .order('nome');
        
        // Carregar classes distintas
        const { data: classesData } = await supabase
          .from('dim_especies_fauna')
          .select('classe_taxonomica')
          .not('classe_taxonomica', 'is', null);
        
        setEspecies(especiesData || []);
        setRegioes(regioesData || []);
        setDesfechos(desfechosData || []);
        setClasses([...new Set((classesData || []).map(c => c.classe_taxonomica).filter(Boolean))]);
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const hasFilters = 
    filters.classeTaxonomica !== null ||
    filters.especie !== null ||
    filters.regiaoAdministrativa !== null ||
    filters.desfecho !== null ||
    filters.tipoRegistro !== null ||
    filters.exotica !== null ||
    filters.ameacada !== null;

  const clearFilters = () => {
    onFilterChange({
      classeTaxonomica: null,
      especie: null,
      regiaoAdministrativa: null,
      desfecho: null,
      tipoRegistro: null,
      exotica: null,
      ameacada: null,
    });
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 border-slate-200 ${
              hasFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros Avançados</span>
            {hasFilters && (
              <Badge 
                variant="secondary" 
                className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                {[
                  filters.classeTaxonomica,
                  filters.especie,
                  filters.regiaoAdministrativa,
                  filters.desfecho,
                  filters.tipoRegistro,
                  filters.exotica !== null,
                  filters.ameacada !== null
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 max-h-[600px] overflow-y-auto" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
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
            
            <div className="space-y-3">
              {/* Classe Taxonômica */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Classe Taxonômica</h5>
                <Select
                  value={filters.classeTaxonomica || "all"}
                  onValueChange={(value) => onFilterChange({
                    classeTaxonomica: value === "all" ? null : value,
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as classes</SelectItem>
                    {classes.map((classe) => (
                      <SelectItem key={classe} value={classe}>
                        {classe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Espécie */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Espécie</h5>
                <Select
                  value={filters.especie || "all"}
                  onValueChange={(value) => onFilterChange({
                    especie: value === "all" ? null : value,
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as espécies" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="all">Todas as espécies</SelectItem>
                    {especies.map((esp) => (
                      <SelectItem key={esp.id} value={esp.id}>
                        {esp.nome_popular} {esp.nome_cientifico && `(${esp.nome_cientifico})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Região Administrativa */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Região Administrativa</h5>
                <Select
                  value={filters.regiaoAdministrativa || "all"}
                  onValueChange={(value) => onFilterChange({
                    regiaoAdministrativa: value === "all" ? null : value,
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as regiões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regiões</SelectItem>
                    {regioes.map((ra) => (
                      <SelectItem key={ra.id} value={ra.id}>
                        {ra.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desfecho */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Desfecho</h5>
                <Select
                  value={filters.desfecho || "all"}
                  onValueChange={(value) => onFilterChange({
                    desfecho: value === "all" ? null : value,
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os desfechos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os desfechos</SelectItem>
                    {desfechos.map((desf) => (
                      <SelectItem key={desf.id} value={desf.id}>
                        {desf.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Registro */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Tipo de Registro</h5>
                <Select
                  value={filters.tipoRegistro || "all"}
                  onValueChange={(value) => onFilterChange({
                    tipoRegistro: value === "all" ? null : value,
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="resgate">Resgate</SelectItem>
                    <SelectItem value="historico">Histórico</SelectItem>
                    <SelectItem value="apreensao">Apreensão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exótica */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Espécie Exótica</h5>
                <Select
                  value={filters.exotica === null ? "all" : filters.exotica ? "true" : "false"}
                  onValueChange={(value) => onFilterChange({
                    exotica: value === "all" ? null : value === "true",
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ameaçada */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-slate-700">Espécie Ameaçada</h5>
                <Select
                  value={filters.ameacada === null ? "all" : filters.ameacada ? "true" : "false"}
                  onValueChange={(value) => onFilterChange({
                    ameacada: value === "all" ? null : value === "true",
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Badges de filtros ativos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.classeTaxonomica && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
              Classe: {filters.classeTaxonomica}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ classeTaxonomica: null })} />
            </Badge>
          )}
          {filters.especie && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              Espécie: {especies.find(e => e.id === filters.especie)?.nome_popular || filters.especie}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ especie: null })} />
            </Badge>
          )}
          {filters.regiaoAdministrativa && (
            <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
              RA: {regioes.find(r => r.id === filters.regiaoAdministrativa)?.nome || filters.regiaoAdministrativa}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ regiaoAdministrativa: null })} />
            </Badge>
          )}
          {filters.desfecho && (
            <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200">
              Desfecho: {desfechos.find(d => d.id === filters.desfecho)?.nome || filters.desfecho}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ desfecho: null })} />
            </Badge>
          )}
          {filters.tipoRegistro && (
            <Badge variant="outline" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
              Tipo: {filters.tipoRegistro}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ tipoRegistro: null })} />
            </Badge>
          )}
          {filters.exotica !== null && (
            <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              Exótica: {filters.exotica ? 'Sim' : 'Não'}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ exotica: null })} />
            </Badge>
          )}
          {filters.ameacada !== null && (
            <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
              Ameaçada: {filters.ameacada ? 'Sim' : 'Não'}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onFilterChange({ ameacada: null })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAdvancedFilters;

