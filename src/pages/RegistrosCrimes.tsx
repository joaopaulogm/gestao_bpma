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
import CrimeAmbientalEditDialog from '@/components/crimes/CrimeAmbientalEditDialog';

interface RegistroCrime {
  id: string;
  data: string;
  regiao_administrativa?: { nome: string };
  regiao_administrativa_id?: string;
  tipo_crime?: { id_tipo_de_crime: string; "Tipo de Crime": string };
  tipo_crime_id?: string;
  enquadramento?: { "Enquadramento": string };
  tipo_area?: { "Tipo de Área": string };
  latitude: string;
  longitude: string;
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
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroCrime | null>(null);
  
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
      // Buscar registros de crime com relacionamentos corrigidos
      const { data, error } = await supabase
        .from('fat_registros_de_crime')
        .select(`
          id,
          data,
          regiao_administrativa_id,
          tipo_crime_id,
          enquadramento_id,
          tipo_area_id,
          desfecho_id,
          latitude,
          longitude,
          ocorreu_apreensao,
          procedimento_legal,
          qtd_detidos_maior,
          qtd_detidos_menor,
          qtd_liberados_maior,
          qtd_liberados_menor,
          created_at
        `)
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      // Buscar dados dimensionais separadamente para evitar problemas de relacionamento
      const [regioesRes, tiposCrimeRes, enquadramentosRes, tiposAreaRes, desfechosRes] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome'),
        supabase.from('dim_tipo_de_crime').select('id_tipo_de_crime, "Tipo de Crime"'),
        supabase.from('dim_enquadramento').select('id_enquadramento, "Enquadramento"'),
        supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"'),
        supabase.from('dim_desfecho_crime_ambientais').select('id, nome')
      ]);

      // Criar lookups
      const regioesLookup: Record<string, string> = {};
      (regioesRes.data || []).forEach((r: any) => { regioesLookup[r.id] = r.nome; });

      const tiposCrimeLookup: Record<string, string> = {};
      (tiposCrimeRes.data || []).forEach((t: any) => { tiposCrimeLookup[t.id_tipo_de_crime] = t["Tipo de Crime"]; });

      const enquadramentosLookup: Record<string, string> = {};
      (enquadramentosRes.data || []).forEach((e: any) => { enquadramentosLookup[e.id_enquadramento] = e["Enquadramento"]; });

      const tiposAreaLookup: Record<string, string> = {};
      (tiposAreaRes.data || []).forEach((a: any) => { tiposAreaLookup[a.id] = a["Tipo de Área"]; });

      const desfechosLookup: Record<string, string> = {};
      (desfechosRes.data || []).forEach((d: any) => { desfechosLookup[d.id] = d.nome; });

      // Enriquecer dados
      const registrosEnriquecidos = (data || []).map((r: any) => ({
        ...r,
        regiao_administrativa: r.regiao_administrativa_id ? { nome: regioesLookup[r.regiao_administrativa_id] } : null,
        tipo_crime: r.tipo_crime_id ? { 
          id_tipo_de_crime: r.tipo_crime_id, 
          "Tipo de Crime": tiposCrimeLookup[r.tipo_crime_id] 
        } : null,
        enquadramento: r.enquadramento_id ? { "Enquadramento": enquadramentosLookup[r.enquadramento_id] } : null,
        tipo_area: r.tipo_area_id ? { "Tipo de Área": tiposAreaLookup[r.tipo_area_id] } : null,
        desfecho: r.desfecho_id ? { nome: desfechosLookup[r.desfecho_id] } : null
      }));

      setRegistros(registrosEnriquecidos);
      console.log(`✅ Total de registros de crimes carregados: ${registrosEnriquecidos.length}`);
    } catch (error) {
      console.error('Erro ao buscar registros de crimes:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros de crimes'));
    } finally {
      setIsLoading(false);
    }
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

  const handleEdit = (registro: RegistroCrime) => {
    setEditingRegistro(registro);
    setEditDialogOpen(true);
  };

  const canEdit = (data: string) => new Date(data).getFullYear() >= 2026;

  const handleDelete = async (id: string) => {
    const registro = registros.find(r => r.id === id);
    if (registro && !canEdit(registro.data)) {
      toast.error('Somente registros de 2026 em diante podem ser excluídos');
      return;
    }

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
          registro.latitude,
          registro.longitude,
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por região, tipo de crime, enquadramento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Tipo de Crime</TableHead>
                    <TableHead>Enquadramento</TableHead>
                    <TableHead>Apreensão</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Desfecho</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                      <TableRow key={registro.id}>
                        <TableCell>{formatDate(registro.data)}</TableCell>
                        <TableCell>{registro.regiao_administrativa?.nome || '-'}</TableCell>
                        <TableCell>{registro.tipo_crime?.["Tipo de Crime"] || '-'}</TableCell>
                        <TableCell>{registro.enquadramento?.["Enquadramento"] || '-'}</TableCell>
                        <TableCell>
                          {registro.ocorreu_apreensao ? (
                            <span className="text-green-600 font-medium">Sim</span>
                          ) : (
                            <span className="text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {registro.procedimento_legal || '-'}
                        </TableCell>
                        <TableCell>{registro.desfecho?.nome || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(registro.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(registro)}
                              disabled={!canEdit(registro.data)}
                              className="h-8 w-8 p-0"
                              title={canEdit(registro.data) ? 'Editar' : 'Somente registros de 2026+'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(registro.id)}
                              disabled={!canEdit(registro.data)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title={canEdit(registro.data) ? 'Excluir' : 'Somente registros de 2026+'}
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

      <CrimeAmbientalEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        registro={editingRegistro}
        onSuccess={fetchRegistros}
        regioes={regioes}
        tiposCrime={tiposCrime}
      />
    </Layout>
  );
};

export default RegistrosCrimes;
