import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  UserMinus, ArrowLeft, Search, Calendar, Users, Activity, AlertTriangle,
  Loader2, Palmtree, ChevronLeft, ChevronRight, Filter,
  Clock, CalendarDays, UserX, Shield, Trash2, Edit3
} from 'lucide-react';
import { NovoAfastamentoDialog } from '@/components/afastamentos/NovoAfastamentoDialog';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface Ferias {
  id: string;
  efetivo_id: string;
  ano: number;
  mes_inicio: number;
  dias: number;
  tipo: string;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

interface LicencaMedica {
  id: string;
  efetivo_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string | null;
  dias: number | null;
  tipo: string;
  cid: string | null;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

interface Restricao {
  id: string;
  efetivo_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string | null;
  tipo_restricao: string;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  };
}

interface AfastamentoConsolidado {
  id: string;
  tipo: 'ferias' | 'licenca' | 'restricao';
  policial: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
  } | null;
  data_inicio: Date;
  data_fim: Date | null;
  dias: number;
  subtipo: string;
  observacao?: string;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const tipoConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  ferias: { 
    icon: <Palmtree className="h-4 w-4" />, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-500/10 border-emerald-200',
    label: 'Férias' 
  },
  licenca: { 
    icon: <Activity className="h-4 w-4" />, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10 border-primary/30',
    label: 'Licença Médica' 
  },
  restricao: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-500/10 border-orange-200',
    label: 'Restrição' 
  },
};

const restricaoLabels: Record<string, { label: string; color: string }> = {
  'PO': { label: 'Policiamento Ostensivo', color: 'bg-red-500/15 text-red-600 border-red-200' },
  'PA': { label: 'Porte de Arma', color: 'bg-orange-500/15 text-orange-600 border-orange-200' },
  'SN': { label: 'Serviço Noturno', color: 'bg-purple-500/15 text-purple-600 border-purple-200' },
  'EF': { label: 'Educação Física', color: 'bg-primary/15 text-primary border-primary/30' },
};

const Afastamentos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('calendario');
  
  const [ferias, setFerias] = useState<Ferias[]>([]);
  const [licencas, setLicencas] = useState<LicencaMedica[]>([]);
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; tipo: 'ferias' | 'licenca' | 'restricao'; nome: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [feriasRes, licencasRes, restricoesRes] = await Promise.all([
        supabase
          .from('fat_ferias')
          .select('*, efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)')
          .eq('ano', ano),
        supabase
          .from('fat_licencas_medicas')
          .select('*, efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)')
          .eq('ano', ano),
        supabase
          .from('fat_restricoes')
          .select('*, efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra)')
          .eq('ano', ano)
      ]);

      if (feriasRes.error) throw feriasRes.error;
      if (licencasRes.error) throw licencasRes.error;
      if (restricoesRes.error) throw restricoesRes.error;

      setFerias(feriasRes.data || []);
      setLicencas(licencasRes.data || []);
      setRestricoes(restricoesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar afastamentos');
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('afastamentos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_licencas_medicas' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_restricoes' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Consolidar todos os afastamentos
  const afastamentosConsolidados = useMemo<AfastamentoConsolidado[]>(() => {
    const consolidados: AfastamentoConsolidado[] = [];

    // Férias
    ferias.forEach(f => {
      const dataInicio = new Date(ano, f.mes_inicio - 1, 1);
      const dataFim = new Date(ano, f.mes_inicio - 1 + Math.ceil(f.dias / 30), 0);
      consolidados.push({
        id: f.id,
        tipo: 'ferias',
        policial: f.efetivo || null,
        data_inicio: dataInicio,
        data_fim: dataFim,
        dias: f.dias,
        subtipo: f.tipo,
      });
    });

    // Licenças
    licencas.forEach(l => {
      consolidados.push({
        id: l.id,
        tipo: 'licenca',
        policial: l.efetivo || null,
        data_inicio: parseISO(l.data_inicio),
        data_fim: l.data_fim ? parseISO(l.data_fim) : null,
        dias: l.dias || 0,
        subtipo: l.tipo,
        observacao: l.observacao || undefined,
      });
    });

    // Restrições
    restricoes.forEach(r => {
      consolidados.push({
        id: r.id,
        tipo: 'restricao',
        policial: r.efetivo || null,
        data_inicio: parseISO(r.data_inicio),
        data_fim: r.data_fim ? parseISO(r.data_fim) : null,
        dias: 0,
        subtipo: r.tipo_restricao,
        observacao: r.observacao || undefined,
      });
    });

    return consolidados;
  }, [ferias, licencas, restricoes, ano]);

  // Afastamentos do mês selecionado
  const afastamentosDoMes = useMemo(() => {
    const inicioMes = startOfMonth(new Date(ano, mesSelecionado - 1));
    const fimMes = endOfMonth(new Date(ano, mesSelecionado - 1));

    return afastamentosConsolidados.filter(a => {
      if (a.tipo === 'ferias') {
        const feriaOriginal = ferias.find(f => f.id === a.id);
        return feriaOriginal?.mes_inicio === mesSelecionado;
      }
      
      if (!a.data_fim) {
        return a.data_inicio <= fimMes;
      }
      
      return a.data_inicio <= fimMes && a.data_fim >= inicioMes;
    }).filter(a => {
      if (tipoFiltro === 'todos') return true;
      return a.tipo === tipoFiltro;
    }).filter(a => {
      if (!search) return true;
      return (
        a.policial?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
        a.policial?.matricula?.includes(search)
      );
    });
  }, [afastamentosConsolidados, mesSelecionado, ano, tipoFiltro, search, ferias]);

  // Stats
  const stats = useMemo(() => ({
    totalFerias: ferias.length,
    totalLicencas: licencas.length,
    totalRestricoes: restricoes.length,
    afastadosHoje: afastamentosConsolidados.filter(a => {
      const hoje = new Date();
      if (a.tipo === 'ferias') {
        return a.data_inicio <= hoje && a.data_fim && a.data_fim >= hoje;
      }
      if (!a.data_fim) return a.data_inicio <= hoje;
      return a.data_inicio <= hoje && a.data_fim >= hoje;
    }).length,
  }), [ferias, licencas, restricoes, afastamentosConsolidados]);

  // Handle delete
  const handleDeleteClick = (item: AfastamentoConsolidado) => {
    setItemToDelete({
      id: item.id,
      tipo: item.tipo,
      nome: item.policial?.nome_guerra || 'Desconhecido'
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleting(true);
    try {
      let error;
      
      if (itemToDelete.tipo === 'ferias') {
        const result = await supabase.from('fat_ferias').delete().eq('id', itemToDelete.id);
        error = result.error;
      } else if (itemToDelete.tipo === 'licenca') {
        const result = await supabase.from('fat_licencas_medicas').delete().eq('id', itemToDelete.id);
        error = result.error;
      } else {
        const result = await supabase.from('fat_restricoes').delete().eq('id', itemToDelete.id);
        error = result.error;
      }
      
      if (error) throw error;
      
      toast.success('Afastamento excluído com sucesso');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir afastamento');
    } finally {
      setDeleting(false);
    }
  };

  // Dias do mês para calendário
  const diasDoMes = useMemo(() => {
    const inicioMes = startOfMonth(new Date(ano, mesSelecionado - 1));
    const fimMes = endOfMonth(new Date(ano, mesSelecionado - 1));
    return eachDayOfInterval({ start: inicioMes, end: fimMes });
  }, [ano, mesSelecionado]);

  const getAfastamentosNoDia = (dia: Date) => {
    return afastamentosConsolidados.filter(a => {
      if (a.tipo === 'ferias') {
        const feriaOriginal = ferias.find(f => f.id === a.id);
        if (!feriaOriginal) return false;
        return feriaOriginal.mes_inicio === dia.getMonth() + 1;
      }
      
      if (!a.data_fim) {
        return a.data_inicio <= dia;
      }
      
      return a.data_inicio <= dia && a.data_fim >= dia;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-4 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/secao-pessoas">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg shadow-rose-500/25">
                <UserMinus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestão de Afastamentos</h1>
                <p className="text-sm text-muted-foreground">Férias, licenças e restrições do efetivo</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NovoAfastamentoDialog ano={ano} onSuccess={fetchData} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setAno(ano - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2 font-bold">
                {ano}
              </Badge>
              <Button variant="outline" size="icon" onClick={() => setAno(ano + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <Palmtree className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{stats.totalFerias}</p>
                  <p className="text-xs text-muted-foreground">Férias Programadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/5 to-white border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.totalLicencas}</p>
                  <p className="text-xs text-muted-foreground">Licenças Médicas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalRestricoes}</p>
                  <p className="text-xs text-muted-foreground">Restrições Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10">
                  <UserX className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-600">{stats.afastadosHoje}</p>
                  <p className="text-xs text-muted-foreground">Afastados Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendário Mensal
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lista de Afastados
            </TabsTrigger>
          </TabsList>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar policial..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(parseInt(v))}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((mes, idx) => (
                      <SelectItem key={mes} value={String(idx + 1)}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="licenca">Licenças</SelectItem>
                    <SelectItem value="restricao">Restrições</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calendário */}
          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {MESES[mesSelecionado - 1]} {ano}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Headers */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                      <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {dia}
                      </div>
                    ))}
                    
                    {/* Empty cells for alignment */}
                    {Array.from({ length: diasDoMes[0].getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    
                    {/* Days */}
                    {diasDoMes.map(dia => {
                      const afastamentos = getAfastamentosNoDia(dia);
                      const temFerias = afastamentos.some(a => a.tipo === 'ferias');
                      const temLicenca = afastamentos.some(a => a.tipo === 'licenca');
                      const temRestricao = afastamentos.some(a => a.tipo === 'restricao');
                      
                      return (
                        <TooltipProvider key={dia.toISOString()}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className={`
                                  aspect-square p-1 rounded-lg border transition-all cursor-pointer
                                  ${isToday(dia) ? 'ring-2 ring-primary ring-offset-2' : ''}
                                  ${afastamentos.length > 0 ? 'bg-muted/50 hover:bg-muted' : 'hover:bg-muted/30'}
                                `}
                              >
                                <div className="text-xs font-medium text-center mb-1">
                                  {format(dia, 'd')}
                                </div>
                                <div className="flex flex-wrap gap-0.5 justify-center">
                                  {temFerias && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  )}
                                  {temLicenca && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                  {temRestricao && (
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                  )}
                                </div>
                              </div>
                            </TooltipTrigger>
                            {afastamentos.length > 0 && (
                              <TooltipContent side="bottom" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{format(dia, 'dd/MM/yyyy')}</p>
                                  <p className="text-xs">{afastamentos.length} afastamento(s)</p>
                                  <div className="space-y-0.5">
                                    {afastamentos.slice(0, 3).map(a => (
                                      <div key={a.id} className="text-xs flex items-center gap-1">
                                        <span className={tipoConfig[a.tipo].color}>●</span>
                                        {a.policial?.nome_guerra}
                                      </div>
                                    ))}
                                    {afastamentos.length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{afastamentos.length - 3} mais
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}

                {/* Legenda */}
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-4 justify-center">
                  {Object.entries(tipoConfig).map(([tipo, config]) => (
                    <div key={tipo} className="flex items-center gap-2 text-sm">
                      <div className={`w-3 h-3 rounded-full ${tipo === 'ferias' ? 'bg-emerald-500' : tipo === 'licenca' ? 'bg-primary' : 'bg-orange-500'}`} />
                      <span className="text-muted-foreground">{config.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista */}
          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Afastados em {MESES[mesSelecionado - 1]} ({afastamentosDoMes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : afastamentosDoMes.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Nenhum afastamento encontrado para este mês</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {afastamentosDoMes.map((afastamento) => {
                        const config = tipoConfig[afastamento.tipo];
                        const restricaoInfo = afastamento.tipo === 'restricao' 
                          ? restricaoLabels[afastamento.subtipo] 
                          : null;

                        return (
                          <div 
                            key={afastamento.id}
                            className={`
                              flex items-center justify-between p-4 rounded-xl border
                              ${config.bgColor} transition-all hover:shadow-sm group
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-white text-foreground text-xs font-bold">
                                  {afastamento.policial?.nome_guerra?.slice(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {afastamento.policial?.posto_graduacao}
                                  </Badge>
                                  <span className="font-semibold text-foreground">
                                    {afastamento.policial?.nome_guerra}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground font-mono">
                                    Mat: {afastamento.policial?.matricula}
                                  </span>
                                  {afastamento.observacao && (
                                    <span className="text-xs text-muted-foreground">
                                      • {afastamento.observacao.slice(0, 30)}...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <Badge className={`${config.bgColor} ${config.color} border`}>
                                  {config.icon}
                                  <span className="ml-1">
                                    {restricaoInfo ? restricaoInfo.label : config.label}
                                  </span>
                                </Badge>
                                {afastamento.tipo !== 'restricao' && afastamento.dias > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {afastamento.dias} dias
                                  </p>
                                )}
                              </div>
                              
                              {/* Delete button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(afastamento)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Afastamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o afastamento de <strong>{itemToDelete?.nome}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Afastamentos;
