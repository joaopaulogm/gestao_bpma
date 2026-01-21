import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Gift, ArrowLeft, Search, Calendar, Users, Filter, ChevronDown, CalendarDays, Edit2, ArrowRightLeft, X, Loader2, Plus, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NovoAbonoDialog } from '@/components/abono/NovoAbonoDialog';

interface Militar {
  id: string;
  matricula: string;
  posto: string;
  nome: string;
  nome_guerra: string;
}

interface MesAbono {
  mes: string;
  numero: number;
  militares: Militar[];
}

const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const postoColors: Record<string, string> = {
  'ST': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  '1º SGT': 'bg-primary/20 text-primary/80 border-primary/30',
  '2º SGT': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  '3º SGT': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'CB': 'bg-green-500/20 text-green-400 border-green-500/30',
  'SD': 'bg-primary/20 text-primary/80 border-primary/30',
};

const mesColors = [
  'from-primary/20 to-primary/10',
  'from-purple-500/20 to-purple-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-rose-500/20 to-rose-600/10',
  'from-orange-500/20 to-orange-600/10',
  'from-amber-500/20 to-amber-600/10',
  'from-yellow-500/20 to-yellow-600/10',
  'from-lime-500/20 to-lime-600/10',
  'from-green-500/20 to-green-600/10',
  'from-emerald-500/20 to-emerald-600/10',
  'from-teal-500/20 to-teal-600/10',
  'from-cyan-500/20 to-cyan-600/10',
];

const Abono: React.FC = () => {
  const navigate = useNavigate();
  const [dadosAbono, setDadosAbono] = useState<MesAbono[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState<string>('todos');
  const [selectedPosto, setSelectedPosto] = useState<string>('todos');
  const [expandedMeses, setExpandedMeses] = useState<number[]>([]);
  const [selectedYear] = useState(2026);
  
  // Estado para edição/remanejamento
  const [editMode, setEditMode] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedMilitar, setSelectedMilitar] = useState<Militar | null>(null);
  const [fromMonth, setFromMonth] = useState<number | null>(null);
  const [toMonth, setToMonth] = useState<string>('');

  const handleOpenMinuta = (mesNum: number) => {
    navigate(`/secao-pessoas/abono/minuta?mes=${mesNum}&ano=${selectedYear}`);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_abono')
        .select(`
          id,
          mes,
          ano,
          efetivo:dim_efetivo(id, matricula, nome, nome_guerra, posto_graduacao)
        `)
        .eq('ano', selectedYear)
        .order('mes');
      
      if (error) throw error;

      // Group by month
      const grouped: Record<number, Militar[]> = {};
      for (let i = 1; i <= 12; i++) {
        grouped[i] = [];
      }

      data?.forEach((item: any) => {
        if (item.efetivo) {
          grouped[item.mes].push({
            id: item.efetivo.id,
            matricula: item.efetivo.matricula,
            posto: item.efetivo.posto_graduacao,
            nome: item.efetivo.nome,
            nome_guerra: item.efetivo.nome_guerra,
          });
        }
      });

      const mesesData: MesAbono[] = mesesNome.map((nome, idx) => ({
        mes: nome,
        numero: idx + 1,
        militares: grouped[idx + 1] || [],
      }));

      setDadosAbono(mesesData);
    } catch (error) {
      console.error('Erro ao carregar dados de abono:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('abono-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_abono' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const postos = useMemo(() => {
    const all = dadosAbono.flatMap(m => m.militares.map(mil => mil.posto));
    return ['todos', ...Array.from(new Set(all))];
  }, [dadosAbono]);

  const filteredData = useMemo(() => {
    return dadosAbono
      .filter(m => selectedMes === 'todos' || m.numero.toString() === selectedMes)
      .map(m => ({
        ...m,
        militares: m.militares.filter(mil => {
          const matchSearch = searchTerm === '' || 
            mil.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mil.matricula.includes(searchTerm);
          const matchPosto = selectedPosto === 'todos' || mil.posto === selectedPosto;
          return matchSearch && matchPosto;
        }),
      }));
  }, [dadosAbono, searchTerm, selectedMes, selectedPosto]);

  const totalMilitares = useMemo(() => {
    const unique = new Set(dadosAbono.flatMap(m => m.militares.map(mil => mil.matricula)));
    return unique.size;
  }, [dadosAbono]);

  const totalDiasAbono = useMemo(() => {
    return dadosAbono.reduce((acc, m) => acc + m.militares.length * 5, 0);
  }, [dadosAbono]);

  const toggleMes = (numero: number) => {
    setExpandedMeses(prev => 
      prev.includes(numero) 
        ? prev.filter(n => n !== numero)
        : [...prev, numero]
    );
  };

  const expandAll = () => {
    setExpandedMeses(dadosAbono.map(m => m.numero));
  };

  const collapseAll = () => {
    setExpandedMeses([]);
  };

  const handleTransferClick = (militar: Militar, mesNumero: number) => {
    setSelectedMilitar(militar);
    setFromMonth(mesNumero);
    setTransferDialogOpen(true);
  };

  const handleRemoveMilitar = async (militar: Militar, mesNumero: number) => {
    try {
      const { error } = await supabase
        .from('fat_abono')
        .delete()
        .eq('efetivo_id', militar.id)
        .eq('mes', mesNumero)
        .eq('ano', selectedYear);

      if (error) throw error;
      
      toast.success(`${militar.nome_guerra || militar.nome} removido do mês ${mesesNome[mesNumero - 1]}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error('Erro ao remover militar');
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedMilitar || !fromMonth || !toMonth) return;
    
    const toMonthNum = parseInt(toMonth);
    
    try {
      // Remove from old month
      await supabase
        .from('fat_abono')
        .delete()
        .eq('efetivo_id', selectedMilitar.id)
        .eq('mes', fromMonth)
        .eq('ano', selectedYear);

      // Add to new month
      const { error } = await supabase
        .from('fat_abono')
        .insert({
          efetivo_id: selectedMilitar.id,
          mes: toMonthNum,
          ano: selectedYear,
        });

      if (error) throw error;
      
      toast.success(`${selectedMilitar.nome_guerra || selectedMilitar.nome} transferido para ${mesesNome[toMonthNum - 1]}`);
      setTransferDialogOpen(false);
      setSelectedMilitar(null);
      setFromMonth(null);
      setToMonth('');
      fetchData();
    } catch (error) {
      console.error('Erro ao transferir:', error);
      toast.error('Erro ao transferir militar');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
    <div className="container mx-auto p-4 md:p-6 max-w-7xl pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/secao-pessoas">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendário de Abono</h1>
              <p className="text-sm text-muted-foreground">{selectedYear} - Gestão de dias de abono</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <NovoAbonoDialog selectedYear={selectedYear} onSuccess={fetchData} />
          <Button
            variant={editMode ? 'default' : 'outline'}
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {editMode ? 'Finalizar Edição' : 'Editar Calendário'}
          </Button>
        </div>
      </div>

      {/* Edit mode alert */}
      {editMode && (
        <Card className="mb-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Edit2 className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Modo de Edição Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Clique nos botões de transferir ou remover para remaNejar militares entre os meses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regras */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Regras do Abono</p>
              <p>• Cada militar tem direito a 5 dias de abono por ano</p>
              <p>• O período deve ser comunicado com 30 dias de antecedência</p>
              <p>• A distribuição segue o interesse do serviço</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <CalendarDays className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{selectedYear}</p>
            <p className="text-xs text-muted-foreground">Ano</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalMilitares}</p>
            <p className="text-xs text-muted-foreground">Militares</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Filter className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{filteredData.filter(m => m.militares.length > 0).length}</p>
            <p className="text-xs text-muted-foreground">Meses Filtrados</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalDiasAbono}</p>
            <p className="text-xs text-muted-foreground">Dias de Abono</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedMes} onValueChange={setSelectedMes}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os meses</SelectItem>
                {mesesNome.map((mes, idx) => (
                  <SelectItem key={idx} value={(idx + 1).toString()}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPosto} onValueChange={setSelectedPosto}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Posto" />
              </SelectTrigger>
              <SelectContent>
                {postos.map(posto => (
                  <SelectItem key={posto} value={posto}>
                    {posto === 'todos' ? 'Todos os postos' : posto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expandir
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Recolher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {filteredData.map((mesData, idx) => (
          <Collapsible
            key={mesData.numero}
            open={expandedMeses.includes(mesData.numero)}
            onOpenChange={() => toggleMes(mesData.numero)}
          >
            <Card className={`overflow-hidden border-l-4 ${mesData.militares.length === 0 ? 'border-l-muted' : 'border-l-primary'}`}>
              <CollapsibleTrigger className="w-full">
                <CardHeader className={`py-3 bg-gradient-to-r ${mesColors[idx]} cursor-pointer hover:opacity-80 transition-opacity`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Badge variant="outline" className="bg-background/50">
                        {mesData.numero.toString().padStart(2, '0')}
                      </Badge>
                      {mesData.mes}
                      <Badge variant="secondary" className="ml-2">
                        {mesData.militares.length} militar{mesData.militares.length !== 1 ? 'es' : ''}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {mesData.militares.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMinuta(mesData.numero);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden md:inline">Minuta</span>
                        </Button>
                      )}
                      <ChevronDown className={`h-5 w-5 transition-transform ${expandedMeses.includes(mesData.numero) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="p-4">
                  {mesData.militares.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum militar com abono neste mês
                    </p>
                  ) : (
                    <ScrollArea className="max-h-[400px]">
                      <div className="grid gap-2">
                        {mesData.militares.map((militar) => (
                          <div 
                            key={militar.matricula} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant="outline" 
                                className={`${postoColors[militar.posto] || 'bg-muted'} min-w-[70px] justify-center`}
                              >
                                {militar.posto}
                              </Badge>
                              <div>
                                <p className="font-medium text-foreground">{militar.nome}</p>
                                <p className="text-xs text-muted-foreground">Mat: {militar.matricula}</p>
                              </div>
                            </div>
                            
                            {editMode && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTransferClick(militar, mesData.numero);
                                  }}
                                  className="h-8 gap-1 text-primary hover:text-primary/80 hover:bg-primary/10"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                  Transferir
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMilitar(militar, mesData.numero);
                                  }}
                                  className="h-8 gap-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <X className="h-4 w-4" />
                                  Remover
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Militar</DialogTitle>
            <DialogDescription>
              Selecione o mês de destino para {selectedMilitar?.nome_guerra || selectedMilitar?.nome}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={toMonth} onValueChange={setToMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês de destino" />
              </SelectTrigger>
              <SelectContent>
                {mesesNome.map((mes, idx) => {
                  if (idx + 1 === fromMonth) return null;
                  return (
                    <SelectItem key={idx} value={(idx + 1).toString()}>
                      {mes}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmTransfer} disabled={!toMonth}>
              Confirmar Transferência
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ScrollArea>
  );
};

export default Abono;