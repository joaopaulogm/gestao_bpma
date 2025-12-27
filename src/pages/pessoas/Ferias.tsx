import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Palmtree, ArrowLeft, Search, Calendar, Users, ChevronLeft, ChevronRight,
  Loader2, Edit3, X, Check, Sun, Umbrella, Plane, TreePalm, CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeriasData {
  id: string;
  efetivo_id: string;
  ano: number;
  mes_inicio: number;
  mes_fim: number | null;
  dias: number;
  tipo: string;
  observacao: string | null;
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
    nome: string;
    quadro: string;
  };
}

interface Parcela {
  mes: number;
  dias: number;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const mesConfig: Record<number, { bg: string; icon: string; color: string }> = {
  1: { bg: 'from-blue-500 to-blue-600', icon: '❄️', color: 'blue' },
  2: { bg: 'from-purple-500 to-purple-600', icon: '💜', color: 'purple' },
  3: { bg: 'from-green-500 to-green-600', icon: '🌿', color: 'green' },
  4: { bg: 'from-pink-500 to-pink-600', icon: '🌸', color: 'pink' },
  5: { bg: 'from-amber-500 to-amber-600', icon: '🌻', color: 'amber' },
  6: { bg: 'from-cyan-500 to-cyan-600', icon: '🌊', color: 'cyan' },
  7: { bg: 'from-orange-500 to-orange-600', icon: '☀️', color: 'orange' },
  8: { bg: 'from-indigo-500 to-indigo-600', icon: '🌴', color: 'indigo' },
  9: { bg: 'from-teal-500 to-teal-600', icon: '🍂', color: 'teal' },
  10: { bg: 'from-rose-500 to-rose-600', icon: '🎃', color: 'rose' },
  11: { bg: 'from-violet-500 to-violet-600', icon: '🦃', color: 'violet' },
  12: { bg: 'from-emerald-500 to-emerald-600', icon: '🎄', color: 'emerald' },
};

const postoOrdem: Record<string, number> = {
  'TC': 1, 'MAJ': 2, 'CAP': 3, '1º TEN': 4, '2º TEN': 5, 'ASP OF': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12
};

const Ferias: React.FC = () => {
  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [ferias, setFerias] = useState<FeriasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(2026);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPolicial, setEditingPolicial] = useState<FeriasData | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([{ mes: 1, dias: 30 }]);
  const [saving, setSaving] = useState(false);

  const fetchFerias = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fat_ferias')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra, nome, quadro)
        `)
        .eq('ano', ano)
        .order('mes_inicio');

      if (error) throw error;
      setFerias(data || []);
    } catch (error) {
      console.error('Erro ao carregar férias:', error);
      toast.error('Erro ao carregar férias');
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    fetchFerias();
  }, [fetchFerias]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('ferias-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias' }, () => fetchFerias())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFerias]);

  // Summary by month
  const summaryByMonth = useMemo(() => {
    const summary: Record<number, FeriasData[]> = {};
    for (let i = 1; i <= 12; i++) { summary[i] = []; }
    
    ferias.forEach(item => {
      if (item.mes_inicio) summary[item.mes_inicio].push(item);
    });
    
    // Sort each month by posto
    Object.keys(summary).forEach(mes => {
      summary[parseInt(mes)].sort((a, b) => {
        const postoA = postoOrdem[a.efetivo?.posto_graduacao || ''] || 99;
        const postoB = postoOrdem[b.efetivo?.posto_graduacao || ''] || 99;
        return postoA - postoB;
      });
    });
    
    return summary;
  }, [ferias]);

  const filteredPoliciais = useMemo(() => {
    if (mesSelecionado === null) return [];
    let result = summaryByMonth[mesSelecionado] || [];
    
    if (search) {
      result = result.filter(item => 
        item.efetivo?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
        item.efetivo?.nome?.toLowerCase().includes(search.toLowerCase()) ||
        item.efetivo?.matricula?.includes(search)
      );
    }
    
    return result;
  }, [mesSelecionado, summaryByMonth, search]);

  const totalPoliciais = ferias.length;

  const handleEditPolicial = (policial: FeriasData) => {
    setEditingPolicial(policial);
    setParcelas([{ mes: policial.mes_inicio, dias: policial.dias || 30 }]);
    setEditDialogOpen(true);
  };

  const addParcela = () => {
    if (parcelas.length >= 3) {
      toast.error('Máximo de 3 parcelas permitidas');
      return;
    }
    const diasUsados = parcelas.reduce((sum, p) => sum + p.dias, 0);
    const diasRestantes = 30 - diasUsados;
    if (diasRestantes < 5) {
      toast.error('Não há dias suficientes para nova parcela (mínimo 5 dias)');
      return;
    }
    setParcelas([...parcelas, { mes: 1, dias: Math.max(5, diasRestantes) }]);
  };

  const removeParcela = (index: number) => {
    if (parcelas.length === 1) {
      toast.error('É necessário ao menos 1 parcela');
      return;
    }
    setParcelas(parcelas.filter((_, i) => i !== index));
  };

  const updateParcela = (index: number, field: 'mes' | 'dias', value: number) => {
    const newParcelas = [...parcelas];
    newParcelas[index] = { ...newParcelas[index], [field]: value };
    setParcelas(newParcelas);
  };

  const validateParcelas = (): boolean => {
    const totalDias = parcelas.reduce((sum, p) => sum + p.dias, 0);
    if (totalDias !== 30) {
      toast.error('O total de dias deve ser 30');
      return false;
    }
    for (const p of parcelas) {
      if (p.dias < 5) {
        toast.error('Cada parcela deve ter no mínimo 5 dias');
        return false;
      }
    }
    return true;
  };

  const handleSaveEdit = async () => {
    if (!editingPolicial || !validateParcelas()) return;
    
    setSaving(true);
    try {
      // Update the primary vacation record
      const { error } = await supabase
        .from('fat_ferias')
        .update({
          mes_inicio: parcelas[0].mes,
          dias: parcelas[0].dias,
          tipo: parcelas.length > 1 ? 'PARCELADA' : 'INTEGRAL',
          observacao: parcelas.length > 1 
            ? `Parcelada: ${parcelas.map((p, i) => `${i+1}ª parcela: ${MESES[p.mes-1]} (${p.dias} dias)`).join(', ')}`
            : null
        })
        .eq('id', editingPolicial.id);

      if (error) throw error;
      
      toast.success('Férias atualizadas com sucesso');
      setEditDialogOpen(false);
      fetchFerias();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const totalDiasParcelas = parcelas.reduce((sum, p) => sum + p.dias, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/secao-pessoas">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                <Palmtree className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendário de Férias</h1>
                <p className="text-sm text-muted-foreground">Programação anual do efetivo BPMA</p>
              </div>
            </div>
          </div>
          
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalPoliciais}</p>
                  <p className="text-xs text-muted-foreground">Total Policiais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10">
                  <Sun className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {summaryByMonth[7]?.length + summaryByMonth[8]?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Férias Verão</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <CalendarDays className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">30</p>
                  <p className="text-xs text-muted-foreground">Dias / Policial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Plane className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(totalPoliciais / 12)}
                  </p>
                  <p className="text-xs text-muted-foreground">Média / Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Selecione o Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {MESES.map((mes, idx) => {
                  const mesNum = idx + 1;
                  const config = mesConfig[mesNum];
                  const count = summaryByMonth[mesNum]?.length || 0;
                  const isSelected = mesSelecionado === mesNum;
                  
                  return (
                    <button
                      key={mes}
                      onClick={() => setMesSelecionado(isSelected ? null : mesNum)}
                      className={`
                        relative overflow-hidden rounded-2xl p-4 transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-br ${config.bg} text-white shadow-lg scale-105` 
                          : 'bg-white hover:bg-muted/50 border border-border hover:border-primary/30 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{config.icon}</span>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
                          {mes}
                        </span>
                        <div className={`
                          flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
                          ${isSelected 
                            ? 'bg-white/25 text-white' 
                            : 'bg-primary/10 text-primary'
                          }
                        `}>
                          <Users className="h-3 w-3" />
                          {count}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Month Details */}
        {mesSelecionado && (
          <Card className="shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${mesConfig[mesSelecionado].bg}`}>
                    <span className="text-xl">{mesConfig[mesSelecionado].icon}</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl">{MESES[mesSelecionado - 1]} {ano}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filteredPoliciais.length} policiais programados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar policial..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setMesSelecionado(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {filteredPoliciais.length === 0 ? (
                <div className="text-center py-12">
                  <Umbrella className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Nenhum policial programado para este mês</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-2">
                    {filteredPoliciais.map((item, index) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {index + 1}
                          </div>
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xs font-bold">
                              {item.efetivo?.nome_guerra?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                {item.efetivo?.posto_graduacao}
                              </Badge>
                              <span className="font-semibold text-foreground">
                                {item.efetivo?.nome_guerra || item.efetivo?.nome}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground font-mono">
                                Mat: {item.efetivo?.matricula}
                              </span>
                              {item.tipo === 'PARCELADA' && (
                                <Badge variant="secondary" className="text-xs">
                                  Parcelada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            {item.dias} dias
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditPolicial(item)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!mesSelecionado && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <TreePalm className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Selecione um Mês
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Clique em um dos meses acima para visualizar os policiais programados para férias 
                  e gerenciar reprogramações.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Reprogramar Férias
            </DialogTitle>
          </DialogHeader>
          
          {editingPolicial && (
            <div className="space-y-6">
              {/* Policial Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white font-bold">
                    {editingPolicial.efetivo?.nome_guerra?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{editingPolicial.efetivo?.nome_guerra}</p>
                  <p className="text-sm text-muted-foreground">
                    {editingPolicial.efetivo?.posto_graduacao} • Mat: {editingPolicial.efetivo?.matricula}
                  </p>
                </div>
              </div>

              {/* Parcelas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Parcelas de Férias</Label>
                  <Badge variant={totalDiasParcelas === 30 ? 'default' : 'destructive'}>
                    {totalDiasParcelas}/30 dias
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {parcelas.map((parcela, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl border bg-background">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}ª
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Mês</Label>
                          <Select 
                            value={String(parcela.mes)} 
                            onValueChange={(v) => updateParcela(index, 'mes', parseInt(v))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MESES.map((mes, idx) => (
                                <SelectItem key={mes} value={String(idx + 1)}>
                                  {mes}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Dias</Label>
                          <Select 
                            value={String(parcela.dias)} 
                            onValueChange={(v) => updateParcela(index, 'dias', parseInt(v))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 15, 20, 25, 30].map(dias => (
                                <SelectItem key={dias} value={String(dias)}>
                                  {dias} dias
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {parcelas.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeParcela(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {parcelas.length < 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={addParcela}
                  >
                    + Adicionar Parcela
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Máximo 3 parcelas • Mínimo 5 dias por parcela • Total: 30 dias
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || totalDiasParcelas !== 30}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ferias;
