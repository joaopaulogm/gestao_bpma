import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Palmtree, ArrowLeft, Search, Calendar, Users, ChevronLeft, ChevronRight,
  Loader2, Edit3, X, Check, Sun, Umbrella, Plane, TreePalm, CalendarDays, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateFerias } from '@/lib/adminPessoasApi';

interface FeriasData {
  id: string;
  efetivo_id: string;
  ano: number;
  mes_inicio: number;
  mes_fim: number | null;
  dias: number;
  tipo: string;
  observacao: string | null;
  parcelas_detalhadas?: Array<{
    fat_ferias_id: string;
    parcela_num: number;
    mes: number | null;
    dias: number | null;
    data_inicio: string | null;
    data_fim: string | null;
    lancado_livro: boolean;
    lancado_sgpol: boolean;
    lancado_campanha: boolean;
  }>;
  staging_data?: any[];
  efetivo?: {
    id: string;
    matricula: string;
    posto_graduacao: string;
    nome_guerra: string;
    nome: string;
    quadro: string;
  };
}

interface ParcelaInfo {
  mes: number;
  dias: number;
}

interface ParcelaParsed {
  feriasId: string;
  ferias: FeriasData;
  parcelas: ParcelaInfo[];
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MESES_ABREV: Record<string, number> = {
  'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
  'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
};

const MESES_NUM_TO_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const mesConfig: Record<number, { bg: string; icon: React.ReactNode; color: string }> = {
  1: { bg: 'from-primary/80 to-primary', icon: <CalendarDays className="h-5 w-5" />, color: 'primary' },
  2: { bg: 'from-violet-500 to-violet-600', icon: <CalendarDays className="h-5 w-5" />, color: 'violet' },
  3: { bg: 'from-emerald-500 to-emerald-600', icon: <CalendarDays className="h-5 w-5" />, color: 'emerald' },
  4: { bg: 'from-rose-500 to-rose-600', icon: <CalendarDays className="h-5 w-5" />, color: 'rose' },
  5: { bg: 'from-amber-500 to-amber-600', icon: <CalendarDays className="h-5 w-5" />, color: 'amber' },
  6: { bg: 'from-cyan-500 to-cyan-600', icon: <CalendarDays className="h-5 w-5" />, color: 'cyan' },
  7: { bg: 'from-orange-500 to-orange-600', icon: <Sun className="h-5 w-5" />, color: 'orange' },
  8: { bg: 'from-indigo-500 to-indigo-600', icon: <Palmtree className="h-5 w-5" />, color: 'indigo' },
  9: { bg: 'from-teal-500 to-teal-600', icon: <CalendarDays className="h-5 w-5" />, color: 'teal' },
  10: { bg: 'from-pink-500 to-pink-600', icon: <CalendarDays className="h-5 w-5" />, color: 'pink' },
  11: { bg: 'from-purple-500 to-purple-600', icon: <CalendarDays className="h-5 w-5" />, color: 'purple' },
  12: { bg: 'from-green-500 to-green-600', icon: <Plane className="h-5 w-5" />, color: 'green' },
};

const postoOrdem: Record<string, number> = {
  'TC': 1, 'MAJ': 2, 'CAP': 3, '1º TEN': 4, '2º TEN': 5, 'ASP OF': 6,
  'ST': 7, '1º SGT': 8, '2º SGT': 9, '3º SGT': 10, 'CB': 11, 'SD': 12
};

// Parse observacao field to extract parcelas
function parseParcelasFromObservacao(observacao: string | null, mesInicio: number, dias: number): ParcelaInfo[] {
  if (!observacao) {
    return [{ mes: mesInicio, dias: dias || 30 }];
  }

  const parcelas: ParcelaInfo[] = [];
  
  // Pattern: "1ª: MAR(9d), 2ª: DEZ(21d)" or "1ª: ABR(5d), 2ª: AGO(5d), 3ª: NOV(20d)"
  const regex = /(\d)ª:\s*([A-Z]{3})\((\d+)d\)/g;
  let match;
  
  while ((match = regex.exec(observacao)) !== null) {
    const mesAbrev = match[2];
    const diasParcela = parseInt(match[3], 10);
    const mesNum = MESES_ABREV[mesAbrev];
    
    if (mesNum && !isNaN(diasParcela)) {
      parcelas.push({ mes: mesNum, dias: diasParcela });
    }
  }

  // If no parcelas found, use mesInicio as default
  if (parcelas.length === 0) {
    return [{ mes: mesInicio, dias: dias || 30 }];
  }

  return parcelas;
}

const Ferias: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [ferias, setFerias] = useState<FeriasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(2025);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPolicial, setEditingPolicial] = useState<FeriasData | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaInfo[]>([{ mes: 1, dias: 30 }]);
  const [saving, setSaving] = useState(false);

  const handleOpenMinuta = () => {
    if (mesSelecionado) {
      navigate(`/secao-pessoas/ferias/minuta?mes=${mesSelecionado}&ano=${ano}`);
    }
  };

  const fetchFerias = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar dados de fat_ferias com join em dim_efetivo
      const { data: feriasData, error: feriasError } = await supabase
        .from('fat_ferias')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra, nome, quadro)
        `)
        .eq('ano', ano)
        .order('mes_inicio');

      if (feriasError) throw feriasError;

      // Buscar parcelas de fat_ferias_parcelas
      const feriasIds = (feriasData || []).map(f => f.id);
      let parcelasData: any[] = [];
      
      if (feriasIds.length > 0) {
        const { data: parcelas, error: parcelasError } = await supabase
          .from('fat_ferias_parcelas')
          .select('*')
          .in('fat_ferias_id', feriasIds)
          .order('fat_ferias_id, parcela_num');

        if (parcelasError) {
          console.warn('Erro ao carregar parcelas:', parcelasError);
        } else {
          parcelasData = parcelas || [];
        }
      }

      // Tentar buscar dados de staging se disponível (pode falhar se não tiver permissão)
      let stagingData: any[] = [];
      try {
        const { data: stgData, error: stgError } = await supabase
          .from('stg_ferias_2026_pracas')
          .select('*')
          .eq('ano_gozo', ano);
        
        if (!stgError && stgData) {
          stagingData = stgData;
        }
      } catch (stgErr) {
        // Ignorar erro de staging - pode não ter permissão (restrito a admin)
        console.warn('Não foi possível carregar dados de staging stg_ferias_2026_pracas (pode ser restrito a admin):', stgErr);
      }

      // Enriquecer dados de férias com parcelas
      const feriasEnriquecidas = (feriasData || []).map(feria => {
        const parcelasFeria = parcelasData.filter(p => p.fat_ferias_id === feria.id);
        return {
          ...feria,
          parcelas_detalhadas: parcelasFeria,
          staging_data: stagingData.filter(s => s.matricula === feria.efetivo?.matricula)
        };
      });

      setFerias(feriasEnriquecidas);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias_parcelas' }, () => fetchFerias())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFerias]);

  // Parse all ferias to extract parcelas - usar parcelas_detalhadas se disponível, senão parse do observacao
  const feriasWithParcelas = useMemo(() => {
    return ferias.map(f => {
      // Se tem parcelas_detalhadas da tabela fat_ferias_parcelas, usar elas
      if (f.parcelas_detalhadas && Array.isArray(f.parcelas_detalhadas) && f.parcelas_detalhadas.length > 0) {
        return {
          feriasId: f.id,
          ferias: f,
          parcelas: f.parcelas_detalhadas.map((p: any) => ({
            mes: p.mes || f.mes_inicio,
            dias: p.dias || f.dias
          }))
        };
      }
      // Senão, usar parse do observacao (fallback)
      return {
        feriasId: f.id,
        ferias: f,
        parcelas: parseParcelasFromObservacao(f.observacao, f.mes_inicio, f.dias)
      };
    });
  }, [ferias]);

  // Summary by month - counts each parcel separately
  const summaryByMonth = useMemo(() => {
    const summary: Record<number, { ferias: FeriasData; parcela: ParcelaInfo; parcelaIndex: number; totalParcelas: number }[]> = {};
    for (let i = 1; i <= 12; i++) { summary[i] = []; }
    
    feriasWithParcelas.forEach(item => {
      item.parcelas.forEach((parcela, idx) => {
        summary[parcela.mes].push({
          ferias: item.ferias,
          parcela,
          parcelaIndex: idx,
          totalParcelas: item.parcelas.length
        });
      });
    });
    
    // Sort each month by posto
    Object.keys(summary).forEach(mes => {
      summary[parseInt(mes)].sort((a, b) => {
        const postoA = postoOrdem[a.ferias.efetivo?.posto_graduacao || ''] || 99;
        const postoB = postoOrdem[b.ferias.efetivo?.posto_graduacao || ''] || 99;
        if (postoA !== postoB) return postoA - postoB;
        return (a.ferias.efetivo?.nome_guerra || '').localeCompare(b.ferias.efetivo?.nome_guerra || '');
      });
    });
    
    return summary;
  }, [feriasWithParcelas]);

  const filteredPoliciais = useMemo(() => {
    if (mesSelecionado === null) return [];
    let result = summaryByMonth[mesSelecionado] || [];
    
    if (search) {
      result = result.filter(item => 
        item.ferias.efetivo?.nome_guerra?.toLowerCase().includes(search.toLowerCase()) ||
        item.ferias.efetivo?.nome?.toLowerCase().includes(search.toLowerCase()) ||
        item.ferias.efetivo?.matricula?.includes(search)
      );
    }
    
    return result;
  }, [mesSelecionado, summaryByMonth, search]);

  const totalPoliciais = ferias.length;
  
  // Count policiais with parcelas in summer (Jul/Ago)
  const veraoPoliciais = useMemo(() => {
    const ids = new Set<string>();
    [7, 8].forEach(mes => {
      summaryByMonth[mes]?.forEach(item => ids.add(item.ferias.id));
    });
    return ids.size;
  }, [summaryByMonth]);

  const handleEditPolicial = (feriaData: FeriasData) => {
    setEditingPolicial(feriaData);
    const parsedParcelas = parseParcelasFromObservacao(feriaData.observacao, feriaData.mes_inicio, feriaData.dias);
    setParcelas(parsedParcelas);
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
      // Sort parcelas by month
      const sortedParcelas = [...parcelas].sort((a, b) => a.mes - b.mes);
      
      // Build observacao string
      const observacaoStr = sortedParcelas.length > 1 
        ? sortedParcelas.map((p, i) => `${i + 1}ª: ${MESES_NUM_TO_ABREV[p.mes - 1]}(${p.dias}d)`).join(', ')
        : null;
      
      const result = await updateFerias({
        id: editingPolicial.id,
        mes_inicio: sortedParcelas[0].mes,
        dias: sortedParcelas[0].dias,
        tipo: sortedParcelas.length > 1 ? 'PARCELADA' : 'INTEGRAL',
        observacao: observacaoStr || undefined,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao salvar alterações');
      }
      
      toast.success('Férias atualizadas com sucesso');
      setEditDialogOpen(false);
      fetchFerias();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const totalDiasParcelas = parcelas.reduce((sum, p) => sum + p.dias, 0);

  // Get full parcel info for display
  const getParcelasForFerias = (feriaData: FeriasData): ParcelaInfo[] => {
    return parseParcelasFromObservacao(feriaData.observacao, feriaData.mes_inicio, feriaData.dias);
  };

  // Formatar parcelas para exibição
  const formatParcelasDisplay = (allParcelas: ParcelaInfo[], mesSelecionado: number | null) => {
    if (allParcelas.length === 1) {
      return <Badge variant="secondary" className="text-[10px] md:text-xs">Integral ({allParcelas[0].dias}d)</Badge>;
    }
    return (
      <div className="flex items-center gap-0.5 flex-wrap">
        {allParcelas.map((p, pIdx) => (
          <Badge 
            key={pIdx} 
            variant={p.mes === mesSelecionado ? 'default' : 'secondary'}
            className={`text-[9px] md:text-xs px-1 py-0 ${p.mes === mesSelecionado ? 'ring-1 ring-primary ring-offset-1' : 'opacity-70'}`}
          >
            {pIdx + 1}ª{MESES_NUM_TO_ABREV[p.mes - 1]}({p.dias}d)
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-4 md:py-6 pb-20">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/secao-pessoas">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Palmtree className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">Calendário de Férias</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Programação anual do efetivo BPMA</p>
                </div>
              </div>
            </div>
            
            {/* Year Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setAno(ano - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 font-bold">
                {ano}
              </Badge>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setAno(ano + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Grid 2x2 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-white dark:from-primary/20 dark:to-background border-primary/20 dark:border-primary/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{totalPoliciais}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Policiais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-100 dark:border-amber-900/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10">
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600">{veraoPoliciais}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Férias Verão</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-emerald-100 dark:border-emerald-900/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">30</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Dias / Policial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-100 dark:border-purple-900/30">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-500/10">
                  <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {ferias.filter(f => f.tipo === 'PARCELADA').length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Parceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid - Mobile Optimized */}
        <Card className="mb-4 sm:mb-6 shadow-sm">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Selecione o Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
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
                        relative overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300
                        ${isSelected 
                          ? `bg-gradient-to-br ${config.bg} text-white shadow-lg scale-105` 
                          : 'bg-white dark:bg-card hover:bg-muted/50 border border-border hover:border-primary/30 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <span className={`hidden sm:block ${isSelected ? 'text-white' : 'text-primary'}`}>{config.icon}</span>
                        <span className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>
                          {mes.slice(0, 3)}
                          <span className="hidden sm:inline">{mes.slice(3)}</span>
                        </span>
                        <div className={`
                          flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold
                          ${isSelected 
                            ? 'bg-white/25 text-white' 
                            : 'bg-primary/10 text-primary'
                          }
                        `}>
                          <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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

        {/* Selected Month Details - Mobile Optimized */}
        {mesSelecionado && (
          <Card className="shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br ${mesConfig[mesSelecionado].bg}`}>
                    <span className="text-base sm:text-xl text-white">{mesConfig[mesSelecionado].icon}</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-xl">{MESES[mesSelecionado - 1]} {ano}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {filteredPoliciais.length} parcelas de férias
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="sm:hidden h-8 w-8"
                    onClick={() => setMesSelecionado(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleOpenMinuta}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Ver Minuta</span>
                  </Button>
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar policial..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full sm:w-[200px] h-9"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hidden sm:flex"
                    onClick={() => setMesSelecionado(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 px-2 sm:px-4">
              {filteredPoliciais.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Umbrella className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm sm:text-base text-muted-foreground">Nenhum policial programado para este mês</p>
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center whitespace-nowrap">#</TableHead>
                      <TableHead className="whitespace-nowrap">Posto</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="whitespace-nowrap">Matrícula</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Dias</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPoliciais.map((item, index) => {
                      const allParcelas = getParcelasForFerias(item.ferias);
                      
                      return (
                        <TableRow key={`${item.ferias.id}-${item.parcelaIndex}`}>
                          <TableCell className="text-center py-1.5">
                            <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] md:text-xs mx-auto">
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5">
                            <Badge variant="outline" className="text-[10px] md:text-xs font-mono px-1 py-0">
                              {item.ferias.efetivo?.posto_graduacao}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-xs md:text-sm truncate py-1.5">
                            {item.ferias.efetivo?.nome_guerra || item.ferias.efetivo?.nome}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[10px] md:text-xs font-mono py-1.5">
                            {item.ferias.efetivo?.matricula}
                          </TableCell>
                          <TableCell className="py-1.5">
                            {formatParcelasDisplay(allParcelas, mesSelecionado)}
                          </TableCell>
                          <TableCell className="text-center py-1.5">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] md:text-xs px-1.5">
                              {item.parcela.dias}d
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center py-1.5">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleEditPolicial(item.ferias)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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

      {/* Edit Dialog - Mobile Optimized */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
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
                              {Array.from({ length: 26 }, (_, i) => i + 5).map(dias => (
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
