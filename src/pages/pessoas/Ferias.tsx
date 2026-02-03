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
import { Switch } from '@/components/ui/switch';
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
  confirmado?: boolean;
  numero_processo_sei?: string | null;
  minuta_observacao?: string | null;
  parcelas_detalhadas?: Array<{
    fat_ferias_id: string;
    parcela_num: number;
    mes: string | number | null;
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
  /** Se preenchidas, a parcela usa datas exatas em vez de apenas mês */
  data_inicio?: string | null;
  data_fim?: string | null;
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
  // Iniciar com 2025 por padrão (ano mais comum com dados)
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPolicial, setEditingPolicial] = useState<FeriasData | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaInfo[]>([{ mes: 1, dias: 30 }]);
  const [saving, setSaving] = useState(false);
  const [savingConfirmadoId, setSavingConfirmadoId] = useState<string | null>(null);
  const [savingSeiId, setSavingSeiId] = useState<string | null>(null);
  const [editingSeiId, setEditingSeiId] = useState<string | null>(null);
  const [editingSeiValue, setEditingSeiValue] = useState('');

  const handleOpenMinuta = () => {
    if (mesSelecionado) {
      navigate(`/secao-pessoas/ferias/minuta?mes=${mesSelecionado}&ano=${ano}`);
    }
  };

  const fetchFerias = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`🔍 Buscando férias do ano ${ano}...`);
      
      // Buscar dados de fat_ferias com join em dim_efetivo
      // O join padrão do Supabase já é LEFT JOIN, então não precisa especificar
      // Remover filtro de ano temporariamente para ver todos os dados disponíveis
      const { data: feriasData, error: feriasError } = await supabase
        .from('fat_ferias')
        .select(`
          *,
          efetivo:dim_efetivo(id, matricula, posto_graduacao, nome_guerra, nome, quadro),
          parcelas:fat_ferias_parcelas(*)
        `)
        .eq('ano', ano)
        .order('mes_inicio', { ascending: true });
      
      // Se não encontrar dados no ano selecionado, buscar todos os anos para debug
      if ((feriasData?.length || 0) === 0) {
        console.warn(`⚠️ Nenhum registro encontrado para o ano ${ano}. Buscando todos os anos para debug...`);
        const { data: allData } = await supabase
          .from('fat_ferias')
          .select('ano')
          .order('ano', { ascending: false })
          .limit(100);
        
        const anosDisponiveis = [...new Set((allData || []).map((f: any) => f.ano))];
        console.log(`📊 Anos disponíveis na tabela fat_ferias:`, anosDisponiveis);
      }

      if (feriasError) {
        console.error('❌ Erro ao buscar fat_ferias:', feriasError);
        throw feriasError;
      }
      
      console.log(`✅ Encontrados ${feriasData?.length || 0} registros de férias no ano ${ano}`);
      
      if (feriasData && feriasData.length > 0) {
        console.log(`📋 Primeiros registros:`, feriasData.slice(0, 3).map(f => ({
          id: f.id,
          efetivo_id: f.efetivo_id,
          ano: f.ano,
          mes_inicio: f.mes_inicio,
          tipo: f.tipo,
          tem_efetivo: !!f.efetivo,
          efetivo_nome: f.efetivo?.nome_guerra
        })));
      }

      // Buscar parcelas de fat_ferias_parcelas
      const feriasIds = (feriasData || []).map(f => f.id);
      let parcelasData: any[] = [];
      
      if (feriasIds.length > 0) {
        console.log(`🔍 Buscando parcelas para ${feriasIds.length} registros de férias...`);
        const { data: parcelas, error: parcelasError } = await supabase
          .from('fat_ferias_parcelas')
          .select('*')
          .in('fat_ferias_id', feriasIds)
          .order('fat_ferias_id, parcela_num');

        if (parcelasError) {
          console.error('❌ Erro ao carregar parcelas:', parcelasError);
        } else {
          parcelasData = parcelas || [];
          console.log(`✅ Encontradas ${parcelasData.length} parcelas de férias`);
          if (parcelasData.length > 0) {
            console.log(`📋 Primeiras parcelas:`, parcelasData.slice(0, 5).map(p => ({
              fat_ferias_id: p.fat_ferias_id,
              parcela_num: p.parcela_num,
              mes: p.mes,
              dias: p.dias
            })));
          }
        }
      } else {
        console.warn(`⚠️ Nenhum ID de férias para buscar parcelas!`);
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

      console.log(`📊 Dados enriquecidos: ${feriasEnriquecidas.length} registros processados`);
      console.log(`📋 Primeiros 3 registros:`, feriasEnriquecidas.slice(0, 3));
      setFerias(feriasEnriquecidas);
    } catch (error) {
      console.error('❌ Erro ao carregar férias:', error);
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
    console.log(`📋 Processando ${ferias.length} registros de férias para extrair parcelas...`);
    if (ferias.length === 0) {
      console.warn(`⚠️ Nenhum registro de férias encontrado! Verifique se há dados no ano ${ano}`);
    }
    return ferias.map(f => {
      if (!f.efetivo) {
        console.warn(`⚠️ Registro de férias sem efetivo (ID: ${f.id}, efetivo_id: ${f.efetivo_id}):`, f);
      }
      // Se tem parcelas_detalhadas da tabela fat_ferias_parcelas, usar elas
      if (f.parcelas_detalhadas && Array.isArray(f.parcelas_detalhadas) && f.parcelas_detalhadas.length > 0) {
        const parcelas = f.parcelas_detalhadas.map((p: any) => {
          // Converter mes (text) para número. No banco, fat_ferias_parcelas.mes é TEXT (ex: 'JAN').
          let mesNum: number | null = null;
          if (typeof p.mes === 'string') {
            const mesStr = p.mes.trim().toUpperCase();
            // 1) abreviação (JAN/FEV/...)
            if (MESES_ABREV[mesStr]) {
              mesNum = MESES_ABREV[mesStr];
            } else {
              // 2) fallback: tentar parsear número (caso venha '1', '01', etc.)
              const parsed = parseInt(mesStr, 10);
              if (!Number.isNaN(parsed)) mesNum = parsed;
            }
          } else if (typeof p.mes === 'number') {
            mesNum = p.mes;
          }

          // Se mes for null/invalid, usar mes_inicio como fallback
          if (!mesNum || mesNum < 1 || mesNum > 12) {
            console.warn(`⚠️ Parcela sem mês válido, usando mes_inicio (${f.mes_inicio}):`, { parcela: p, feriasId: f.id });
            mesNum = f.mes_inicio;
          }
          return {
            mes: mesNum,
            dias: p.dias || f.dias || 30
          };
        });
        console.log(`✅ Processadas ${parcelas.length} parcelas para férias ID ${f.id} (efetivo: ${f.efetivo?.nome_guerra || f.efetivo_id})`);
        return {
          feriasId: f.id,
          ferias: f,
          parcelas
        };
      }
      // Senão, usar parse do observacao (fallback)
      const parcelasFallback = parseParcelasFromObservacao(f.observacao, f.mes_inicio, f.dias);
      console.log(`📝 Usando fallback (observacao) para férias ID ${f.id}: ${parcelasFallback.length} parcelas`);
      return {
        feriasId: f.id,
        ferias: f,
        parcelas: parcelasFallback
      };
    });
  }, [ferias]);

  // Summary by month - counts each parcel separately
  const summaryByMonth = useMemo(() => {
    console.log(`📅 Criando summary por mês de ${feriasWithParcelas.length} registros com parcelas...`);
    const summary: Record<number, { ferias: FeriasData; parcela: ParcelaInfo; parcelaIndex: number; totalParcelas: number }[]> = {};
    for (let i = 1; i <= 12; i++) { summary[i] = []; }
    
    let totalParcelasProcessadas = 0;
    feriasWithParcelas.forEach(item => {
      item.parcelas.forEach((parcela, idx) => {
        // Garantir que mes seja um número válido entre 1 e 12
        const mesNum = typeof parcela.mes === 'string' ? parseInt(parcela.mes) : parcela.mes;
        if (mesNum && mesNum >= 1 && mesNum <= 12) {
          summary[mesNum].push({
            ferias: item.ferias,
            parcela,
            parcelaIndex: idx,
            totalParcelas: item.parcelas.length
          });
          totalParcelasProcessadas++;
        } else {
          console.warn(`⚠️ Parcela com mês inválido:`, { mes: parcela.mes, tipo: typeof parcela.mes, feriasId: item.ferias.id, efetivo: item.ferias.efetivo?.nome_guerra });
        }
      });
    });
    
    console.log(`✅ Summary criado: ${totalParcelasProcessadas} parcelas distribuídas pelos meses`);
    Object.keys(summary).forEach(mes => {
      const count = summary[parseInt(mes)].length;
      if (count > 0) {
        console.log(`  📆 ${MESES[parseInt(mes) - 1]}: ${count} parcelas`);
      }
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
    const anoFerias = feriaData.ano ?? ano;
    // Carregar parcelas de parcelas_detalhadas (com data_inicio/data_fim) ou do observação; garantir 3 parcelas
    let base: ParcelaInfo[] = [];
    if (feriaData.parcelas_detalhadas && Array.isArray(feriaData.parcelas_detalhadas) && feriaData.parcelas_detalhadas.length > 0) {
      base = feriaData.parcelas_detalhadas
        .sort((a: any, b: any) => (a.parcela_num ?? 0) - (b.parcela_num ?? 0))
        .map((p: any) => {
          let mesNum = typeof p.mes === 'number' ? p.mes : (typeof p.mes === 'string' && MESES_ABREV[String(p.mes).trim().toUpperCase().slice(0, 3)])
            ? MESES_ABREV[String(p.mes).trim().toUpperCase().slice(0, 3)]
            : feriaData.mes_inicio;
          if (!mesNum || mesNum < 1 || mesNum > 12) mesNum = feriaData.mes_inicio || 1;
          const dias = typeof p.dias === 'number' && !isNaN(p.dias) ? p.dias : 10;
          return {
            mes: mesNum,
            dias,
            data_inicio: p.data_inicio ?? null,
            data_fim: p.data_fim ?? null,
          } as ParcelaInfo;
        });
    }
    if (base.length === 0) {
      base = parseParcelasFromObservacao(feriaData.observacao, feriaData.mes_inicio, feriaData.dias);
    }
    // Garantir exatamente 3 parcelas para edição (preencher com padrão, total 30 dias)
    while (base.length < 3) {
      const totalAgora = base.reduce((s, p) => s + p.dias, 0);
      const restante = 30 - totalAgora;
      base.push({ mes: 1, dias: Math.max(5, Math.min(restante, 25)) });
    }
    let totalDias = base.reduce((s, p) => s + p.dias, 0);
    if (totalDias !== 30 && base.length > 0) {
      if (totalDias > 30) {
        // Reduzir da primeira parcela(s) até total = 30
        let excess = totalDias - 30;
        for (let i = 0; i < base.length && excess > 0; i++) {
          const d = base[i].dias;
          const reducao = Math.min(excess, Math.max(0, d - 5));
          base[i] = { ...base[i], dias: d - reducao };
          excess -= reducao;
        }
      } else {
        base[base.length - 1] = { ...base[base.length - 1], dias: Math.max(5, base[base.length - 1].dias + (30 - totalDias)) };
      }
    }
    setParcelas(base.slice(0, 3));
    setEditDialogOpen(true);
  };

  const handleSaveSei = useCallback(async (feriasId: string, value: string | null) => {
    setSavingSeiId(feriasId);
    try {
      const { error } = await supabase
        .from('fat_ferias')
        .update({
          numero_processo_sei: value || null,
          minuta_observacao: value || null,
        })
        .eq('id', feriasId);
      if (error) throw error;
      setFerias(prev => prev.map(f => f.id === feriasId ? { ...f, numero_processo_sei: value ?? null, minuta_observacao: value ?? null } : f));
      toast.success(value ? 'Processo SEI atualizado' : 'Processo SEI removido');
    } catch (err: any) {
      console.error('Erro ao salvar Processo SEI:', err);
      toast.error(err?.message || 'Erro ao salvar Processo SEI');
    } finally {
      setSavingSeiId(null);
      setEditingSeiId(null);
    }
  }, []);

  const handleToggleConfirmado = useCallback(async (feriasId: string, checked: boolean) => {
    setSavingConfirmadoId(feriasId);
    try {
      const { error } = await supabase
        .from('fat_ferias')
        .update({ confirmado: checked })
        .eq('id', feriasId);
      if (error) throw error;
      setFerias(prev => prev.map(f => f.id === feriasId ? { ...f, confirmado: checked } : f));
      toast.success(checked ? 'Férias confirmadas (entram na minuta)' : 'Férias desconfirmadas');
    } catch (err: any) {
      console.error('Erro ao atualizar confirmação:', err);
      toast.error(err?.message || 'Erro ao atualizar confirmação');
    } finally {
      setSavingConfirmadoId(null);
    }
  }, []);

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

  const updateParcela = (index: number, field: 'mes' | 'dias' | 'data_inicio' | 'data_fim', value: number | string | null) => {
    const newParcelas = [...parcelas];
    const current = { ...newParcelas[index] };
    if (field === 'data_inicio' || field === 'data_fim') {
      current[field] = value === '' || value == null ? null : String(value);
      // Se limpar uma das datas, manter a outra; dias podem ser recalculados depois
      if (field === 'data_inicio' && current.data_inicio && current.data_fim) {
        const di = new Date(current.data_inicio);
        const df = new Date(current.data_fim);
        if (!isNaN(di.getTime()) && !isNaN(df.getTime()) && df >= di) {
          current.dias = Math.max(1, Math.ceil((df.getTime() - di.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        }
      }
      if (field === 'data_fim' && current.data_inicio && current.data_fim) {
        const di = new Date(current.data_inicio);
        const df = new Date(current.data_fim);
        if (!isNaN(di.getTime()) && !isNaN(df.getTime()) && df >= di) {
          current.dias = Math.max(1, Math.ceil((df.getTime() - di.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        }
      }
    } else {
      (current as Record<string, unknown>)[field] = value;
    }
    newParcelas[index] = current;
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
      // Ordenar parcelas: por data_inicio se houver, senão por mês
      const sortedParcelas = [...parcelas].sort((a, b) => {
        if (a.data_inicio && b.data_inicio) return a.data_inicio.localeCompare(b.data_inicio);
        return a.mes - b.mes;
      });
      // Para exibição (observação), usar mês da data_inicio quando houver
      const mesParaObs = (p: ParcelaInfo) => (p.data_inicio ? new Date(p.data_inicio).getMonth() + 1 : p.mes);
      const observacaoStr = sortedParcelas.length > 1 
        ? sortedParcelas.map((p, i) => `${i + 1}ª: ${MESES_NUM_TO_ABREV[mesParaObs(p) - 1]}(${p.dias}d)`).join(', ')
        : null;
      
      const result = await updateFerias({
        id: editingPolicial.id,
        mes_inicio: mesParaObs(sortedParcelas[0]),
        dias: sortedParcelas[0].dias,
        tipo: sortedParcelas.length > 1 ? 'PARCELADA' : 'INTEGRAL',
        observacao: observacaoStr || undefined,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Erro ao salvar alterações');
      }

      // Upsert parcelas em fat_ferias_parcelas (data_inicio, data_fim, mes, dias)
      const parcelasRows = sortedParcelas.map((p, i) => ({
        fat_ferias_id: editingPolicial.id,
        parcela_num: i + 1,
        mes: MESES_NUM_TO_ABREV[mesParaObs(p) - 1],
        dias: p.dias,
        data_inicio: p.data_inicio || null,
        data_fim: p.data_fim || null,
      }));
      const { error: parcelasError } = await supabase
        .from('fat_ferias_parcelas')
        .upsert(parcelasRows, { onConflict: ['fat_ferias_id', 'parcela_num'] });
      if (parcelasError) {
        console.error('Erro ao salvar parcelas:', parcelasError);
        toast.error('Férias atualizadas, mas parcelas detalhadas não foram salvas. Tente editar novamente.');
      }
      // Remover parcelas que não existem mais (ex.: tinha 3, passou a 2)
      if (sortedParcelas.length < 3) {
        await supabase
          .from('fat_ferias_parcelas')
          .delete()
          .eq('fat_ferias_id', editingPolicial.id)
          .gt('parcela_num', sortedParcelas.length);
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

  // Formatar parcelas para exibição: Integral só quando exatamente 30 dias corridos; caso contrário 1ª/2ª/3ª Parcela
  const formatParcelasDisplay = (allParcelas: ParcelaInfo[], mesSelecionado: number | null) => {
    if (allParcelas.length === 1) {
      const dias = allParcelas[0].dias;
      const isIntegral = dias === 30;
      return (
        <Badge variant="secondary" className="text-[10px] md:text-xs">
          {isIntegral ? `Integral (${dias}d)` : `1ª Parcela (${dias}d)`}
        </Badge>
      );
    }
    return (
      <div className="flex items-center gap-0.5 flex-wrap">
        {allParcelas.map((p, pIdx) => (
          <Badge 
            key={pIdx} 
            variant={p.mes === mesSelecionado ? 'default' : 'secondary'}
            className={`text-[9px] md:text-xs px-1 py-0 ${p.mes === mesSelecionado ? 'ring-1 ring-primary ring-offset-1' : 'opacity-70'}`}
          >
            {pIdx + 1}ª Parcela {MESES_NUM_TO_ABREV[p.mes - 1]}({p.dias}d)
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
                      <TableHead className="text-center whitespace-nowrap">Data Início</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Data Término</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Processo SEI</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Confirmado</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPoliciais.map((item, index) => {
                      // Usar parcelas de feriasWithParcelas (parcelas_detalhadas) para dias corretos; senão fallback
                      const feriasEntry = feriasWithParcelas.find((f) => f.feriasId === item.ferias.id);
                      const allParcelas = feriasEntry ? feriasEntry.parcelas : getParcelasForFerias(item.ferias);
                      
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
                          <TableCell className="text-center py-1.5 text-xs">
                            {(() => {
                              // Buscar data_inicio da parcela correspondente (preferir parcela_num; fallback por mês)
                              const mesAbrev = MESES_NUM_TO_ABREV[(item.parcela.mes || 1) - 1];
                              const parcelaDetalhada = item.ferias.parcelas_detalhadas?.find((p) => {
                                const pMes = String(p.mes ?? '').trim().toUpperCase();
                                return p.parcela_num === item.parcelaIndex + 1 || pMes === mesAbrev;
                              });
                              if (parcelaDetalhada?.data_inicio) {
                                const [year, month, day] = parcelaDetalhada.data_inicio.split('-').map(Number);
                                return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                              }
                              return '-';
                            })()}
                          </TableCell>
                          <TableCell className="text-center py-1.5 text-xs">
                            {(() => {
                              // Buscar data_fim da parcela correspondente (preferir parcela_num; fallback por mês)
                              const mesAbrev = MESES_NUM_TO_ABREV[(item.parcela.mes || 1) - 1];
                              const parcelaDetalhada = item.ferias.parcelas_detalhadas?.find((p) => {
                                const pMes = String(p.mes ?? '').trim().toUpperCase();
                                return p.parcela_num === item.parcelaIndex + 1 || pMes === mesAbrev;
                              });
                              if (parcelaDetalhada?.data_fim) {
                                const [year, month, day] = parcelaDetalhada.data_fim.split('-').map(Number);
                                return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                              }
                              return '-';
                            })()}
                          </TableCell>
                          <TableCell className="py-1.5">
                            {editingSeiId === item.ferias.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  className="h-7 text-xs min-w-[120px]"
                                  placeholder="Ex: 12345.67890"
                                  value={editingSeiValue}
                                  onChange={(e) => setEditingSeiValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveSei(item.ferias.id, editingSeiValue.trim() || null);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingSeiId(null);
                                      setEditingSeiValue('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => handleSaveSei(item.ferias.id, editingSeiValue.trim() || null)}
                                >
                                  <Check className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => { setEditingSeiId(null); setEditingSeiValue(''); }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="text-left w-full min-h-[28px] px-2 py-1 rounded border border-transparent hover:border-border hover:bg-muted/50 text-xs"
                                onClick={() => {
                                  setEditingSeiId(item.ferias.id);
                                  setEditingSeiValue((item.ferias.numero_processo_sei || item.ferias.minuta_observacao) ?? '');
                                }}
                              >
                                {(item.ferias.numero_processo_sei || item.ferias.minuta_observacao) || (
                                  <span className="text-muted-foreground italic">Clique para editar</span>
                                )}
                              </button>
                            )}
                            {savingSeiId === item.ferias.id && (
                              <Loader2 className="h-3 w-3 animate-spin mt-1 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-center py-1.5">
                            <div className="flex justify-center items-center">
                              <Switch
                                checked={!!item.ferias.confirmado}
                                onCheckedChange={(checked) => handleToggleConfirmado(item.ferias.id, checked)}
                                disabled={savingConfirmadoId === item.ferias.id}
                              />
                              {savingConfirmadoId === item.ferias.id && (
                                <Loader2 className="h-3 w-3 animate-spin ml-1 text-muted-foreground" />
                              )}
                            </div>
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

              {/* Parcelas - sempre 3 editáveis: data início/término ou apenas mês (e dias) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Editar as 3 parcelas</Label>
                  <Badge variant={totalDiasParcelas === 30 ? 'default' : 'destructive'}>
                    {totalDiasParcelas}/30 dias
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para cada parcela: use <strong>data início e término</strong> ou apenas <strong>mês e dias</strong>.
                </p>
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => {
                    const parcela = parcelas[index];
                    if (!parcela) return null;
                    const usarDatas = !!(parcela.data_inicio && parcela.data_fim);
                    return (
                      <div key={index} className="space-y-2 p-3 rounded-xl border bg-background">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                            {index + 1}ª
                          </div>
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <Switch
                              checked={usarDatas}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const anoF = editingPolicial?.ano ?? new Date().getFullYear();
                                  const mes = parcela.mes;
                                  const primeiroDia = `${anoF}-${String(mes).padStart(2, '0')}-01`;
                                  const ultimoDia = new Date(anoF, mes, 0);
                                  const dataFim = `${anoF}-${String(mes).padStart(2, '0')}-${String(ultimoDia.getDate()).padStart(2, '0')}`;
                                  setParcelas(prev => {
                                    const next = [...prev];
                                    const p = { ...(next[index] ?? { mes: 1, dias: 10 }), data_inicio: primeiroDia, data_fim: dataFim };
                                    const di = new Date(p.data_inicio);
                                    const df = new Date(p.data_fim);
                                    if (!isNaN(di.getTime()) && !isNaN(df.getTime()) && df >= di) {
                                      p.dias = Math.max(1, Math.ceil((df.getTime() - di.getTime()) / (1000 * 60 * 60 * 24)) + 1);
                                    }
                                    next[index] = p;
                                    return next;
                                  });
                                } else {
                                  setParcelas(prev => {
                                    const next = [...prev];
                                    next[index] = { ...(next[index] ?? { mes: 1, dias: 10 }), data_inicio: undefined, data_fim: undefined };
                                    return next;
                                  });
                                }
                              }}
                            />
                            <Label className="text-xs text-muted-foreground cursor-pointer">
                              Data início e término
                            </Label>
                          </div>
                        </div>
                        {usarDatas ? (
                          <div className="grid grid-cols-2 gap-3 pl-11">
                            <div>
                              <Label className="text-xs text-muted-foreground">Data início</Label>
                              <Input
                                type="date"
                                className="mt-1"
                                value={parcela.data_inicio ?? ''}
                                onChange={(e) => updateParcela(index, 'data_inicio', e.target.value || null)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Data término</Label>
                              <Input
                                type="date"
                                className="mt-1"
                                value={parcela.data_fim ?? ''}
                                onChange={(e) => updateParcela(index, 'data_fim', e.target.value || null)}
                              />
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground">
                              Dias: {parcela.dias}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 grid grid-cols-2 gap-3 pl-11">
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
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Mínimo 5 dias por parcela • Total: 30 dias
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
