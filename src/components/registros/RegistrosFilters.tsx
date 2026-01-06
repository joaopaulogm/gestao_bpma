
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface RegistrosFiltersProps {
  filterTipo: string;
  setFilterTipo: (value: string) => void;
  filterEstado: string;
  setFilterEstado: (value: string) => void;
  filterDestinacao: string;
  setFilterDestinacao: (value: string) => void;
  filterClasse: string;
  setFilterClasse: (value: string) => void;
  filterData: Date | undefined;
  setFilterData: (value: Date | undefined) => void;
  filterAno: string;
  setFilterAno: (value: string) => void;
  filterMes: string;
  setFilterMes: (value: string) => void;
  filterEspecie: string;
  setFilterEspecie: (value: string) => void;
  filterNomeCientifico: string;
  setFilterNomeCientifico: (value: string) => void;
  filterEstagio: string;
  setFilterEstagio: (value: string) => void;
  filterQuantidadeMin: string;
  setFilterQuantidadeMin: (value: string) => void;
  filterQuantidadeMax: string;
  setFilterQuantidadeMax: (value: string) => void;
  filterRegiao: string;
  setFilterRegiao: (value: string) => void;
}

const RegistrosFilters: React.FC<RegistrosFiltersProps> = ({
  filterTipo,
  setFilterTipo,
  filterEstado,
  setFilterEstado,
  filterDestinacao,
  setFilterDestinacao,
  filterClasse,
  setFilterClasse,
  filterData,
  setFilterData,
  filterAno,
  setFilterAno,
  filterMes,
  setFilterMes,
  filterEspecie,
  setFilterEspecie,
  filterNomeCientifico,
  setFilterNomeCientifico,
  filterEstagio,
  setFilterEstagio,
  filterQuantidadeMin,
  setFilterQuantidadeMin,
  filterQuantidadeMax,
  setFilterQuantidadeMax,
  filterRegiao,
  setFilterRegiao,
}) => {
  const [especies, setEspecies] = useState<Array<{id: string, nome_popular: string, nome_cientifico: string}>>([]);
  const [regioes, setRegioes] = useState<Array<{id: string, nome: string}>>([]);
  const [estagios, setEstagios] = useState<Array<{id: string, nome: string}>>([]);
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
        
        // Carregar estágios de vida
        const { data: estagiosData } = await supabase
          .from('dim_estagio_vida')
          .select('id, nome')
          .order('nome');
        
        // Carregar classes distintas
        const { data: classesData } = await supabase
          .from('dim_especies_fauna')
          .select('classe_taxonomica')
          .not('classe_taxonomica', 'is', null);
        
        setEspecies(especiesData || []);
        setRegioes(regioesData || []);
        setEstagios(estagiosData || []);
        setClasses([...new Set((classesData || []).map(c => c.classe_taxonomica).filter(Boolean))]);
      } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const clearAllFilters = () => {
    setFilterTipo('all');
    setFilterEstado('all');
    setFilterDestinacao('all');
    setFilterClasse('all');
    setFilterData(undefined);
    setFilterAno('all');
    setFilterMes('all');
    setFilterEspecie('all');
    setFilterNomeCientifico('');
    setFilterEstagio('all');
    setFilterQuantidadeMin('');
    setFilterQuantidadeMax('');
    setFilterRegiao('all');
  };

  const hasActiveFilters = 
    filterTipo !== 'all' ||
    filterEstado !== 'all' ||
    filterDestinacao !== 'all' ||
    filterClasse !== 'all' ||
    filterData !== undefined ||
    filterAno !== 'all' ||
    filterMes !== 'all' ||
    filterEspecie !== 'all' ||
    filterNomeCientifico !== '' ||
    filterEstagio !== 'all' ||
    filterQuantidadeMin !== '' ||
    filterQuantidadeMax !== '' ||
    filterRegiao !== 'all';

  if (loading) {
    return (
      <Card className="border border-fauna-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-fauna-blue">Filtros avançados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Carregando filtros...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-fauna-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-fauna-blue">Filtros avançados</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar todos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Data */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Data</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filterData && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterData ? format(filterData, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterData}
                onSelect={setFilterData}
                locale={ptBR}
                initialFocus
              />
              {filterData && (
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setFilterData(undefined)}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpar data
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Ano */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Ano</label>
          <Select onValueChange={setFilterAno} value={filterAno}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mês */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Mês</label>
          <Select onValueChange={setFilterMes} value={filterMes}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de ocorrência */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Tipo de ocorrência</label>
          <Select onValueChange={setFilterTipo} value={filterTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="Resgate de Fauna">Resgate de Fauna</SelectItem>
              <SelectItem value="Apreensão">Apreensão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Região */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Região</label>
          <Select onValueChange={setFilterRegiao} value={filterRegiao}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões</SelectItem>
              {regioes.map(regiao => (
                <SelectItem key={regiao.id} value={regiao.id}>{regiao.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Espécie */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Espécie</label>
          <Select onValueChange={setFilterEspecie} value={filterEspecie}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as espécies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as espécies</SelectItem>
              {especies.map(especie => (
                <SelectItem key={especie.id} value={especie.id}>
                  {especie.nome_popular} {especie.nome_cientifico ? `(${especie.nome_cientifico})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nome Científico */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Nome Científico</label>
          <Input
            placeholder="Buscar por nome científico"
            value={filterNomeCientifico}
            onChange={(e) => setFilterNomeCientifico(e.target.value)}
          />
        </div>

        {/* Classe Taxonômica */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Classe Taxonômica</label>
          <Select onValueChange={setFilterClasse} value={filterClasse}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as classes</SelectItem>
              {classes.map(classe => (
                <SelectItem key={classe} value={classe}>{classe}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estado de Saúde */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Estado de Saúde</label>
          <Select onValueChange={setFilterEstado} value={filterEstado}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="Bom">Bom</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Ruim">Ruim</SelectItem>
              <SelectItem value="Óbito">Óbito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estágio de Vida */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Estágio de Vida</label>
          <Select onValueChange={setFilterEstagio} value={filterEstagio}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os estágios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estágios</SelectItem>
              {estagios.map(estagio => (
                <SelectItem key={estagio.id} value={estagio.id}>{estagio.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade Mínima */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Quantidade Mínima</label>
          <Input
            type="number"
            placeholder="Mínimo"
            value={filterQuantidadeMin}
            onChange={(e) => setFilterQuantidadeMin(e.target.value)}
            min="0"
          />
        </div>

        {/* Quantidade Máxima */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Quantidade Máxima</label>
          <Input
            type="number"
            placeholder="Máximo"
            value={filterQuantidadeMax}
            onChange={(e) => setFilterQuantidadeMax(e.target.value)}
            min="0"
          />
        </div>

        {/* Destinação */}
        <div>
          <label className="text-sm font-medium mb-1 block text-foreground">Destinação</label>
          <Select onValueChange={setFilterDestinacao} value={filterDestinacao}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as destinações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as destinações</SelectItem>
              <SelectItem value="CETAS/IBAMA">CETAS/IBAMA</SelectItem>
              <SelectItem value="HFAUS/IBRAM">HFAUS/IBRAM</SelectItem>
              <SelectItem value="CEAPA/BPMA">CEAPA/BPMA</SelectItem>
              <SelectItem value="Soltura">Soltura</SelectItem>
              <SelectItem value="Óbito">Óbito</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrosFilters;

