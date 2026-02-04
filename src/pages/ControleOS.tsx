import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, FileText, Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface OrdemServico {
  id: string;
  numero_os: string;
  numero_evento: string | null;
  referencia_sei: string | null;
  data_evento: string;
  horario_inicio: string | null;
  horario_termino: string | null;
  local_evento: string | null;
  tipo_servico: string | null;
  situacao: string | null;
  missao_policiamento: string | null;
  confidence_score: number | null;
  drive_folder_path: string | null;
  created_at: string;
  extracted_data: any;
}

interface ProcessResult {
  success: boolean;
  processed: number;
  results: Array<{
    file: string;
    status: string;
    numero_os?: string;
    folder?: string;
    confidence?: number;
    error?: string;
  }>;
}

interface ListResult {
  success: boolean;
  total_files: number;
  processed_count: number;
  pending_count: number;
  folders: string[];
  pending_files: Array<{ id: string; name: string; folder: string }>;
}

const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const ControleOS: React.FC = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ProcessResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterSituacao, setFilterSituacao] = useState<string>('all');
  const [filterStatusValidade, setFilterStatusValidade] = useState<string>('all'); // ativo | inativo
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [osToDelete, setOsToDelete] = useState<OrdemServico | null>(null);
  const [osToEdit, setOsToEdit] = useState<OrdemServico | null>(null);

  // Fetch OS cadastradas
  const { data: ordensServico, isLoading: isLoadingOS } = useQuery({
    queryKey: ['fat_ordens_servico', filterYear, filterMonth, filterSituacao, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('fat_ordens_servico')
        .select('*')
        .order('data_evento', { ascending: false });

      // Filtro por ano
      if (filterYear && filterYear !== 'all') {
        const startDate = `${filterYear}-01-01`;
        const endDate = `${filterYear}-12-31`;
        query = query.gte('data_evento', startDate).lte('data_evento', endDate);
      }

      // Filtro por situação
      if (filterSituacao && filterSituacao !== 'all') {
        query = query.eq('situacao', filterSituacao);
      }

      // Busca textual
      if (searchTerm) {
        query = query.or(`numero_os.ilike.%${searchTerm}%,local_evento.ilike.%${searchTerm}%,numero_evento.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as OrdemServico[];
    }
  });

  // Fetch status do Drive
  const { data: driveStatus, refetch: refetchDriveStatus } = useQuery({
    queryKey: ['os_drive_status', filterYear, filterMonth],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-os-folder', {
        body: { 
          action: 'list',
          year: parseInt(filterYear),
          month: filterMonth !== 'all' ? filterMonth : undefined
        }
      });
      if (error) throw error;
      return data as ListResult;
    },
    enabled: false // Só buscar quando solicitado
  });

  // Mutation para processar OS
  const processOS = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('process-os-folder', {
        body: { 
          action: 'process', 
          limit: 5,
          year: parseInt(filterYear),
          month: filterMonth !== 'all' ? filterMonth : undefined
        }
      });
      
      if (error) throw error;
      return data as ProcessResult;
    },
    onSuccess: (result) => {
      setLastResult(result);
      queryClient.invalidateQueries({ queryKey: ['fat_ordens_servico'] });
      
      const successCount = result.results?.filter(r => r.status === 'success').length || 0;
      const errorCount = result.results?.filter(r => r.status === 'error').length || 0;
      
      if (successCount > 0) {
        toast.success(`${successCount} OS processada(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} erro(s) no processamento`);
      }
      if (successCount === 0 && errorCount === 0) {
        toast.info('Nenhuma nova OS para processar');
      }
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Status por validade: ativo = data do evento dentro da validade (hoje ou futuro), inativo = data já passou
  const getStatusValidade = (dataEvento: string): 'ativo' | 'inativo' => {
    const hoje = startOfDay(new Date());
    const dataEventoDay = startOfDay(new Date(dataEvento));
    return isBefore(dataEventoDay, hoje) ? 'inativo' : 'ativo';
  };

  const getStatusValidadeBadge = (dataEvento: string) => {
    const status = getStatusValidade(dataEvento);
    return status === 'ativo' ? (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
    ) : (
      <Badge className="bg-muted text-muted-foreground border-border">Inativo</Badge>
    );
  };

  const getSituacaoBadge = (situacao: string | null) => {
    switch (situacao?.toUpperCase()) {
      case 'ATIVA':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ativa</Badge>;
      case 'CONCLUÍDA':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Concluída</Badge>;
      case 'CANCELADA':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{situacao || 'N/A'}</Badge>;
    }
  };

  const getConfidenceBadge = (score: number | null) => {
    if (!score) return null;
    if (score >= 80) return <Badge className="bg-green-500/20 text-green-400">{score}%</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500/20 text-yellow-400">{score}%</Badge>;
    return <Badge className="bg-red-500/20 text-red-400">{score}%</Badge>;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  };

  // Filtro por status (ativo/inativo por validade da data)
  const ordensFiltradas = React.useMemo(() => {
    if (!ordensServico) return [];
    if (filterStatusValidade === 'ativo') return ordensServico.filter(o => getStatusValidade(o.data_evento) === 'ativo');
    if (filterStatusValidade === 'inativo') return ordensServico.filter(o => getStatusValidade(o.data_evento) === 'inativo');
    return ordensServico;
  }, [ordensServico, filterStatusValidade]);

  // Stats (status por validade: ativo = dentro da validade, inativo = passou da validade)
  const stats = {
    total: ordensServico?.length || 0,
    ativas: ordensServico?.filter(o => getStatusValidade(o.data_evento) === 'ativo').length || 0,
    inativas: ordensServico?.filter(o => getStatusValidade(o.data_evento) === 'inativo').length || 0,
    concluidas: ordensServico?.filter(o => o.situacao?.toUpperCase() === 'CONCLUÍDA').length || 0,
    pendentes: driveStatus?.pending_count || 0
  };

  // Mutation para excluir OS
  const deleteOS = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fat_ordens_servico').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fat_ordens_servico'] });
      setOsToDelete(null);
      toast.success('OS excluída com sucesso.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao excluir OS.');
    }
  });

  // Mutation para editar OS
  const updateOS = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<OrdemServico> }) => {
      const { error } = await supabase.from('fat_ordens_servico').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fat_ordens_servico'] });
      setOsToEdit(null);
      toast.success('OS atualizada com sucesso.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao atualizar OS.');
    }
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Controle de Ordens de Serviço</h1>
            <p className="text-sm text-muted-foreground">Sincronização automática com Google Drive</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchDriveStatus()}
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Drive
          </Button>
          <Button
            onClick={() => processOS.mutate()}
            disabled={isProcessing}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Processar OS
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de OS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ativas}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inativas}</p>
                <p className="text-xs text-muted-foreground">Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
                <p className="text-xs text-muted-foreground">Pendentes no Drive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Result */}
      {lastResult && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Último Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastResult.results?.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm truncate flex-1">{r.file}</span>
                  {r.status === 'success' ? (
                    <Badge className="bg-green-500/20 text-green-400">
                      {r.numero_os} - {r.confidence}%
                    </Badge>
                  ) : r.status === 'skipped' ? (
                    <Badge variant="outline">Já processado</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400">Erro</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {MESES.map((mes) => (
                  <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterSituacao} onValueChange={setFilterSituacao}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ATIVA">Ativa</SelectItem>
                <SelectItem value="CONCLUÍDA">Concluída</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatusValidade} onValueChange={setFilterStatusValidade}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ordens de Serviço Cadastradas
          </CardTitle>
          <CardDescription>
            {ordensFiltradas?.length ?? 0} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOS ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ordensFiltradas && ordensFiltradas.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° OS</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Término</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensFiltradas.map((os) => (
                    <TableRow key={os.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {os.numero_os}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(os.data_evento)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(os.data_evento)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(os.horario_inicio)} – {formatTime(os.horario_termino)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          {os.local_evento || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {os.tipo_servico || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {os.numero_evento || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusValidadeBadge(os.data_evento)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedOS(os)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setOsToEdit(os)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setOsToDelete(os)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma OS encontrada</p>
              <p className="text-sm">Clique em "Processar OS" para sincronizar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedOS} onOpenChange={() => setSelectedOS(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              OS {selectedOS?.numero_os}
            </DialogTitle>
            <DialogDescription>
              Detalhes da Ordem de Serviço
            </DialogDescription>
          </DialogHeader>
          
          {selectedOS && (
            <div className="space-y-4">
              {/* Identificação */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Número da OS</label>
                  <p className="font-mono">{selectedOS.numero_os}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Número do Evento</label>
                  <p className="font-mono">{selectedOS.numero_evento || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Referência SEI</label>
                  <p className="font-mono">{selectedOS.referencia_sei || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Situação</label>
                  <div>{getSituacaoBadge(selectedOS.situacao)}</div>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Data</label>
                  <p>{formatDate(selectedOS.data_evento)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Início</label>
                  <p>{formatTime(selectedOS.horario_inicio)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Término</label>
                  <p>{formatTime(selectedOS.horario_termino)}</p>
                </div>
              </div>

              {/* Local */}
              <div>
                <label className="text-xs text-muted-foreground">Local do Evento</label>
                <p>{selectedOS.local_evento || '-'}</p>
              </div>

              {/* Tipo e Missão */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Tipo de Serviço</label>
                  <p>{selectedOS.tipo_servico || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Confiança da Extração</label>
                  <div>{getConfidenceBadge(selectedOS.confidence_score)}</div>
                </div>
              </div>

              {/* Missão */}
              {selectedOS.missao_policiamento && (
                <div>
                  <label className="text-xs text-muted-foreground">Missão do Policiamento</label>
                  <p className="text-sm bg-muted/50 p-2 rounded">{selectedOS.missao_policiamento}</p>
                </div>
              )}

              {/* Prescrições */}
              {selectedOS.extracted_data && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Prescrições</label>
                  {selectedOS.extracted_data.prescricoes_s1 && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <strong>S1:</strong> {selectedOS.extracted_data.prescricoes_s1}
                    </div>
                  )}
                  {selectedOS.extracted_data.prescricoes_s2 && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <strong>S2:</strong> {selectedOS.extracted_data.prescricoes_s2}
                    </div>
                  )}
                  {selectedOS.extracted_data.prescricoes_s3 && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <strong>S3:</strong> {selectedOS.extracted_data.prescricoes_s3}
                    </div>
                  )}
                  {selectedOS.extracted_data.prescricoes_s4 && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <strong>S4:</strong> {selectedOS.extracted_data.prescricoes_s4}
                    </div>
                  )}
                </div>
              )}

              {/* Efetivo */}
              {selectedOS.extracted_data?.efetivo && selectedOS.extracted_data.efetivo.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Efetivo Designado
                  </label>
                  <div className="mt-2 space-y-1">
                    {selectedOS.extracted_data.efetivo.map((m: any, i: number) => (
                      <div key={i} className="text-sm bg-muted/50 p-2 rounded flex justify-between">
                        <span>{m.posto_graduacao} {m.nome}</span>
                        <span className="text-muted-foreground">{m.funcao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadados */}
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p>Pasta: {selectedOS.drive_folder_path}</p>
                <p>Processado em: {format(new Date(selectedOS.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de exclusão */}
      <AlertDialog open={!!osToDelete} onOpenChange={() => setOsToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir OS</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a OS {osToDelete?.numero_os}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOS.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => osToDelete && deleteOS.mutate(osToDelete.id)}
              disabled={deleteOS.isPending}
            >
              {deleteOS.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edição */}
      <Dialog open={!!osToEdit} onOpenChange={() => setOsToEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar OS {osToEdit?.numero_os}</DialogTitle>
            <DialogDescription>Altere os campos desejados e salve.</DialogDescription>
          </DialogHeader>
          {osToEdit && (
            <FormEditarOS
              os={osToEdit}
              onSave={(payload) => updateOS.mutate({ id: osToEdit.id, payload })}
              onCancel={() => setOsToEdit(null)}
              isSaving={updateOS.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Formulário inline para edição rápida da OS */
function FormEditarOS({
  os,
  onSave,
  onCancel,
  isSaving
}: {
  os: OrdemServico;
  onSave: (payload: Partial<OrdemServico>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [dataEvento, setDataEvento] = useState(os.data_evento);
  const [horarioInicio, setHorarioInicio] = useState(os.horario_inicio ?? '');
  const [horarioTermino, setHorarioTermino] = useState(os.horario_termino ?? '');
  const [localEvento, setLocalEvento] = useState(os.local_evento ?? '');
  const [tipoServico, setTipoServico] = useState(os.tipo_servico ?? '');
  const [numeroEvento, setNumeroEvento] = useState(os.numero_evento ?? '');
  const [situacao, setSituacao] = useState(os.situacao ?? 'ATIVA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      data_evento: dataEvento,
      horario_inicio: horarioInicio || null,
      horario_termino: horarioTermino || null,
      local_evento: localEvento || null,
      tipo_servico: tipoServico || null,
      numero_evento: numeroEvento || null,
      situacao: situacao || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Data do evento</label>
          <Input
            type="date"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Situação</label>
          <Select value={situacao} onValueChange={setSituacao}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ATIVA">Ativa</SelectItem>
              <SelectItem value="CONCLUÍDA">Concluída</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Horário início</label>
          <Input
            type="time"
            value={horarioInicio}
            onChange={(e) => setHorarioInicio(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Horário término</label>
          <Input
            type="time"
            value={horarioTermino}
            onChange={(e) => setHorarioTermino(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Local</label>
        <Input
          value={localEvento}
          onChange={(e) => setLocalEvento(e.target.value)}
          placeholder="Local do evento"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Tipo de serviço</label>
        <Input
          value={tipoServico}
          onChange={(e) => setTipoServico(e.target.value)}
          placeholder="Ex: Policiamento ordinário"
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Número do evento</label>
        <Input
          value={numeroEvento}
          onChange={(e) => setNumeroEvento(e.target.value)}
          placeholder="Ex: 190.31212.2026"
          className="mt-1"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}

export default ControleOS;
