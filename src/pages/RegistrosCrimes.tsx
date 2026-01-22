import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { handleSupabaseError } from '@/utils/errorHandler';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface RegistroCrime {
  id: string;
  data: string;
  regiao_administrativa?: { nome: string };
  tipo_crime?: { id_tipo_de_crime: string; "Tipo de Crime": string };
  enquadramento?: { "Enquadramento": string };
  tipo_area?: { "Tipo de Área": string };
  latitude?: string;
  longitude?: string;
  latitude_ocorrencia?: string;
  longitude_ocorrencia?: string;
  ocorreu_apreensao: boolean;
  procedimento_legal?: string;
  qtd_detidos_maior?: number;
  qtd_detidos_menor?: number;
  qtd_liberados_maior?: number;
  qtd_liberados_menor?: number;
  desfecho?: { nome: string };
  created_at?: string;
}

const RegistrosCrimes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('all');
  const [filterMes, setFilterMes] = useState('all');
  const [filterRegiao, setFilterRegiao] = useState('all');
  const [filterTipoCrime, setFilterTipoCrime] = useState('all');
  const [filterApreensao, setFilterApreensao] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<RegistroCrime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regioes, setRegioes] = useState<Array<{ id: string; nome: string }>>([]);
  const [tiposCrime, setTiposCrime] = useState<Array<{ id_tipo_de_crime: string; "Tipo de Crime": string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistros();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [regioesRes, tiposCrimeRes] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome'),
        supabase.from('dim_tipo_de_crime').select('id_tipo_de_crime, "Tipo de Crime"')
      ]);

      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposCrimeRes.data) setTiposCrime(tiposCrimeRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados de filtros:', error);
    }
  };

  const fetchRegistros = async () => {
    setIsLoading(true);
    try {
      const supabaseAny = supabase as any;
      
      // Tentar buscar com joins primeiro
      let query = supabaseAny
        .from('fat_registros_de_crime')
        .select(`
          *,
          regiao_administrativa:dim_regiao_administrativa(nome),
          tipo_crime:dim_tipo_de_crime(id_tipo_de_crime, "Tipo de Crime"),
          enquadramento:dim_enquadramento(id_enquadramento, "Enquadramento"),
          tipo_area:dim_tipo_de_area(id, "Tipo de Área"),
          desfecho:dim_desfecho(nome)
        `)
        .order('data', { ascending: false });

      const { data, error } = await query;

      if (error) {
        // Se falhar com joins, tentar buscar sem joins e enriquecer depois
        console.warn('Erro ao buscar com joins, tentando sem joins:', error);
        
        const { data: dataSimple, error: errorSimple } = await supabaseAny
          .from('fat_registros_de_crime')
          .select('*')
          .order('data', { ascending: false });

        if (errorSimple) {
          throw errorSimple;
        }

        // Enriquecer dados manualmente
        const enriched = await enrichCrimeData(dataSimple || []);
        setRegistros(enriched);
        console.log(`✅ Total de registros de crimes carregados (sem joins): ${enriched.length}`);
      } else {
        setRegistros(data || []);
        console.log(`✅ Total de registros de crimes carregados: ${data?.length || 0}`);
      }
    } catch (error) {
      console.error('Erro ao buscar registros de crimes:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros de crimes'));
      setRegistros([]);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichCrimeData = async (registros: any[]): Promise<RegistroCrime[]> => {
    if (!registros || registros.length === 0) return [];

    // Buscar dimensões
    const [regioesRes, tiposCrimeRes, enquadramentosRes, tiposAreaRes, desfechosRes] = await Promise.all([
      supabase.from('dim_regiao_administrativa').select('id, nome'),
      supabase.from('dim_tipo_de_crime').select('id_tipo_de_crime, "Tipo de Crime"'),
      supabase.from('dim_enquadramento').select('id_enquadramento, "Enquadramento"'),
      supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"'),
      supabase.from('dim_desfecho').select('id, nome'),
    ]);

    const regioesMap = new Map((regioesRes.data || []).map(r => [r.id, r]));
    const tiposCrimeMap = new Map((tiposCrimeRes.data || []).map(t => [t.id_tipo_de_crime, t]));
    const enquadramentosMap = new Map((enquadramentosRes.data || []).map(e => [e.id_enquadramento, e]));
    const tiposAreaMap = new Map((tiposAreaRes.data || []).map(t => [t.id, t]));
    const desfechosMap = new Map((desfechosRes.data || []).map(d => [d.id, d]));

    return registros.map(reg => ({
      ...reg,
      regiao_administrativa: reg.regiao_administrativa_id ? regioesMap.get(reg.regiao_administrativa_id) : undefined,
      tipo_crime: reg.tipo_crime_id ? tiposCrimeMap.get(reg.tipo_crime_id) : undefined,
      enquadramento: reg.enquadramento_id ? enquadramentosMap.get(reg.enquadramento_id) : undefined,
      tipo_area: reg.tipo_area_id ? tiposAreaMap.get(reg.tipo_area_id) : undefined,
      desfecho: reg.desfecho_id ? desfechosMap.get(reg.desfecho_id) : undefined,
      latitude: reg.latitude || reg.latitude_ocorrencia,
      longitude: reg.longitude || reg.longitude_ocorrencia,
    }));
  };

  const filteredRegistros = registros.filter(registro => {
    // Busca por texto
    const matchesSearch = searchTerm === '' || 
      registro.regiao_administrativa?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.tipo_crime?.["Tipo de Crime"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.enquadramento?.["Enquadramento"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.procedimento_legal?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por ano
    const matchesAno = filterAno === 'all' || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return registroDate.getFullYear().toString() === filterAno;
    })();

    // Filtro por mês
    const matchesMes = filterMes === 'all' || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return (registroDate.getMonth() + 1).toString() === filterMes;
    })();

    // Filtro por região
    const matchesRegiao = filterRegiao === 'all' || 
      registro.regiao_administrativa?.nome === filterRegiao ||
      (registro as any).regiao_administrativa_id === filterRegiao;

    // Filtro por tipo de crime
    const matchesTipoCrime = filterTipoCrime === 'all' || 
      registro.tipo_crime?.id_tipo_de_crime === filterTipoCrime ||
      (registro as any).tipo_crime_id === filterTipoCrime;

    // Filtro por apreensão
    const matchesApreensao = filterApreensao === 'all' || 
      (filterApreensao === 'sim' && registro.ocorreu_apreensao === true) ||
      (filterApreensao === 'nao' && registro.ocorreu_apreensao === false);

    return matchesSearch && 
           matchesAno && 
           matchesMes && 
           matchesRegiao && 
           matchesTipoCrime && 
           matchesApreensao;
  });

  const handleViewDetails = (id: string) => {
    navigate(`/crimes-ambientais?id=${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/crimes-ambientais?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro de crime?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fat_registros_de_crime')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Registro de crime excluído com sucesso');
      setRegistros(prevRegistros => prevRegistros.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast.error(handleSupabaseError(error, 'excluir o registro'));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Data', 'Região Administrativa', 'Tipo de Crime', 'Enquadramento',
      'Tipo de Área', 'Latitude', 'Longitude', 'Ocorreu Apreensão',
      'Procedimento Legal', 'Detidos Maior', 'Detidos Menor',
      'Liberados Maior', 'Liberados Menor', 'Desfecho'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => {
        return [
          formatDate(registro.data),
          `"${registro.regiao_administrativa?.nome || ''}"`,
          `"${registro.tipo_crime?.["Tipo de Crime"] || ''}"`,
          `"${registro.enquadramento?.["Enquadramento"] || ''}"`,
          `"${registro.tipo_area?.["Tipo de Área"] || ''}"`,
          registro.latitude || registro.latitude_ocorrencia || '',
          registro.longitude || registro.longitude_ocorrencia || '',
          registro.ocorreu_apreensao ? 'Sim' : 'Não',
          `"${registro.procedimento_legal || ''}"`,
          registro.qtd_detidos_maior || 0,
          registro.qtd_detidos_menor || 0,
          registro.qtd_liberados_maior || 0,
          registro.qtd_liberados_menor || 0,
          `"${registro.desfecho?.nome || ''}"`
        ].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_crimes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const anos = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const meses = [
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

  return (
    <Layout title="Registros de Crimes Ambientais" showBackButton>
      <div className="space-y-4 sm:space-y-6 animate-fade-in w-full p-4 sm:p-6">
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por região, tipo de crime, enquadramento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 w-full sm:w-fit"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2 w-full sm:w-fit"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ano</label>
                  <Select value={filterAno} onValueChange={setFilterAno}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mês</label>
                  <Select value={filterMes} onValueChange={setFilterMes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os meses</SelectItem>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Região</label>
                  <Select value={filterRegiao} onValueChange={setFilterRegiao}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Crime</label>
                  <Select value={filterTipoCrime} onValueChange={setFilterTipoCrime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {tiposCrime.map(tipo => (
                        <SelectItem key={tipo.id_tipo_de_crime} value={tipo.id_tipo_de_crime}>
                          {tipo["Tipo de Crime"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Apreensão</label>
                  <Select value={filterApreensao} onValueChange={setFilterApreensao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sim">Com apreensão</SelectItem>
                      <SelectItem value="nao">Sem apreensão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela */}
        <div className="border border-border rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando registros...
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Data</TableHead>
                    <TableHead className="min-w-[120px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Região</TableHead>
                    <TableHead className="min-w-[140px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Tipo de Crime</TableHead>
                    <TableHead className="min-w-[140px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Enquadramento</TableHead>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-semibold text-xs sm:text-sm">Apreensão</TableHead>
                    <TableHead className="min-w-[120px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Procedimento</TableHead>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">Desfecho</TableHead>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-2 sm:py-3 text-right font-semibold text-xs sm:text-sm">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistros.map((registro) => (
                      <TableRow key={registro.id} className="hover:bg-muted/50">
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="text-xs sm:text-sm">{formatDate(registro.data)}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          <span className="text-xs sm:text-sm">{registro.regiao_administrativa?.nome || '-'}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className="text-xs sm:text-sm">{registro.tipo_crime?.["Tipo de Crime"] || '-'}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className="text-xs sm:text-sm">{registro.enquadramento?.["Enquadramento"] || '-'}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                          {registro.ocorreu_apreensao ? (
                            <span className="text-xs sm:text-sm text-green-600 font-medium">Sim</span>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="max-w-full truncate" title={registro.procedimento_legal || ''}>
                            <span className="text-xs sm:text-sm">{registro.procedimento_legal || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className="text-xs sm:text-sm">{registro.desfecho?.nome || '-'}</span>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(registro.id)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(registro.id)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(registro.id)}
                              className="h-8 w-8 p-0 flex-shrink-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredRegistros.length} de {registros.length} registros
        </div>
      </div>
    </Layout>
  );
};

export default RegistrosCrimes;
