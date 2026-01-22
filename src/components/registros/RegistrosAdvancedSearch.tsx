import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedFilters {
  searchTerm: string;
  year: number | null;
  month: number | null;
  classeTaxonomica: string | null;
  especie: string | null;
  regiaoAdministrativa: string | null;
  origem: string | null;
  destinacao: string | null;
  estadoSaude: string | null;
  estagioVida: string | null;
  atropelamento: string | null;
}

interface RegistrosAdvancedSearchProps {
  filters: AdvancedFilters;
  onFilterChange: (filters: AdvancedFilters) => void;
  showSpeciesFilter?: boolean;
  showOriginFilter?: boolean;
}

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const RegistrosAdvancedSearch: React.FC<RegistrosAdvancedSearchProps> = ({
  filters,
  onFilterChange,
  showSpeciesFilter = true,
  showOriginFilter = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [especies, setEspecies] = useState<{ id: string; nome: string }[]>([]);
  const [regioes, setRegioes] = useState<{ id: string; nome: string }[]>([]);
  const [origens, setOrigens] = useState<{ id: string; nome: string }[]>([]);
  const [destinacoes, setDestinacoes] = useState<{ id: string; nome: string }[]>([]);
  const [estadosSaude, setEstadosSaude] = useState<{ id: string; nome: string }[]>([]);
  const [estagiosVida, setEstagiosVida] = useState<{ id: string; nome: string }[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    const fetchDimensions = async () => {
      const [especiesRes, regioesRes, origensRes, destinacoesRes, estadosSaudeRes, estagiosVidaRes] = await Promise.all([
        supabase.from('dim_especies_fauna').select('id, nome_popular').order('nome_popular'),
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabase.from('dim_origem').select('id, nome').order('nome'),
        supabase.from('dim_destinacao').select('id, nome').order('nome'),
        supabase.from('dim_estado_saude').select('id, nome').order('nome'),
        supabase.from('dim_estagio_vida').select('id, nome').order('nome'),
      ]);

      if (especiesRes.data) {
        setEspecies(especiesRes.data.map(e => ({ id: e.id, nome: e.nome_popular || 'Sem nome' })));
        const uniqueClasses = new Set<string>();
        // Buscar classes únicas
        const classesRes = await supabase.from('dim_especies_fauna').select('classe_taxonomica');
        classesRes.data?.forEach(e => {
          if (e.classe_taxonomica) uniqueClasses.add(e.classe_taxonomica);
        });
        setClasses(Array.from(uniqueClasses).sort());
      }
      if (regioesRes.data) setRegioes(regioesRes.data);
      if (origensRes.data) setOrigens(origensRes.data);
      if (destinacoesRes.data) setDestinacoes(destinacoesRes.data);
      if (estadosSaudeRes.data) setEstadosSaude(estadosSaudeRes.data);
      if (estagiosVidaRes.data) setEstagiosVida(estagiosVidaRes.data);
    };

    fetchDimensions();
  }, []);

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchTerm: '',
      year: null,
      month: null,
      classeTaxonomica: null,
      especie: null,
      regiaoAdministrativa: null,
      origem: null,
      destinacao: null,
      estadoSaude: null,
      estagioVida: null,
      atropelamento: null,
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value !== null && value !== '' && key !== 'searchTerm'
  ).length;

  const hasActiveFilters = activeFiltersCount > 0 || filters.searchTerm !== '';

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Busca principal */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por espécie, região, local..."
              className="pl-10"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros Avançados
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive hover:text-destructive">
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros avançados expandíveis */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* Ano */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Ano</label>
                <Select
                  value={filters.year?.toString() || 'all'}
                  onValueChange={(v) => updateFilter('year', v === 'all' ? null : parseInt(v))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mês */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Mês</label>
                <Select
                  value={filters.month?.toString() || 'all'}
                  onValueChange={(v) => updateFilter('month', v === 'all' ? null : parseInt(v))}
                  disabled={!filters.year}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Classe Taxonômica */}
              {showSpeciesFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Classe</label>
                  <Select
                    value={filters.classeTaxonomica || 'all'}
                    onValueChange={(v) => updateFilter('classeTaxonomica', v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {classes.map((classe) => (
                        <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Região Administrativa */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Região</label>
                <Select
                  value={filters.regiaoAdministrativa || 'all'}
                  onValueChange={(v) => updateFilter('regiaoAdministrativa', v === 'all' ? null : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {regioes.map((regiao) => (
                      <SelectItem key={regiao.id} value={regiao.id}>{regiao.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Origem */}
              {showOriginFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Origem</label>
                  <Select
                    value={filters.origem || 'all'}
                    onValueChange={(v) => updateFilter('origem', v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {origens.map((origem) => (
                        <SelectItem key={origem.id} value={origem.id}>{origem.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Destinação */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Destinação</label>
                <Select
                  value={filters.destinacao || 'all'}
                  onValueChange={(v) => updateFilter('destinacao', v === 'all' ? null : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {destinacoes.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado de Saúde */}
              {showSpeciesFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Estado Saúde</label>
                  <Select
                    value={filters.estadoSaude || 'all'}
                    onValueChange={(v) => updateFilter('estadoSaude', v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {estadosSaude.map((estado) => (
                        <SelectItem key={estado.id} value={estado.id}>{estado.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Estágio de Vida */}
              {showSpeciesFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Estágio Vida</label>
                  <Select
                    value={filters.estagioVida || 'all'}
                    onValueChange={(v) => updateFilter('estagioVida', v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {estagiosVida.map((estagio) => (
                        <SelectItem key={estagio.id} value={estagio.id}>{estagio.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Atropelamento */}
              {showSpeciesFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Atropelamento</label>
                  <Select
                    value={filters.atropelamento || 'all'}
                    onValueChange={(v) => updateFilter('atropelamento', v === 'all' ? null : v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Badges de filtros ativos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {filters.year && (
                  <Badge variant="secondary" className="gap-1">
                    Ano: {filters.year}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('year', null)} />
                  </Badge>
                )}
                {filters.month && (
                  <Badge variant="secondary" className="gap-1">
                    Mês: {MONTHS.find(m => m.value === filters.month)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('month', null)} />
                  </Badge>
                )}
                {filters.classeTaxonomica && (
                  <Badge variant="secondary" className="gap-1">
                    Classe: {filters.classeTaxonomica}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('classeTaxonomica', null)} />
                  </Badge>
                )}
                {filters.regiaoAdministrativa && (
                  <Badge variant="secondary" className="gap-1">
                    Região: {regioes.find(r => r.id === filters.regiaoAdministrativa)?.nome}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('regiaoAdministrativa', null)} />
                  </Badge>
                )}
                {filters.origem && (
                  <Badge variant="secondary" className="gap-1">
                    Origem: {origens.find(o => o.id === filters.origem)?.nome}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('origem', null)} />
                  </Badge>
                )}
                {filters.destinacao && (
                  <Badge variant="secondary" className="gap-1">
                    Destinação: {destinacoes.find(d => d.id === filters.destinacao)?.nome}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('destinacao', null)} />
                  </Badge>
                )}
                {filters.estadoSaude && (
                  <Badge variant="secondary" className="gap-1">
                    Saúde: {estadosSaude.find(e => e.id === filters.estadoSaude)?.nome}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('estadoSaude', null)} />
                  </Badge>
                )}
                {filters.estagioVida && (
                  <Badge variant="secondary" className="gap-1">
                    Estágio: {estagiosVida.find(e => e.id === filters.estagioVida)?.nome}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('estagioVida', null)} />
                  </Badge>
                )}
                {filters.atropelamento && (
                  <Badge variant="secondary" className="gap-1">
                    Atropelamento: {filters.atropelamento}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('atropelamento', null)} />
                  </Badge>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default RegistrosAdvancedSearch;
