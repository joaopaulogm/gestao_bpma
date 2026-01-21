import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { handleSupabaseError } from '@/utils/errorHandler';
import { Search, Filter, Download, Edit, Trash2 } from 'lucide-react';
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

interface RegistroPrevencao {
  id: string;
  data: string;
  tipo_atividade?: { id: string; categoria: string; nome: string };
  regiao_administrativa?: { nome: string };
  latitude?: string;
  longitude?: string;
  quantidade_publico?: number;
  observacoes?: string;
  created_at?: string;
}

const RegistrosPrevencao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAno, setFilterAno] = useState('all');
  const [filterMes, setFilterMes] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [registros, setRegistros] = useState<RegistroPrevencao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regioes, setRegioes] = useState<Array<{ id: string; nome: string }>>([]);
  const [tiposAtividades, setTiposAtividades] = useState<Array<{ id: string; categoria: string; nome: string }>>([]);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistroPrevencao | null>(null);
  const [editFormData, setEditFormData] = useState<{
    data: string;
    tipo_atividade_id: string;
    regiao_administrativa_id: string;
    latitude: string;
    longitude: string;
    quantidade_publico: number;
    observacoes: string;
  }>({
    data: '',
    tipo_atividade_id: '',
    regiao_administrativa_id: '',
    latitude: '',
    longitude: '',
    quantidade_publico: 0,
    observacoes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRegistros();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const supabaseAny = supabase as any;
      const [regioesRes, tiposRes] = await Promise.all([
        supabase.from('dim_regiao_administrativa').select('id, nome').order('nome'),
        supabaseAny.from('dim_tipo_atividade_prevencao').select('id, categoria, nome').order('categoria').order('nome')
      ]);

      if (regioesRes.data) setRegioes(regioesRes.data);
      if (tiposRes.data) setTiposAtividades(tiposRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados de filtros:', error);
    }
  };

  const fetchRegistros = async () => {
    setIsLoading(true);
    try {
      const supabaseAny = supabase as any;
      
      const { data, error } = await supabaseAny
        .from('fat_atividades_prevencao')
        .select(`
          *,
          tipo_atividade:dim_tipo_atividade_prevencao(id, categoria, nome),
          regiao_administrativa:dim_regiao_administrativa(nome)
        `)
        .order('data', { ascending: false });

      if (error) {
        throw error;
      }

      setRegistros(data || []);
    } catch (error) {
      console.error('Erro ao buscar registros de atividades:', error);
      toast.error(handleSupabaseError(error, 'carregar os registros de atividades'));
    } finally {
      setIsLoading(false);
    }
  };

  const categorias = [...new Set(tiposAtividades.map(t => t.categoria))];

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = searchTerm === '' || 
      registro.tipo_atividade?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.tipo_atividade?.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.regiao_administrativa?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());

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

    const matchesCategoria = filterCategoria === 'all' || 
      registro.tipo_atividade?.categoria === filterCategoria;

    return matchesSearch && matchesAno && matchesMes && matchesCategoria;
  });

  const handleEdit = (registro: RegistroPrevencao) => {
    setEditingRecord(registro);
    setEditFormData({
      data: registro.data,
      tipo_atividade_id: (registro as any).tipo_atividade_id || '',
      regiao_administrativa_id: (registro as any).regiao_administrativa_id || '',
      latitude: registro.latitude || '',
      longitude: registro.longitude || '',
      quantidade_publico: registro.quantidade_publico || 0,
      observacoes: registro.observacoes || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    
    const recordYear = new Date(editFormData.data).getFullYear();
    if (recordYear < 2026) {
      toast.error('Somente registros de 2026 em diante podem ser editados');
      return;
    }

    setIsSaving(true);
    try {
      const supabaseAny = supabase as any;
      
      const { error } = await supabaseAny
        .from('fat_atividades_prevencao')
        .update({
          data: editFormData.data,
          tipo_atividade_id: editFormData.tipo_atividade_id || null,
          regiao_administrativa_id: editFormData.regiao_administrativa_id || null,
          latitude: editFormData.latitude || null,
          longitude: editFormData.longitude || null,
          quantidade_publico: editFormData.quantidade_publico,
          observacoes: editFormData.observacoes || null,
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
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('fat_atividades_prevencao')
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
    const headers = ['Data', 'Categoria', 'Atividade', 'Região', 'Público', 'Latitude', 'Longitude', 'Observações'];

    const csvRows = [
      headers.join(','),
      ...filteredRegistros.map(registro => {
        return [
          formatDate(registro.data),
          `"${registro.tipo_atividade?.categoria || ''}"`,
          `"${registro.tipo_atividade?.nome || ''}"`,
          `"${registro.regiao_administrativa?.nome || ''}"`,
          registro.quantidade_publico || 0,
          registro.latitude || '',
          registro.longitude || '',
          `"${registro.observacoes || ''}"`,
        ].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registros_prevencao_${new Date().toISOString().split('T')[0]}.csv`);
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
    <Layout title="Registros de Atividades de Prevenção" showBackButton>
      <div className="space-y-4 sm:space-y-6 animate-fade-in w-full">
        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por atividade, categoria, região..."
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
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                    <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                    <TableHead>Categoria</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Público</TableHead>
                    <TableHead>Observações</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistros.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell>{formatDate(registro.data)}</TableCell>
                        <TableCell>{registro.tipo_atividade?.categoria || '-'}</TableCell>
                        <TableCell>{registro.tipo_atividade?.nome || '-'}</TableCell>
                        <TableCell>{registro.regiao_administrativa?.nome || '-'}</TableCell>
                        <TableCell>{registro.quantidade_publico || 0}</TableCell>
                        <TableCell className="max-w-xs truncate">{registro.observacoes || '-'}</TableCell>
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
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Registro de Atividade</DialogTitle>
            </DialogHeader>
            {editingRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={editFormData.data}
                      onChange={(e) => setEditFormData({ ...editFormData, data: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Público Atendido</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editFormData.quantidade_publico}
                      onChange={(e) => setEditFormData({ ...editFormData, quantidade_publico: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Atividade</Label>
                  <Select 
                    value={editFormData.tipo_atividade_id} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, tipo_atividade_id: value })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {tiposAtividades.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.categoria} - {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Região Administrativa</Label>
                  <Select 
                    value={editFormData.regiao_administrativa_id} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, regiao_administrativa_id: value })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {regioes.map(regiao => (
                        <SelectItem key={regiao.id} value={regiao.id}>{regiao.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      value={editFormData.latitude}
                      onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                      placeholder="Ex: -15.7801"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      value={editFormData.longitude}
                      onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                      placeholder="Ex: -47.9292"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={editFormData.observacoes}
                    onChange={(e) => setEditFormData({ ...editFormData, observacoes: e.target.value })}
                    rows={3}
                  />
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

export default RegistrosPrevencao;
