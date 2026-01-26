import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { parseISO, getMonth, getYear, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export interface QuotaData {
  limite: number;
  previsto: number;
  marcados: number;
  saldo: number;
}

export interface CampanhaQuotas {
  ferias: QuotaData;
  abono: QuotaData;
  loading: boolean;
  refetch: () => Promise<void>;
}

const LIMITE_FERIAS_MENSAL = 480;
const LIMITE_ABONO_MENSAL = 80;

export const useCampanhaQuotas = (ano: number, mes: number): CampanhaQuotas => {
  const [ferias, setFerias] = useState<any[]>([]);
  const [feriasParcelas, setFeriasParcelas] = useState<any[]>([]);
  const [abonos, setAbonos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: feriasData },
        { data: feriasParcelasData },
        { data: abonosData },
      ] = await Promise.all([
        supabase.from('fat_ferias').select('*').eq('ano', ano),
        supabase.from('fat_ferias_parcelas').select('*, fat_ferias!inner(efetivo_id, ano)').eq('fat_ferias.ano', ano),
        supabase.from('fat_abono').select('*').eq('ano', ano),
      ]);

      setFerias(feriasData || []);
      setFeriasParcelas(feriasParcelasData || []);
      setAbonos(abonosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados de cotas:', error);
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
      .channel('campanha-quotas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_ferias_parcelas' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fat_abono' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Calcular cotas de férias
  const feriasQuota = useMemo<QuotaData>(() => {
    const mesNum = mes + 1; // mes é 0-indexed, converter para 1-indexed
    const monthAbbreviations = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mesAbbrev = monthAbbreviations[mes];

    // PREVISTO: férias onde mes_inicio = mês atual (sem data marcada ainda)
    // Contar dias de férias previstas para o mês
    let previstoTotal = 0;
    ferias.forEach(f => {
      if (f.mes_inicio === mesNum || f.mes_fim === mesNum) {
        // Verificar se tem parcelas marcadas
        const parcelasDoRegistro = feriasParcelas.filter(p => p.fat_ferias_id === f.id);
        const temDatasMarcadas = parcelasDoRegistro.some(p => p.data_inicio && p.data_fim);
        
        if (!temDatasMarcadas) {
          // Se não tem datas marcadas, é previsão
          previstoTotal += f.dias || 0;
        }
      }
    });

    // MARCADOS: dias de férias com data_inicio no mês atual
    let marcadosTotal = 0;
    const mesInicio = startOfMonth(new Date(ano, mes, 1));
    const mesFim = endOfMonth(new Date(ano, mes, 1));

    feriasParcelas.forEach(p => {
      if (p.data_inicio && p.data_fim && p.fat_ferias?.ano === ano) {
        try {
          const inicio = parseISO(p.data_inicio);
          // Se a data de início está no mês atual
          if (getMonth(inicio) === mes && getYear(inicio) === ano) {
            marcadosTotal += p.dias || 0;
          }
        } catch {
          // Ignorar datas inválidas
        }
      }
    });

    return {
      limite: LIMITE_FERIAS_MENSAL,
      previsto: previstoTotal,
      marcados: marcadosTotal,
      saldo: LIMITE_FERIAS_MENSAL - marcadosTotal,
    };
  }, [ferias, feriasParcelas, mes, ano]);

  // Calcular cotas de abono
  const abonoQuota = useMemo<QuotaData>(() => {
    const mesNum = mes + 1; // mes é 0-indexed, converter para 1-indexed

    // Filtrar abonos do mês
    const abonosDoMes = abonos.filter(a => a.mes === mesNum);

    // PREVISTO: abonos planejados para o mês (sem datas de parcela marcadas)
    let previstoTotal = 0;
    abonosDoMes.forEach(a => {
      const temDatasMarcadas = (
        (a.parcela1_inicio && a.parcela1_fim) ||
        (a.parcela2_inicio && a.parcela2_fim) ||
        (a.parcela3_inicio && a.parcela3_fim) ||
        (a.data_inicio && a.data_fim)
      );
      
      if (!temDatasMarcadas) {
        // Assumir 5 dias por abono se não tem dias especificados
        const diasTotal = (a.parcela1_dias || 0) + (a.parcela2_dias || 0) + (a.parcela3_dias || 0);
        previstoTotal += diasTotal > 0 ? diasTotal : 5;
      }
    });

    // MARCADOS: dias de abono com data no mês atual
    let marcadosTotal = 0;
    const calcularDiasParcela = (inicio: string | null, fim: string | null): number => {
      if (!inicio || !fim) return 0;
      try {
        const startDate = parseISO(inicio);
        const endDate = parseISO(fim);
        if (getMonth(startDate) === mes && getYear(startDate) === ano) {
          return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
      } catch {
        // Ignorar datas inválidas
      }
      return 0;
    };

    abonosDoMes.forEach(a => {
      marcadosTotal += calcularDiasParcela(a.parcela1_inicio, a.parcela1_fim);
      marcadosTotal += calcularDiasParcela(a.parcela2_inicio, a.parcela2_fim);
      marcadosTotal += calcularDiasParcela(a.parcela3_inicio, a.parcela3_fim);
      marcadosTotal += calcularDiasParcela(a.data_inicio, a.data_fim);
    });

    return {
      limite: LIMITE_ABONO_MENSAL,
      previsto: previstoTotal,
      marcados: marcadosTotal,
      saldo: LIMITE_ABONO_MENSAL - marcadosTotal,
    };
  }, [abonos, mes, ano]);

  return {
    ferias: feriasQuota,
    abono: abonoQuota,
    loading,
    refetch: fetchData,
  };
};
