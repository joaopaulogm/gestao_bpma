import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Upload, Truck, Package, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  buscarFrota,
  buscarTGRL,
  criarFrota,
  criarTGRL,
  atualizarFrota,
  atualizarTGRL,
  deletarFrota,
  deletarTGRL,
  buscarEstatisticasFrota,
  buscarEstatisticasTGRL,
  Frota,
  TGRL,
} from '@/services/logisticaService';
import FrotaTable from '@/components/logistica/FrotaTable';
import TGRLTable from '@/components/logistica/TGRLTable';
import * as XLSX from 'xlsx';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';

const SecaoLogistica: React.FC = () => {
  // Estados para Frota
  const [frota, setFrota] = useState<Frota[]>([]);
  const [frotaLoading, setFrotaLoading] = useState(true);
  const [frotaFiltros, setFrotaFiltros] = useState({
    prefixo: '',
    situacao: '',
    tipo: '',
    localizacao: '',
  });

  // Estados para TGRL
  const [tgrl, setTGRL] = useState<TGRL[]>([]);
  const [tgrlLoading, setTGRLLoading] = useState(true);
  const [tgrlFiltros, setTGRLFiltros] = useState({
    tombamento: '',
    subitem: '',
    localizacao: '',
    estado_conservacao: '',
  });

  // Estados para estatísticas
  const [estatisticasFrota, setEstatisticasFrota] = useState<any>(null);
  const [estatisticasTGRL, setEstatisticasTGRL] = useState<any>(null);

  // Estados para diálogos
  const [frotaDialogOpen, setFrotaDialogOpen] = useState(false);
  const [tgrlDialogOpen, setTGRLDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'frota' | 'tgrl'>('frota');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados para formulários
  const [frotaForm, setFrotaForm] = useState<Partial<Frota>>({});
  const [tgrlForm, setTGRLForm] = useState<Partial<TGRL>>({});
  const [importing, setImporting] = useState(false);

  // Carregar dados
  useEffect(() => {
    carregarFrota();
    carregarTGRL();
    carregarEstatisticas();
  }, []);

  const carregarFrota = async () => {
    setFrotaLoading(true);
    try {
      const dados = await buscarFrota(frotaFiltros);
      setFrota(dados || []);
    } catch (error) {
      console.error('Erro ao carregar frota:', error);
      setFrota([]);
      // Não mostrar toast de erro se a tabela ainda não existe (migration não executada)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (!errorMessage.includes('does not exist') && !errorMessage.includes('relation') && !errorMessage.includes('table')) {
          toast.error('Erro ao carregar frota');
        }
      }
    } finally {
      setFrotaLoading(false);
    }
  };

  const carregarTGRL = async () => {
    setTGRLLoading(true);
    try {
      const dados = await buscarTGRL(tgrlFiltros);
      setTGRL(dados || []);
    } catch (error) {
      console.error('Erro ao carregar TGRL:', error);
      setTGRL([]);
      // Não mostrar toast de erro se a tabela ainda não existe (migration não executada)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (!errorMessage.includes('does not exist') && !errorMessage.includes('relation') && !errorMessage.includes('table')) {
          toast.error('Erro ao carregar TGRL');
        }
      }
    } finally {
      setTGRLLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const [frotaStats, tgrlStats] = await Promise.all([
        buscarEstatisticasFrota(),
        buscarEstatisticasTGRL(),
      ]);
      setEstatisticasFrota(frotaStats || {
        total: 0,
        disponiveis: 0,
        indisponiveis: 0,
        baixadas: 0,
        porTipo: {},
        porLocalizacao: {},
      });
      setEstatisticasTGRL(tgrlStats || {
        total: 0,
        porEstado: {},
        porLocalizacao: {},
        valorTotal: 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Definir valores padrão em caso de erro
      setEstatisticasFrota({
        total: 0,
        disponiveis: 0,
        indisponiveis: 0,
        baixadas: 0,
        porTipo: {},
        porLocalizacao: {},
      });
      setEstatisticasTGRL({
        total: 0,
        porEstado: {},
        porLocalizacao: {},
        valorTotal: 0,
      });
    }
  };

  useEffect(() => {
    carregarFrota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frotaFiltros.prefixo, frotaFiltros.situacao, frotaFiltros.tipo, frotaFiltros.localizacao]);

  useEffect(() => {
    carregarTGRL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tgrlFiltros.tombamento, tgrlFiltros.subitem, tgrlFiltros.localizacao, tgrlFiltros.estado_conservacao]);

  // Handlers para Frota
  const handleCriarFrota = async () => {
    try {
      if (!frotaForm.prefixo) {
        toast.error('Prefixo é obrigatório');
        return;
      }

      if (editingId) {
        await atualizarFrota(editingId, frotaForm);
        toast.success('Veículo atualizado com sucesso');
      } else {
        await criarFrota(frotaForm as any);
        toast.success('Veículo cadastrado com sucesso');
      }

      setFrotaDialogOpen(false);
      setFrotaForm({});
      setEditingId(null);
      await carregarFrota();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleEditarFrota = (id: string) => {
    const veiculo = frota.find(v => v.id === id);
    if (veiculo) {
      setFrotaForm(veiculo);
      setEditingId(id);
      setFrotaDialogOpen(true);
    }
  };

  const handleDeletarFrota = async () => {
    if (!selectedId) return;
    try {
      await deletarFrota(selectedId);
      toast.success('Veículo deletado com sucesso');
      setDeleteDialogOpen(false);
      setSelectedId(null);
      await carregarFrota();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao deletar veículo');
    }
  };

  // Handlers para TGRL
  const handleCriarTGRL = async () => {
    try {
      // Aceita descricao ou especificacao_bem para compatibilidade
      const descricao = tgrlForm.descricao || tgrlForm.especificacao_bem;
      if (!tgrlForm.tombamento || !descricao) {
        toast.error('Tombamento e descrição são obrigatórios');
        return;
      }

      // Mapeia especificacao_bem para descricao antes de enviar
      const dadosParaEnviar = {
        ...tgrlForm,
        descricao: descricao,
      };
      delete (dadosParaEnviar as any).especificacao_bem;

      if (editingId) {
        await atualizarTGRL(editingId, dadosParaEnviar);
        toast.success('Equipamento atualizado com sucesso');
      } else {
        await criarTGRL(dadosParaEnviar as any);
        toast.success('Equipamento cadastrado com sucesso');
      }

      setTGRLDialogOpen(false);
      setTGRLForm({});
      setEditingId(null);
      await carregarTGRL();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao salvar equipamento');
    }
  };

  const handleEditarTGRL = (id: string) => {
    const equipamento = tgrl.find(e => e.id === id);
    if (equipamento) {
      setTGRLForm(equipamento);
      setEditingId(id);
      setTGRLDialogOpen(true);
    }
  };

  const handleDeletarTGRL = async () => {
    if (!selectedId) return;
    try {
      await deletarTGRL(selectedId);
      toast.success('Equipamento deletado com sucesso');
      setDeleteDialogOpen(false);
      setSelectedId(null);
      await carregarTGRL();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao deletar equipamento');
    }
  };

  // Importação de planilhas
  const handleImportFrota = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames.find(name => 
        name.includes('MAPA') || name.includes('VTR') || name.includes('FROTA')
      ) || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      let sucesso = 0;
      let erros = 0;

      for (const row of jsonData) {
        try {
          const veiculo: Partial<Frota> = {
            prefixo: String(row['PREFIXO'] || row['prefixo'] || '').trim(),
            tombamento: String(row['TOMBAMENTO'] || row['tombamento'] || '').trim() || undefined,
            placa: String(row['PLACA'] || row['placa'] || '').trim() || undefined,
            chassi: String(row['CHASSI'] || row['chassi'] || '').trim() || undefined,
            tipo: String(row['TIPO'] || row['tipo'] || '').trim() || undefined,
            emprego: String(row['EMPREGO'] || row['emprego'] || '').trim() || undefined,
            marca: String(row['MARCA'] || row['marca'] || '').trim() || undefined,
            modelo: String(row['MODELO'] || row['modelo'] || '').trim() || undefined,
            ano_fabricacao: String(row['ANO DE FABRICAÇÃO'] || row['ano_fabricacao'] || row['ANO FABRICAÇÃO'] || '').trim() || undefined,
            localizacao: String(row['LOCALIZAÇÃO'] || row['localizacao'] || row['LOCAL QUE A VIATURA SE ENCONTRA'] || '').trim() || undefined,
            situacao: String(row['SITUAÇÃO'] || row['situacao'] || row['SITUAÇÃO'] || '').trim() || undefined,
            motivo_baixa: String(row['MOTIVO DA BAIXA'] || row['motivo_baixa'] || '').trim() || undefined,
            km_hm_atual: row['KM/HM ATUAL'] || row['km_hm_atual'] || row['KM ATUAL'] ? Number(row['KM/HM ATUAL'] || row['km_hm_atual'] || row['KM ATUAL']) : undefined,
            km_proxima_troca_pneu: row['KM DA PRÓXIMA TROCA DE PNEU'] || row['km_proxima_troca_pneu'] ? Number(row['KM DA PRÓXIMA TROCA DE PNEU'] || row['km_proxima_troca_pneu']) : undefined,
            km_hm_proxima_revisao: row['KM/HM DA PRÓXIMA REVISÃO'] || row['km_hm_proxima_revisao'] ? Number(row['KM/HM DA PRÓXIMA REVISÃO'] || row['km_hm_proxima_revisao']) : undefined,
            tombamento_kit_sinalizador: String(row['TOMBAMENTO DO KIT SINALIZADOR'] || row['tombamento_kit_sinalizador'] || '').trim() || undefined,
            tombamento_radio: String(row['TOMBAMENTO DO RÁDIO'] || row['tombamento_radio'] || '').trim() || undefined,
            numero_serie_radio: String(row['Nº DE SÉRIE DO RÁDIO'] || row['numero_serie_radio'] || '').trim() || undefined,
            responsavel: String(row['RESPONSÁVEL'] || row['responsavel'] || '').trim() || undefined,
            observacoes: String(row['OBSERVAÇÕES'] || row['observacoes'] || '').trim() || undefined,
          };

          if (!veiculo.prefixo) continue;

          // Verificar se já existe
          const existente = await buscarFrota({ prefixo: veiculo.prefixo });
          if (existente.length > 0) {
            await atualizarFrota(existente[0].id, veiculo);
          } else {
            await criarFrota(veiculo as any);
          }
          sucesso++;
        } catch (error) {
          erros++;
          console.error('Erro ao importar linha:', error);
        }
      }

      toast.success(`${sucesso} veículos importados com sucesso${erros > 0 ? `, ${erros} erros` : ''}`);
      await carregarFrota();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao importar planilha');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleImportTGRL = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames.find(name => 
        name.includes('TGRL') || name.includes('tgrl')
      ) || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      let sucesso = 0;
      let erros = 0;

      for (const row of jsonData) {
        try {
          const equipamento: Partial<TGRL> = {
            tombamento: String(row['TOMBAMENTO'] || row['tombamento'] || '').trim(),
            subitem: String(row['SUBITEM'] || row['subitem'] || '').trim() || undefined,
            especificacao_bem: String(row['ESPECIFICAÇÃO DO BEM'] || row['especificacao_bem'] || row['ESPECIFICAÇÃO'] || '').trim(),
            chassi_serie: String(row['CHASSI/SÉRIE'] || row['chassi_serie'] || row['CHASSI'] || '').trim() || undefined,
            valor: row['VALOR (R$)'] || row['valor'] || row['VALOR'] ? Number(row['VALOR (R$)'] || row['valor'] || row['VALOR']) : undefined,
            estado_conservacao: String(row['ESTADO DE CONSERVAÇÃO'] || row['estado_conservacao'] || row['ESTADO'] || '').trim() || undefined,
            localizacao: String(row['LOCALIZAÇÃO'] || row['localizacao'] || '').trim() || undefined,
            situacao: String(row['SITUAÇÃO'] || row['situacao'] || '').trim() || undefined,
            observacoes: String(row['OBSERVAÇÕES'] || row['observacoes'] || '').trim() || undefined,
          };

          if (!equipamento.tombamento || !equipamento.especificacao_bem) continue;

          // Verificar se já existe
          const existente = await buscarTGRL({ tombamento: equipamento.tombamento });
          if (existente.length > 0) {
            await atualizarTGRL(existente[0].id, equipamento);
          } else {
            await criarTGRL(equipamento as any);
          }
          sucesso++;
        } catch (error) {
          erros++;
          console.error('Erro ao importar linha:', error);
        }
      }

      toast.success(`${sucesso} equipamentos importados com sucesso${erros > 0 ? `, ${erros} erros` : ''}`);
      await carregarTGRL();
      await carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao importar planilha');
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Seção de Logística e Manutenção</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gestão de Frota e Equipamentos</p>
          </div>
        </div>
      </div>

      {/* Cards de Gestão separados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Gestão da Frota */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestão da Frota</CardTitle>
                <CardDescription>Veículos e Viaturas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{estatisticasFrota?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total de Veículos</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{estatisticasFrota?.disponiveis || 0}</div>
                <p className="text-xs text-muted-foreground">Disponíveis</p>
              </div>
              <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{estatisticasFrota?.indisponiveis || 0}</div>
                <p className="text-xs text-muted-foreground">Indisponíveis</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{estatisticasFrota?.baixadas || 0}</div>
                <p className="text-xs text-muted-foreground">Baixadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Gestão de Patrimônio */}
        <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Package className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestão de Patrimônio</CardTitle>
                <CardDescription>Equipamentos e Bens (TGRL)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{estatisticasTGRL?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Total de Itens</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{estatisticasTGRL?.porEstado?.['Bom'] || estatisticasTGRL?.porEstado?.['BOM'] || 0}</div>
                <p className="text-xs text-muted-foreground">Bom Estado</p>
              </div>
              <div className="col-span-2 text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estatisticasTGRL?.valorTotal || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Valor Total do Patrimônio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasFrota?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasFrota?.disponiveis || 0} disponíveis
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasTGRL?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Valor total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estatisticasTGRL?.valorTotal || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Indisponíveis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasFrota?.indisponiveis || 0}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasFrota?.baixadas || 0} baixados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipamentos em Bom Estado</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticasTGRL?.porEstado?.['BOM'] || 0}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticasTGRL?.porEstado?.['REGULAR'] || 0} regulares
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Frota e TGRL */}
      <Tabs defaultValue="frota" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frota">Frota</TabsTrigger>
          <TabsTrigger value="tgrl">TGRL</TabsTrigger>
        </TabsList>

        {/* Tab Frota */}
        <TabsContent value="frota" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Frota de Veículos</CardTitle>
                  <CardDescription>Gerencie os veículos da BPMA</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Dialog open={frotaDialogOpen} onOpenChange={setFrotaDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setFrotaForm({}); setEditingId(null); }} className="w-full sm:w-fit">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Veículo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Prefixo *</Label>
                          <Input
                            value={frotaForm.prefixo || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, prefixo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tombamento</Label>
                          <Input
                            value={frotaForm.tombamento || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, tombamento: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Placa</Label>
                          <Input
                            value={frotaForm.placa || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, placa: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Chassi</Label>
                          <Input
                            value={frotaForm.chassi || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, chassi: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Input
                            value={frotaForm.tipo || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, tipo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Emprego</Label>
                          <Select
                            value={frotaForm.emprego || ''}
                            onValueChange={(value) => setFrotaForm({ ...frotaForm, emprego: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPERACIONAL">Operacional</SelectItem>
                              <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Marca</Label>
                          <Input
                            value={frotaForm.marca || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, marca: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Modelo</Label>
                          <Input
                            value={frotaForm.modelo || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, modelo: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ano de Fabricação</Label>
                          <Input
                            type="number"
                            value={frotaForm.ano || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, ano: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Localização</Label>
                          <Input
                            value={frotaForm.localizacao || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, localizacao: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Situação</Label>
                          <Select
                            value={frotaForm.situacao || ''}
                            onValueChange={(value) => setFrotaForm({ ...frotaForm, situacao: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Disponível">Disponível</SelectItem>
                              <SelectItem value="Indisponível">Indisponível</SelectItem>
                              <SelectItem value="Baixada">Baixada</SelectItem>
                              <SelectItem value="Descarga">Descarga</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>KM Atual</Label>
                          <Input
                            type="number"
                            value={frotaForm.km_atual || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, km_atual: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </div>
                        <div className="space-y-2 col-span-1 sm:col-span-2">
                          <Label>Observações</Label>
                          <Textarea
                            value={frotaForm.observacoes || ''}
                            onChange={(e) => setFrotaForm({ ...frotaForm, observacoes: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
                        <Button variant="outline" onClick={() => setFrotaDialogOpen(false)} className="w-full sm:w-fit">
                          Cancelar
                        </Button>
                        <Button onClick={handleCriarFrota} className="w-full sm:w-fit">
                          {editingId ? 'Atualizar' : 'Salvar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" asChild className="w-full sm:w-fit">
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Importar'}
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleImportFrota}
                        disabled={importing}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Input
                    placeholder="Buscar por prefixo..."
                    value={frotaFiltros.prefixo}
                    onChange={(e) => setFrotaFiltros({ ...frotaFiltros, prefixo: e.target.value })}
                    className="w-full sm:flex-1 sm:max-w-xs"
                  />
                  <Select
                    value={frotaFiltros.situacao || 'all'}
                    onValueChange={(value) => setFrotaFiltros({ ...frotaFiltros, situacao: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Indisponível">Indisponível</SelectItem>
                      <SelectItem value="Baixada">Baixada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {frotaLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <FrotaTable
                    frota={frota}
                    onEdit={handleEditarFrota}
                    onDelete={(id) => {
                      setSelectedId(id);
                      setSelectedType('frota');
                      setDeleteDialogOpen(true);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab TGRL */}
        <TabsContent value="tgrl" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>TGRL - Equipamentos e Materiais</CardTitle>
                  <CardDescription>Termo de Guarda, Responsabilidade e Localização</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={tgrlDialogOpen} onOpenChange={setTGRLDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setTGRLForm({}); setEditingId(null); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Equipamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tombamento *</Label>
                          <Input
                            value={tgrlForm.tombamento || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, tombamento: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subitem</Label>
                          <Input
                            value={tgrlForm.subitem || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, subitem: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Descrição do Bem *</Label>
                          <Textarea
                            value={tgrlForm.descricao || tgrlForm.especificacao_bem || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, descricao: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Chassi/Série</Label>
                          <Input
                            value={tgrlForm.chassi_serie || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, chassi_serie: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input
                            type="number"
                            value={tgrlForm.valor || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, valor: e.target.value ? Number(e.target.value) : undefined })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado de Conservação</Label>
                          <Select
                            value={tgrlForm.estado_conservacao || ''}
                            onValueChange={(value) => setTGRLForm({ ...tgrlForm, estado_conservacao: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BOM">Bom</SelectItem>
                              <SelectItem value="REGULAR">Regular</SelectItem>
                              <SelectItem value="RUIM">Ruim</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Localização</Label>
                          <Input
                            value={tgrlForm.localizacao || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, localizacao: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Observações</Label>
                          <Textarea
                            value={tgrlForm.observacoes || ''}
                            onChange={(e) => setTGRLForm({ ...tgrlForm, observacoes: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setTGRLDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCriarTGRL}>
                          {editingId ? 'Atualizar' : 'Salvar'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" asChild>
                    <label>
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Importar'}
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleImportTGRL}
                        disabled={importing}
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por tombamento..."
                    value={tgrlFiltros.tombamento}
                    onChange={(e) => setTGRLFiltros({ ...tgrlFiltros, tombamento: e.target.value })}
                    className="max-w-xs"
                  />
                  <Select
                    value={tgrlFiltros.estado_conservacao || 'all'}
                    onValueChange={(value) => setTGRLFiltros({ ...tgrlFiltros, estado_conservacao: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="BOM">Bom</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="RUIM">Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {tgrlLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <TGRLTable
                    tgrl={tgrl}
                    onEdit={handleEditarTGRL}
                    onDelete={(id) => {
                      setSelectedId(id);
                      setSelectedType('tgrl');
                      setDeleteDialogOpen(true);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação de exclusão */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedId(null);
        }}
        onConfirm={selectedType === 'frota' ? handleDeletarFrota : handleDeletarTGRL}
        itemName={selectedType === 'frota' ? 'veículo' : 'equipamento'}
      />
    </div>
  );
};

export default SecaoLogistica;
