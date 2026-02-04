import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Upload, Truck, Package, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import PatrimonioDashboard from '@/components/logistica/PatrimonioDashboard';
import * as XLSX from 'xlsx';
import DeleteConfirmationDialog from '@/components/fauna/DeleteConfirmationDialog';
import { buscarValorFipePorNome, parseValorFipe } from '@/services/fipeService';
import { DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [viewFrota, setViewFrota] = useState<Frota | null>(null);
  const [viewTgrl, setViewTgrl] = useState<TGRL | null>(null);
  const [fipeLoading, setFipeLoading] = useState(false);

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
        valorTotal: 0,
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
        valorTotal: 0,
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

      {/* ========== CARD 1: Gestão de Frota ========== */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestão de Frota</CardTitle>
                <CardDescription>Veículos e Viaturas. Busque por filtros; registre, edite, exclua ou visualize.</CardDescription>
              </div>
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
                        <div className="space-y-2 flex flex-col sm:col-span-2">
                          <Label>Valor de aquisição (R$) / Valor médio FIPE</Label>
                          <div className="flex gap-2 flex-wrap">
                            <Input
                              type="number"
                              placeholder="Valor ou consulte FIPE"
                              className="flex-1 min-w-[140px]"
                              value={frotaForm.valor_aquisicao ?? ''}
                              onChange={(e) => setFrotaForm({ ...frotaForm, valor_aquisicao: e.target.value ? Number(e.target.value) : undefined })}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!frotaForm.marca || fipeLoading}
                              onClick={async () => {
                                setFipeLoading(true);
                                try {
                                  const res = await buscarValorFipePorNome(
                                    frotaForm.marca!,
                                    frotaForm.modelo,
                                    frotaForm.ano ?? (frotaForm as any).ano_fabricacao,
                                    frotaForm.tipo
                                  );
                                  if (res.success && res.valor?.Valor) {
                                    const num = parseValorFipe(res.valor.Valor);
                                    if (num != null) {
                                      setFrotaForm((f) => ({ ...f, valor_aquisicao: num }));
                                      toast.success(`Valor FIPE: ${res.valor.Valor}`);
                                    }
                                  } else {
                                    toast.error(res.error ?? 'Veículo não encontrado na tabela FIPE');
                                  }
                                } catch {
                                  toast.error('Erro ao consultar FIPE');
                                } finally {
                                  setFipeLoading(false);
                                }
                              }}
                            >
                              {fipeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Consultar FIPE'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Informe marca, modelo e ano e clique em &quot;Consultar FIPE&quot; para obter o valor médio (Tabela FIPE / veiculos.fipe.org.br).
                          </p>
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
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Input
                    placeholder="Buscar por prefixo..."
                    value={frotaFiltros.prefixo}
                    onChange={(e) => setFrotaFiltros({ ...frotaFiltros, prefixo: e.target.value })}
                    className="w-full sm:max-w-[180px]"
                  />
                  <Select
                    value={frotaFiltros.situacao || 'all'}
                    onValueChange={(value) => setFrotaFiltros({ ...frotaFiltros, situacao: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Indisponível">Indisponível</SelectItem>
                      <SelectItem value="Baixada">Baixada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tipo..."
                    value={frotaFiltros.tipo}
                    onChange={(e) => setFrotaFiltros({ ...frotaFiltros, tipo: e.target.value })}
                    className="w-full sm:max-w-[160px]"
                  />
                  <Input
                    placeholder="Localização..."
                    value={frotaFiltros.localizacao}
                    onChange={(e) => setFrotaFiltros({ ...frotaFiltros, localizacao: e.target.value })}
                    className="w-full sm:max-w-[180px]"
                  />
                </div>
                {frotaLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <FrotaTable
                    frota={frota}
                    onView={(id) => setViewFrota(frota.find((f) => f.id === id) ?? null)}
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

      {/* ========== CARD 2: Gestão de Equipamentos e Bens ========== */}
      <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Gestão de Equipamentos e Bens</CardTitle>
                <CardDescription>TGRL. Busque por filtros; registre, edite, exclua ou visualize.</CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
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
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Input
                    placeholder="Buscar por tombamento..."
                    value={tgrlFiltros.tombamento}
                    onChange={(e) => setTGRLFiltros({ ...tgrlFiltros, tombamento: e.target.value })}
                    className="w-full sm:max-w-[180px]"
                  />
                  <Input
                    placeholder="Subitem..."
                    value={tgrlFiltros.subitem}
                    onChange={(e) => setTGRLFiltros({ ...tgrlFiltros, subitem: e.target.value })}
                    className="w-full sm:max-w-[140px]"
                  />
                  <Input
                    placeholder="Localização..."
                    value={tgrlFiltros.localizacao}
                    onChange={(e) => setTGRLFiltros({ ...tgrlFiltros, localizacao: e.target.value })}
                    className="w-full sm:max-w-[180px]"
                  />
                  <Select
                    value={tgrlFiltros.estado_conservacao || 'all'}
                    onValueChange={(value) => setTGRLFiltros({ ...tgrlFiltros, estado_conservacao: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger className="w-full sm:w-[160px]">
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
                    onView={(id) => setViewTgrl(tgrl.find((t) => t.id === id) ?? null)}
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

      {/* ========== CARD 3: Gestão de Patrimônio ========== */}
      <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Gestão de Patrimônio</CardTitle>
              <CardDescription>Informação de todo o patrimônio. Dashboard interativo com filtros e segmentação.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PatrimonioDashboard estatisticasFrota={estatisticasFrota} estatisticasTGRL={estatisticasTGRL} />
        </CardContent>
      </Card>

      {/* Modal Ver Frota */}
      <Dialog open={!!viewFrota} onOpenChange={() => setViewFrota(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {viewFrota?.prefixo} {viewFrota?.placa && `· ${viewFrota.placa}`}
            </DialogTitle>
            <DialogDescription>Detalhes do veículo</DialogDescription>
          </DialogHeader>
          {viewFrota && (
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tombamento:</span> {viewFrota.tombamento || '-'}</div>
                <div><span className="text-muted-foreground">Tipo:</span> {viewFrota.tipo || '-'}</div>
                <div><span className="text-muted-foreground">Marca/Modelo:</span> {[viewFrota.marca, viewFrota.modelo].filter(Boolean).join(' ') || '-'}</div>
                <div><span className="text-muted-foreground">Ano:</span> {viewFrota.ano ?? viewFrota.ano_fabricacao ?? '-'}</div>
                <div><span className="text-muted-foreground">Situação:</span> {viewFrota.situacao || '-'}</div>
                <div><span className="text-muted-foreground">Localização:</span> {viewFrota.localizacao || '-'}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> {viewFrota.observacoes || '-'}</div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewFrota(null)}>Fechar</Button>
            {viewFrota && (
              <Button onClick={() => { handleEditarFrota(viewFrota.id); setViewFrota(null); }}>Editar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver TGRL */}
      <Dialog open={!!viewTgrl} onOpenChange={() => setViewTgrl(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {viewTgrl?.tombamento} {viewTgrl?.subitem && `· ${viewTgrl.subitem}`}
            </DialogTitle>
            <DialogDescription>Detalhes do equipamento / bem</DialogDescription>
          </DialogHeader>
          {viewTgrl && (
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2"><span className="text-muted-foreground">Descrição:</span> {viewTgrl.descricao || viewTgrl.especificacao_bem || '-'}</div>
                <div><span className="text-muted-foreground">Valor:</span> {(viewTgrl.valor_aquisicao ?? viewTgrl.valor) != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(viewTgrl.valor_aquisicao ?? viewTgrl.valor)) : '-'}</div>
                <div><span className="text-muted-foreground">Estado:</span> {viewTgrl.estado_conservacao || '-'}</div>
                <div><span className="text-muted-foreground">Localização:</span> {viewTgrl.localizacao || '-'}</div>
                <div><span className="text-muted-foreground">Chassi/Série:</span> {viewTgrl.chassi_serie || '-'}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> {viewTgrl.observacoes || '-'}</div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTgrl(null)}>Fechar</Button>
            {viewTgrl && (
              <Button onClick={() => { handleEditarTGRL(viewTgrl.id); setViewTgrl(null); }}>Editar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
