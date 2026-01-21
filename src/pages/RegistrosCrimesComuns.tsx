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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface RegistroCrimeComum {
  id: string;
  data: string;
  horario_acionamento?: string;
  horario_desfecho?: string;
  regiao_administrativa?: { nome: string };
  tipo_penal?: { nome: string };
  tipo_area?: { 'Tipo de Área': string };
  latitude: string;
  longitude: string;
  natureza_crime?: string;
  enquadramento_legal?: string;
  ocorreu_apreensao: boolean;
  descricao_ocorrencia?: string;
  local_especifico?: string;
  vitimas_envolvidas?: number;
  suspeitos_envolvidos?: number;
  arma_utilizada?: boolean;
  tipo_arma?: string;
  material_apreendido?: boolean;
  descricao_material?: string;
  veiculo_envolvido?: boolean;
  tipo_veiculo?: string;
  placa_veiculo?: string;
  procedimento_legal?: string;
  qtd_detidos_maior?: number;
  qtd_detidos_menor?: number;
  qtd_liberados_maior?: number;
  qtd_liberados_menor?: number;
  observacoes?: string;
  desfecho?: { nome: string };
  created_at?: string;
}

const RegistrosCrimesComuns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('all');
  const [filterMes, setFilterMes] = useState('all');
  const [filterRegiao, setFilterRegiao] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<RegistroCrimeComum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regioes, setRegioes] = useState<Array<{ id: string; nome: string }>>([]);
  const [tiposPenais, setTiposPenais] = useState<Array<{ id: string; nome: string }>>([]);
  const [tiposArea, setTiposArea] = useState<Array<{ id: string; nome: string }>>([]);
  const [desfechos, setDesfechos] = useState<Array<{ id: string; nome: string }>>([]);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistroCrimeComum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistros();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [regioesRes, tiposPenaisRes, tiposAreaRes, desfechosRes] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabase.from('dim_tipo_penal').select('id, nome').order('nome'),
        supabase.from('dim_tipo_de_area').select('id, "Tipo de Área"'),
        supabase.from('dim_desfecho_crime_comum').select('id, nome').order('nome')
      ]);

      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposPenaisRes.data) setTiposPenais(tiposPenaisRes.data);
      if (tiposAreaRes.data) setTiposArea(tiposAreaRes.data.map(t => ({ id: t.id, nome: t['Tipo de Área'] || '' })));
      if (desfechosRes.data) setDesfechos(desfechosRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados de filtros:', error);
    }
  };

  const fetchRegistros = async () => {
    setIsLoading(true);
    try {
      const supabaseAny = supabase as any;
      
      const { data, error } = await supabaseAny
        .from('fat_crimes_comuns')
        .select(`
          *,
          regiao_administrativa:dim_regiao_administrativa(nome),
          tipo_penal:dim_tipo_penal(nome),
          tipo_area:dim_tipo_de_area(id, "Tipo de Área"),
          desfecho:dim_desfecho_crime_comum(nome)
        `)
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      setRegistros(data || []);
    } catch (error) {
      console.error('Erro ao buscar registros de crimes comuns:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros de crimes comuns'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = searchTerm === '' || 
      registro.regiao_administrativa?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.tipo_penal?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.natureza_crime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.procedimento_legal?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAno = filterAno === 'all' || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return registroDate.getFullYear().toString() === filterAno;
    })();

    const matchesMes = filterMes === 'all' || (() => {
      const registroDate = registro.data ? new Date(registro.data) : null;
      if (!registroDate) return false;
      return (registroDate.getMonth() + 1).toString() === filterMes;
    })();

    const matchesRegiao = filterRegiao === 'all' || 
      (registro as any).regiao_administrativa_id === filterRegiao;

    return matchesSearch && matchesAno && matchesMes && matchesRegiao;
  });

  const handleEdit = (registro: RegistroCrimeComum) => {
    setEditingRecord(registro);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    
    // Check if data is from 2026 or later
    const recordYear = new Date(editingRecord.data).getFullYear();
    if (recordYear < 2026) {
      toast.error('Somente registros de 2026 em diante podem ser editados');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('fat_crimes_comuns')
        .update({
          data: editingRecord.data,
          horario_acionamento: editingRecord.horario_acionamento,
          horario_desfecho: editingRecord.horario_desfecho,
          natureza_crime: editingRecord.natureza_crime,
          enquadramento_legal: editingRecord.enquadramento_legal,
          descricao_ocorrencia: editingRecord.descricao_ocorrencia,
          local_especifico: editingRecord.local_especifico,
          vitimas_envolvidas: editingRecord.vitimas_envolvidas,
          suspeitos_envolvidos: editingRecord.suspeitos_envolvidos,
          arma_utilizada: editingRecord.arma_utilizada,
          tipo_arma: editingRecord.tipo_arma,
          material_apreendido: editingRecord.material_apreendido,
          descricao_material: editingRecord.descricao_material,
          veiculo_envolvido: editingRecord.veiculo_envolvido,
          tipo_veiculo: editingRecord.tipo_veiculo,
          placa_veiculo: editingRecord.placa_veiculo,
          procedimento_legal: editingRecord.procedimento_legal,
          qtd_detidos_maior: editingRecord.qtd_detidos_maior,
          qtd_detidos_menor: editingRecord.qtd_detidos_menor,
          qtd_liberados_maior: editingRecord.qtd_liberados_maior,
          qtd_liberados_menor: editingRecord.qtd_liberados_menor,
          observacoes: editingRecord.observacoes,
          ocorreu_apreensao: editingRecord.ocorreu_apreensao,
          latitude: editingRecord.latitude,
          longitude: editingRecord.longitude,
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast.success('Registro atualizado com sucesso');
      setEditDialogOpen(false);
      fetchRegistros();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      toast.error(handleSupabaseError(error, 'atualizar o registro'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const registro = registros.find(r => r.id === id);
    if (registro) {
      const recordYear = new Date(registro.data).getFullYear();
      if (recordYear < 2026) {
        toast.error('Somente registros de 2026 em diante podem ser excluídos');
        return;
      }
    }

    if (!confirm('Tem certeza que deseja excluir este registro?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fat_crimes_comuns')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Registro excluído com sucesso');
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
      'Data', 'Horário Acionamento', 'Horário Desfecho', 'Região', 'Tipo Penal',
      'Natureza', 'Apreensão', 'Procedimento', 'Detidos Maior', 'Detidos Menor'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => {
        return [
          formatDate(registro.data),
          registro.horario_acionamento || '',
          registro.horario_desfecho || '',
          `"${registro.regiao_administrativa?.nome || ''}"`,
          `"${registro.tipo_penal?.nome || ''}"`,
          `"${registro.natureza_crime || ''}"`,
          registro.ocorreu_apreensao ? 'Sim' : 'Não',
          `"${registro.procedimento_legal || ''}"`,
          registro.qtd_detidos_maior || 0,
          registro.qtd_detidos_menor || 0,
        ].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_crimes_comuns_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const anos = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const meses = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const canEdit = (data: string) => new Date(data).getFullYear() >= 2026;

  return (
    <Layout title="Registros de Crimes Comuns" showBackButton>
      <div className="w-[75%] mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por região, tipo penal, natureza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ano</label>
                  <Select value={filterAno} onValueChange={setFilterAno}>
                    <SelectTrigger><SelectValue placeholder="Todos os anos" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Todos os meses" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as regiões</SelectItem>
                      {regioes.map(regiao => (
                        <SelectItem key={regiao.id} value={regiao.id}>{regiao.nome}</SelectItem>
                      ))}
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
            <div className="p-8 text-center text-muted-foreground">Carregando registros...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Tipo Penal</TableHead>
                    <TableHead>Natureza</TableHead>
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
                        <TableCell>{registro.tipo_penal?.nome || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{registro.natureza_crime || '-'}</TableCell>
                        <TableCell>
                          {registro.ocorreu_apreensao ? (
                            <span className="text-green-600 font-medium">Sim</span>
                          ) : (
                            <span className="text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{registro.procedimento_legal || '-'}</TableCell>
                        <TableCell>{registro.desfecho?.nome || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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

        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredRegistros.length} de {registros.length} registros
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Registro de Crime Comum</DialogTitle>
            </DialogHeader>
            {editingRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={editingRecord.data}
                      onChange={(e) => setEditingRecord({ ...editingRecord, data: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário Acionamento</Label>
                    <Input
                      type="time"
                      value={editingRecord.horario_acionamento || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, horario_acionamento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Natureza do Crime</Label>
                    <Input
                      value={editingRecord.natureza_crime || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, natureza_crime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Enquadramento Legal</Label>
                    <Input
                      value={editingRecord.enquadramento_legal || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, enquadramento_legal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição da Ocorrência</Label>
                  <Textarea
                    value={editingRecord.descricao_ocorrencia || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, descricao_ocorrencia: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      value={editingRecord.latitude}
                      onChange={(e) => setEditingRecord({ ...editingRecord, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      value={editingRecord.longitude}
                      onChange={(e) => setEditingRecord({ ...editingRecord, longitude: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingRecord.ocorreu_apreensao}
                      onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, ocorreu_apreensao: checked })}
                    />
                    <Label>Ocorreu Apreensão</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingRecord.arma_utilizada || false}
                      onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, arma_utilizada: checked })}
                    />
                    <Label>Arma Utilizada</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Procedimento Legal</Label>
                    <Input
                      value={editingRecord.procedimento_legal || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, procedimento_legal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Input
                      value={editingRecord.observacoes || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, observacoes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default RegistrosCrimesComuns;
