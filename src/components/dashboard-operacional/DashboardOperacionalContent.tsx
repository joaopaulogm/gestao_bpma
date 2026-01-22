import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardOperacionalKPIs from './DashboardOperacionalKPIs';
import DashboardOperacionalCharts from './DashboardOperacionalCharts';
import DashboardOperacionalRankings from './DashboardOperacionalRankings';
import DashboardOperacionalIndicadores, { IndicadoresData } from './DashboardOperacionalIndicadores';
import DashboardOperacionalOrdemPorClasse, { ClasseOrdemData } from './DashboardOperacionalOrdemPorClasse';
import DashboardOperacionalSazonalidade, { SazonalidadeHistorico, SazonalidadeData } from './DashboardOperacionalSazonalidade';
import DashboardOperacionalRecordes, { RecordeApreensao } from './DashboardOperacionalRecordes';
import DashboardOperacionalHorarioChart from './DashboardOperacionalHorarioChart';
import DashboardComparativoAnos from '@/components/dashboard/DashboardComparativoAnos';
import DashboardMapaCalor from '@/components/dashboard/DashboardMapaCalor';
import DashboardRankingEspecies from '@/components/dashboard/DashboardRankingEspecies';
import DashboardTendenciaSazonal from '@/components/dashboard/DashboardTendenciaSazonal';
import DashboardAlertasPicos from '@/components/dashboard/DashboardAlertasPicos';
import DashboardAtropelamentos from '@/components/dashboard/DashboardAtropelamentos';

interface HorarioData {
  periodo: string;
  faixa: string;
  quantidade: number;
  cor: string;
}

interface DashboardOperacionalContentProps {
  year: number;
}

export interface YearKPIs {
  totalAnimais: number;
  totalSolturas: number;
  totalObitos: number;
  totalFeridos: number;
  totalFilhotes: number;
  taxaMortalidade: number;
  taxaSoltura: number;
  totalCrimesAmbientais: number;
  totalCrimesComuns: number;
  totalPrevencao: number;
  publicoPrevencao: number;
  isHistorico: boolean;
}

export interface MonthlyData {
  mes: number;
  mesNome: string;
  resgates: number;
  solturas: number;
  obitos: number;
  feridos: number;
}

export interface ClasseDistribuicao {
  classe: string;
  quantidade: number;
  percentual: number;
}

export interface EspecieRanking {
  nome: string;
  quantidade: number;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DashboardOperacionalContent: React.FC<DashboardOperacionalContentProps> = ({ year }) => {
  const isHistorico = year <= 2025;

  // Buscar indicadores operacionais de fact_indicador_mensal_bpma
  const { data: indicadoresData, isLoading: loadingIndicadores } = useQuery({
    queryKey: ['dashboard-operacional-indicadores', year],
    queryFn: async (): Promise<IndicadoresData> => {
      // Primeiro, buscar os tempo_ids do ano
      const { data: tempoData, error: tempoError } = await supabase
        .from('dim_tempo')
        .select('id')
        .eq('ano', year);

      if (tempoError || !tempoData?.length) {
        console.error('Erro ao buscar tempo:', tempoError);
        return getEmptyIndicadores();
      }

      const tempoIds = tempoData.map(t => t.id);

      // Buscar indicadores filtrados pelos tempo_ids
      const { data, error } = await supabase
        .from('fact_indicador_mensal_bpma')
        .select('indicador_id, valor')
        .in('tempo_id', tempoIds);

      if (error) {
        console.error('Erro ao buscar indicadores:', error);
        return getEmptyIndicadores();
      }

      // Agregar por indicador
      const aggregated: Record<string, number> = {};
      (data || []).forEach((row: any) => {
        const id = row.indicador_id;
        aggregated[id] = (aggregated[id] || 0) + (row.valor || 0);
      });

      return {
        atendimentosRegistrados: aggregated['atendimentos_registrados'] || 0,
        tcoPMDF: aggregated['termos_circunstanciados_de_ocorrencia_pmdf'] || 0,
        tcoOutras: aggregated['termos_circunstanciados_outras'] || 0,
        emApuracao: aggregated['em_apuracao'] || 0,
        flagrantes: aggregated['flagrantes'] || 0,
        paai: aggregated['paai'] || 0,
        apreensaoArma: aggregated['apreensao_de_arma_de_fogo_eou_municao'] || 0,
        crimesContraFauna: aggregated['crimes_contra_a_fauna'] || 0,
        crimesContraFlora: aggregated['crimes_contra_a_flora'] || 0,
        outrosCrimesAmbientais: aggregated['outros_crimes_ambientais'] || 0,
        corteArvores: aggregated['corte_de_arvores'] || 0,
        crimeAPP: aggregated['crime_contra_as_areas_de_protecao_permanente'] || 0,
        crimeUC: aggregated['crimes_contra_as_unidades_de_conservacao'] || 0,
        crimeLicenciamento: aggregated['crime_contra_o_licenciamento_ambiental'] || 0,
        crimeRecursosHidricos: aggregated['crime_contra_os_recursos_hidricos'] || 0,
        crimeRecursosPesqueiros: aggregated['crime_contra_os_recursos_pesqueiros'] || 0,
        crimeAdmAmbiental: aggregated['crimes_contra_a_administracao_ambiental'] || 0,
        parcelamentoIrregular: aggregated['parcelamento_irregular_do_solo'] || 0,
      };
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar KPIs do ano
  const { data: kpis, isLoading: loadingKPIs, error: errorKPIs } = useQuery({
    queryKey: ['dashboard-operacional-kpis', year],
    queryFn: async (): Promise<YearKPIs> => {
      if (isHistorico) {
        // Para anos históricos, usar a tabela de resumo mensal oficial
        const { data: resumoData, error: resumoError } = await supabase
          .from('fact_resumo_mensal_historico')
          .select('resgates, solturas, obitos, feridos, filhotes')
          .eq('ano', year);
        
        if (resumoError) throw resumoError;

        const totals = (resumoData || []).reduce((acc, row) => ({
          resgates: acc.resgates + (row.resgates || 0),
          solturas: acc.solturas + (row.solturas || 0),
          obitos: acc.obitos + (row.obitos || 0),
          feridos: acc.feridos + (row.feridos || 0),
          filhotes: acc.filhotes + (row.filhotes || 0)
        }), { resgates: 0, solturas: 0, obitos: 0, feridos: 0, filhotes: 0 });

        return {
          totalAnimais: totals.resgates,
          totalSolturas: totals.solturas,
          totalObitos: totals.obitos,
          totalFeridos: totals.feridos,
          totalFilhotes: totals.filhotes,
          taxaMortalidade: totals.resgates > 0 ? (totals.obitos / totals.resgates) * 100 : 0,
          taxaSoltura: totals.resgates > 0 ? (totals.solturas / totals.resgates) * 100 : 0,
          totalCrimesAmbientais: 0,
          totalCrimesComuns: 0,
          totalPrevencao: 0,
          publicoPrevencao: 0,
          isHistorico: true
        };
      } else {
        // Buscar dados de 2026+ dos formulários com desfecho
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Buscar desfechos para lookup
        const { data: desfechosData } = await supabase
          .from('dim_desfecho_resgates')
          .select('id, nome');
        
        const desfechosMap = new Map((desfechosData || []).map(d => [d.id, d.nome]));

        const [resgatesRes, crimesAmbRes, criComRes, prevRes] = await Promise.all([
          supabase.from('fat_registros_de_resgate')
            .select('quantidade_total, quantidade_adulto, quantidade_filhote, desfecho_id, estado_saude_id')
            .gte('data', startDate).lte('data', endDate),
          supabase.from('fat_registros_de_crime')
            .select('id')
            .gte('data', startDate).lte('data', endDate),
          supabase.from('fat_crimes_comuns')
            .select('id')
            .gte('data', startDate).lte('data', endDate),
          supabase.from('fat_atividades_prevencao')
            .select('quantidade_publico')
            .gte('data', startDate).lte('data', endDate)
        ]);

        const resgates = resgatesRes.data || [];
        const totalAnimais = resgates.reduce((sum, r) => 
          sum + (r.quantidade_total || (r.quantidade_adulto || 0) + (r.quantidade_filhote || 0)), 0);
        const totalFilhotes = resgates.reduce((sum, r) => sum + (r.quantidade_filhote || 0), 0);

        // Calcular solturas e óbitos baseado no desfecho
        let totalSolturas = 0;
        let totalObitos = 0;
        resgates.forEach(r => {
          const desfechoNome = r.desfecho_id ? desfechosMap.get(r.desfecho_id) : null;
          const qty = r.quantidade_total || (r.quantidade_adulto || 0) + (r.quantidade_filhote || 0) || 1;
          if (desfechoNome === 'Vida Livre' || desfechoNome === 'Resolvido no Local') {
            totalSolturas += qty;
          }
          if (desfechoNome === 'Óbito') {
            totalObitos += qty;
          }
        });

        const prevencao = prevRes.data || [];
        const publicoPrev = prevencao.reduce((sum, p) => sum + (p.quantidade_publico || 0), 0);

        return {
          totalAnimais,
          totalSolturas,
          totalObitos,
          totalFeridos: 0, // Estado de saúde "ferido" would require lookup
          totalFilhotes,
          taxaMortalidade: totalAnimais > 0 ? (totalObitos / totalAnimais) * 100 : 0,
          taxaSoltura: totalAnimais > 0 ? (totalSolturas / totalAnimais) * 100 : 0,
          totalCrimesAmbientais: crimesAmbRes.data?.length || 0,
          totalCrimesComuns: criComRes.data?.length || 0,
          totalPrevencao: prevRes.data?.length || 0,
          publicoPrevencao: publicoPrev,
          isHistorico: false
        };
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar série mensal da tabela de resumo oficial
  const { data: monthlyData, isLoading: loadingMonthly } = useQuery({
    queryKey: ['dashboard-operacional-monthly', year],
    queryFn: async (): Promise<MonthlyData[]> => {
      if (isHistorico) {
        // Usar tabela de resumo mensal com dados oficiais
        const { data, error } = await supabase
          .from('fact_resumo_mensal_historico')
          .select('mes, resgates, solturas, obitos, feridos')
          .eq('ano', year)
          .order('mes');

        if (error || !data || data.length === 0) {
          console.warn('Erro ou dados não encontrados no resumo mensal:', error);
          return MESES.map((mesNome, i) => ({ mes: i + 1, mesNome, resgates: 0, solturas: 0, obitos: 0, feridos: 0 }));
        }

        return MESES.map((mesNome, i) => {
          const row = data.find(d => d.mes === i + 1);
          return {
            mes: i + 1,
            mesNome,
            resgates: row?.resgates || 0,
            solturas: row?.solturas || 0,
            obitos: row?.obitos || 0,
            feridos: row?.feridos || 0
          };
        });
      } else {
        // 2026+: Buscar dados com destinacao (não desfecho) para calcular solturas/óbitos
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Buscar destinacoes para lookup (Soltura = soltura, Óbito não existe em destinacao, 
        // então usamos desfecho_id para óbitos que vem da dim_desfecho_resgates)
        const [destinacoesRes, desfechosRes] = await Promise.all([
          supabase.from('dim_destinacao').select('id, nome'),
          supabase.from('dim_desfecho_resgates').select('id, nome')
        ]);
        
        const destinacoesMap = new Map((destinacoesRes.data || []).map(d => [d.id, d.nome]));
        const desfechosMap = new Map((desfechosRes.data || []).map(d => [d.id, d.nome]));

        const { data } = await supabase
          .from('fat_registros_de_resgate')
          .select('data, quantidade_total, quantidade_adulto, quantidade_filhote, destinacao_id, desfecho_id')
          .gte('data', startDate).lte('data', endDate);

        const byMonth: Record<number, { resgates: number; solturas: number; obitos: number; feridos: number }> = {};
        
        (data || []).forEach(row => {
          const month = new Date(row.data).getMonth() + 1;
          const qty = row.quantidade_total || (row.quantidade_adulto || 0) + (row.quantidade_filhote || 0) || 1;
          const destinacaoNome = row.destinacao_id ? destinacoesMap.get(row.destinacao_id) : null;
          const desfechoNome = row.desfecho_id ? desfechosMap.get(row.desfecho_id) : null;
          
          if (!byMonth[month]) {
            byMonth[month] = { resgates: 0, solturas: 0, obitos: 0, feridos: 0 };
          }
          
          byMonth[month].resgates += qty;
          
          // Soltura pode vir da destinacao "Soltura" ou "Vida Livre"
          if (destinacaoNome === 'Soltura' || destinacaoNome === 'Vida Livre' ||
              desfechoNome === 'Vida Livre' || desfechoNome === 'Resolvido no Local') {
            byMonth[month].solturas += qty;
          }
          // Óbito pode vir do desfecho "Óbito"
          if (desfechoNome === 'Óbito') {
            byMonth[month].obitos += qty;
          }
        });

        return MESES.map((mesNome, i) => ({
          mes: i + 1,
          mesNome,
          resgates: byMonth[i + 1]?.resgates || 0,
          solturas: byMonth[i + 1]?.solturas || 0,
          obitos: byMonth[i + 1]?.obitos || 0,
          feridos: byMonth[i + 1]?.feridos || 0
        }));
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar distribuição por classe
  const { data: classeData, isLoading: loadingClasse } = useQuery({
    queryKey: ['dashboard-operacional-classe', year],
    queryFn: async (): Promise<ClasseDistribuicao[]> => {
      // Anos 2020-2024 têm dados de classe nas tabelas fat_resgates_diarios_YYYY
      if (isHistorico && year <= 2024) {
        const { data, error } = await supabase
          .from(`fat_resgates_diarios_${year}` as any)
          .select('classe_taxonomica, quantidade_resgates');

        if (error) return [];

        const byClasse: Record<string, number> = {};
        let total = 0;
        (data || []).forEach((row: any) => {
          const classe = row.classe_taxonomica || 'Não informado';
          byClasse[classe] = (byClasse[classe] || 0) + (row.quantidade_resgates || 0);
          total += row.quantidade_resgates || 0;
        });

        return Object.entries(byClasse)
          .map(([classe, quantidade]) => ({
            classe,
            quantidade,
            percentual: total > 0 ? (quantidade / total) * 100 : 0
          }))
          .sort((a, b) => b.quantidade - a.quantidade);
      }
      
      // 2025 usa fat_resgates_diarios_2025_especies
      if (year === 2025) {
        const { data, error } = await supabase
          .from('fat_resgates_diarios_2025_especies')
          .select('classe_taxonomica, quantidade_resgates');

        if (error) return [];

        const byClasse: Record<string, number> = {};
        let total = 0;
        (data || []).forEach((row: any) => {
          const classe = row.classe_taxonomica || 'Não informado';
          byClasse[classe] = (byClasse[classe] || 0) + (row.quantidade_resgates || 0);
          total += row.quantidade_resgates || 0;
        });

        return Object.entries(byClasse)
          .map(([classe, quantidade]) => ({
            classe,
            quantidade,
            percentual: total > 0 ? (quantidade / total) * 100 : 0
          }))
          .sort((a, b) => b.quantidade - a.quantidade);
      }
      
      // 2026+: Buscar da fat_registros_de_resgate com lookup na dim_especies_fauna
      if (year >= 2026) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const { data, error } = await supabase
          .from('fat_registros_de_resgate')
          .select(`
            quantidade_total, quantidade_adulto, quantidade_filhote,
            especie:dim_especies_fauna(classe_taxonomica)
          `)
          .gte('data', startDate).lte('data', endDate);
        
        if (error) return [];
        
        const byClasse: Record<string, number> = {};
        let total = 0;
        (data || []).forEach((row: any) => {
          const classe = row.especie?.classe_taxonomica || 'Não informado';
          const qty = row.quantidade_total || (row.quantidade_adulto || 0) + (row.quantidade_filhote || 0) || 1;
          byClasse[classe] = (byClasse[classe] || 0) + qty;
          total += qty;
        });

        return Object.entries(byClasse)
          .map(([classe, quantidade]) => ({
            classe,
            quantidade,
            percentual: total > 0 ? (quantidade / total) * 100 : 0
          }))
          .sort((a, b) => b.quantidade - a.quantidade);
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar ranking de espécies
  const { data: especiesRanking, isLoading: loadingEspecies } = useQuery({
    queryKey: ['dashboard-operacional-especies', year],
    queryFn: async (): Promise<EspecieRanking[]> => {
      // Anos 2020-2024 têm dados de espécie nas tabelas fat_resgates_diarios_YYYY
      if (isHistorico && year <= 2024) {
        const { data, error } = await supabase
          .from(`fat_resgates_diarios_${year}` as any)
          .select('nome_popular, quantidade_resgates');

        if (error) return [];

        const byEspecie: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const nome = row.nome_popular || 'Não identificado';
          byEspecie[nome] = (byEspecie[nome] || 0) + (row.quantidade_resgates || 0);
        });

        return Object.entries(byEspecie)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 15);
      }
      
      // 2025 usa fat_resgates_diarios_2025_especies
      if (year === 2025) {
        const { data, error } = await supabase
          .from('fat_resgates_diarios_2025_especies')
          .select('nome_popular, quantidade_resgates');

        if (error) return [];

        const byEspecie: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const nome = row.nome_popular || 'Não identificado';
          byEspecie[nome] = (byEspecie[nome] || 0) + (row.quantidade_resgates || 0);
        });

        return Object.entries(byEspecie)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 15);
      }
      
      // 2026+: Buscar da fat_registros_de_resgate com lookup na dim_especies_fauna
      if (year >= 2026) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const { data, error } = await supabase
          .from('fat_registros_de_resgate')
          .select(`
            quantidade_total, quantidade_adulto, quantidade_filhote,
            especie:dim_especies_fauna(nome_popular)
          `)
          .gte('data', startDate).lte('data', endDate);
        
        if (error) return [];
        
        const byEspecie: Record<string, number> = {};
        (data || []).forEach((row: any) => {
          const nome = row.especie?.nome_popular || 'Não identificado';
          const qty = row.quantidade_total || (row.quantidade_adulto || 0) + (row.quantidade_filhote || 0) || 1;
          byEspecie[nome] = (byEspecie[nome] || 0) + qty;
        });

        return Object.entries(byEspecie)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 15);
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar todas as espécies da dim para lookup de ordem
  const { data: especiesDim } = useQuery({
    queryKey: ['dim-especies-fauna-lookup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dim_especies_fauna')
        .select('nome_cientifico, ordem_taxonomica, classe_taxonomica');
      
      if (error) return {};
      
      // Criar mapa de nome_cientifico -> ordem_taxonomica
      const map: Record<string, { ordem: string; classe: string }> = {};
      (data || []).forEach(row => {
        if (row.nome_cientifico) {
          const key = row.nome_cientifico.trim().toLowerCase();
          map[key] = {
            ordem: row.ordem_taxonomica || 'Não classificado',
            classe: row.classe_taxonomica || 'Não classificado'
          };
        }
      });
      return map;
    },
    staleTime: 30 * 60 * 1000 // Cache por 30 minutos
  });

  // Buscar distribuição por ordem para cada classe
  const { data: ordemPorClasseData, isLoading: loadingOrdem } = useQuery({
    queryKey: ['dashboard-operacional-ordem-classe', year, especiesDim],
    queryFn: async (): Promise<ClasseOrdemData[]> => {
      if (!especiesDim) return [];
      
      // Buscar dados de resgates do ano com nome científico
      let resgatesData: any[] = [];
      
      if (isHistorico && year <= 2024) {
        const { data, error } = await supabase
          .from('fat_resgates_diarios_2020a2024')
          .select('nome_cientifico, quantidade_resgates')
          .eq('Ano', year);
        
        if (!error && data) resgatesData = data;
      } else if (year === 2025) {
        const { data, error } = await supabase
          .from('fat_resgates_diarios_2025_especies')
          .select('nome_cientifico, quantidade_resgates');
        
        if (!error && data) resgatesData = data;
      }

      if (resgatesData.length === 0) return [];

      // Agrupar por classe e ordem usando dim_especies_fauna
      const classeOrdemMap: Record<string, Record<string, number>> = {};
      const classeTotals: Record<string, number> = {};
      
      resgatesData.forEach((row: any) => {
        const nomeCientifico = row.nome_cientifico?.trim().toLowerCase();
        const qtd = row.quantidade_resgates || 0;
        
        if (!nomeCientifico || qtd === 0) return;
        
        // Buscar ordem e classe na dim_especies_fauna
        const especieInfo = especiesDim[nomeCientifico];
        const classe = especieInfo?.classe || 'Não classificado';
        const ordem = especieInfo?.ordem || 'Não classificado';
        
        if (!classeOrdemMap[classe]) {
          classeOrdemMap[classe] = {};
          classeTotals[classe] = 0;
        }
        
        classeOrdemMap[classe][ordem] = (classeOrdemMap[classe][ordem] || 0) + qtd;
        classeTotals[classe] += qtd;
      });

      return Object.entries(classeOrdemMap)
        .filter(([classe]) => classe !== 'Não classificado')
        .map(([classe, ordens]) => {
          const total = classeTotals[classe];
          const ordensArray = Object.entries(ordens)
            .map(([ordem, quantidade]) => ({
              ordem,
              quantidade,
              percentual: total > 0 ? (quantidade / total) * 100 : 0
            }))
            .sort((a, b) => b.quantidade - a.quantidade);
          
          return { classe, ordens: ordensArray, total };
        })
        .sort((a, b) => b.total - a.total);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!especiesDim
  });

  // Buscar dados de sazonalidade para todos os anos (2020-2025)
  const { data: sazonalidadeData, isLoading: loadingSazonalidade } = useQuery({
    queryKey: ['dashboard-operacional-sazonalidade', year],
    queryFn: async (): Promise<SazonalidadeHistorico> => {
      const anosHistoricos = [2020, 2021, 2022, 2023, 2024, 2025];
      const anosData: SazonalidadeData[] = [];

      // Buscar dados mensais de todos os anos
      const { data: resumoData, error: resumoError } = await supabase
        .from('fact_resumo_mensal_historico')
        .select('ano, mes, resgates, solturas, feridos')
        .in('ano', anosHistoricos)
        .order('ano')
        .order('mes');

      if (resumoError) {
        console.error('Erro ao buscar resumo mensal:', resumoError);
        return { anos: [], anoAtual: year };
      }

      // Mapa para converter nome do mês para número
      const mesParaNumero: Record<string, number> = {
        'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
        'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
        'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
      };

      // Buscar dados de espécies por mês para todos os anos (2020-2024)
      const { data: especies2020_2024, error: errorEspecies } = await supabase
        .from('fat_resgates_diarios_2020a2024')
        .select('"Mês", "Ano", nome_popular, quantidade_resgates');

      // Buscar dados de 2025
      const { data: especies2025, error: errorEspecies2025 } = await supabase
        .from('fat_resgates_diarios_2025_especies')
        .select('mes, nome_popular, quantidade_resgates');

      // Processar resultados por ano
      const especiesResults = anosHistoricos.map(ano => {
        if (ano <= 2024) {
          const dataDoAno = (especies2020_2024 || []).filter((row: any) => row.Ano === ano);
          return {
            ano,
            especies: dataDoAno.map((row: any) => ({
              mes: mesParaNumero[row['Mês']] || 0,
              especie: row.nome_popular || 'Não identificado',
              quantidade: Number(row.quantidade_resgates) || 0
            })).filter((e: any) => e.mes > 0)
          };
        } else if (ano === 2025) {
          return {
            ano,
            especies: (especies2025 || []).map((row: any) => ({
              mes: mesParaNumero[row.mes] || 0,
              especie: row.nome_popular || 'Não identificado',
              quantidade: Number(row.quantidade_resgates) || 0
            })).filter((e: any) => e.mes > 0)
          };
        }
        return { ano, especies: [] };
      });

      // Agrupar dados por ano
      anosHistoricos.forEach(ano => {
        const mensalDoAno = (resumoData || [])
          .filter(r => r.ano === ano)
          .map(r => ({
            mes: r.mes,
            resgates: r.resgates || 0,
            feridos: r.feridos || 0,
            solturas: r.solturas || 0
          }));

        const especiesDoAno = especiesResults.find(e => e.ano === ano)?.especies || [];

        anosData.push({
          mensal: mensalDoAno,
          especiesMensais: especiesDoAno,
          ano
        });
      });

      return { anos: anosData, anoAtual: year };
    },
    staleTime: 10 * 60 * 1000
  });

  // Buscar recordes de apreensão
  const { data: recordesApreensao, isLoading: loadingRecordes } = useQuery({
    queryKey: ['dashboard-operacional-recordes'],
    queryFn: async (): Promise<RecordeApreensao[]> => {
      const { data, error } = await supabase
        .from('fact_recordes_apreensao')
        .select('*')
        .order('quantidade', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar recordes:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 10 * 60 * 1000
  });

  // Buscar distribuição por horário (apenas para 2026+)
  const { data: horarioData, isLoading: loadingHorario } = useQuery({
    queryKey: ['dashboard-operacional-horario', year],
    queryFn: async (): Promise<HorarioData[]> => {
      if (year < 2026) return [];
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const { data, error } = await supabase
        .from('fat_registros_de_resgate')
        .select('created_at, quantidade_total, quantidade_adulto, quantidade_filhote')
        .gte('data', startDate).lte('data', endDate);
      
      if (error || !data) return [];
      
      // Definir faixas horárias
      const faixas = [
        { periodo: 'Madrugada', faixa: '00:01 - 06:59', inicio: 0, fim: 6, cor: 'hsl(260, 60%, 50%)' },
        { periodo: 'Manhã 1', faixa: '07:00 - 09:59', inicio: 7, fim: 9, cor: 'hsl(38, 92%, 50%)' },
        { periodo: 'Manhã 2', faixa: '10:00 - 11:59', inicio: 10, fim: 11, cor: 'hsl(45, 93%, 47%)' },
        { periodo: 'Tarde 1', faixa: '12:00 - 14:59', inicio: 12, fim: 14, cor: 'hsl(142, 76%, 36%)' },
        { periodo: 'Tarde 2', faixa: '15:00 - 17:59', inicio: 15, fim: 17, cor: 'hsl(160, 84%, 39%)' },
        { periodo: 'Noite 1', faixa: '18:00 - 20:59', inicio: 18, fim: 20, cor: 'hsl(221, 83%, 53%)' },
        { periodo: 'Noite 2', faixa: '21:00 - 23:59', inicio: 21, fim: 23, cor: 'hsl(240, 60%, 50%)' },
      ];
      
      const contagem = faixas.map(f => ({ ...f, quantidade: 0 }));
      
      data.forEach(row => {
        if (!row.created_at) return;
        const hora = new Date(row.created_at).getHours();
        const qty = row.quantidade_total || (row.quantidade_adulto || 0) + (row.quantidade_filhote || 0) || 1;
        
        for (const faixa of contagem) {
          if (hora >= faixa.inicio && hora <= faixa.fim) {
            faixa.quantidade += qty;
            break;
          }
        }
      });
      
      return contagem;
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar dados comparativos entre anos (para o gráfico comparativo)
  const { data: dadosComparativos } = useQuery({
    queryKey: ['dashboard-operacional-comparativo'],
    queryFn: async () => {
      // Buscar resumo mensal de todos os anos
      const { data: resumoData, error } = await supabase
        .from('fact_resumo_mensal_historico')
        .select('ano, mes, resgates, solturas, obitos')
        .order('ano')
        .order('mes');
      
      if (error) return [];
      
      return (resumoData || []).map(r => ({
        ano: r.ano,
        mes: r.mes,
        total: r.resgates || 0,
        solturas: r.solturas || 0,
        obitos: r.obitos || 0
      }));
    },
    staleTime: 10 * 60 * 1000
  });

  // Buscar dados para o mapa de calor (coordenadas de ocorrências)
  const { data: pontosMapaCalor } = useQuery({
    queryKey: ['dashboard-operacional-mapa-calor', year],
    queryFn: async () => {
      if (year < 2026) {
        // Para anos históricos, não temos coordenadas detalhadas
        return [];
      }
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const { data, error } = await supabase
        .from('fat_registros_de_resgate')
        .select(`
          id, 
          latitude_origem, 
          longitude_origem,
          latitude_soltura,
          longitude_soltura,
          atropelamento,
          especie_id,
          regiao_administrativa_id
        `)
        .gte('data', startDate).lte('data', endDate);
      
      if (error || !data) return [];
      
      // Buscar espécies e regiões
      const especieIds = [...new Set(data.filter(r => r.especie_id).map(r => r.especie_id as string))];
      const regiaoIds = [...new Set(data.filter(r => r.regiao_administrativa_id).map(r => r.regiao_administrativa_id as string))];
      
      const especiesLookup: Record<string, string> = {};
      const regioesLookup: Record<string, string> = {};
      
      if (especieIds.length > 0) {
        const { data: especiesData } = await supabase
          .from('dim_especies_fauna')
          .select('id, nome_popular')
          .in('id', especieIds);
        (especiesData || []).forEach(e => { especiesLookup[e.id] = e.nome_popular; });
      }
      
      if (regiaoIds.length > 0) {
        const { data: regioesData } = await supabase
          .from('dim_regiao_administrativa')
          .select('id, nome')
          .in('id', regiaoIds);
        (regioesData || []).forEach(r => { regioesLookup[r.id] = r.nome; });
      }
      
      const pontos: Array<{
        id: string;
        latitude: number;
        longitude: number;
        tipo: 'resgate' | 'apreensao' | 'soltura' | 'atropelamento';
        nomePopular?: string;
        regiao?: string;
      }> = [];
      
      data.forEach(r => {
        const nomePopular = r.especie_id ? especiesLookup[r.especie_id] : undefined;
        const regiao = r.regiao_administrativa_id ? regioesLookup[r.regiao_administrativa_id] : undefined;
        
        // Ponto de origem (resgate/atropelamento)
        if (r.latitude_origem && r.longitude_origem) {
          const lat = parseFloat(r.latitude_origem);
          const lng = parseFloat(r.longitude_origem);
          if (!isNaN(lat) && !isNaN(lng)) {
            pontos.push({
              id: `${r.id}-origem`,
              latitude: lat,
              longitude: lng,
              tipo: r.atropelamento === 'Sim' ? 'atropelamento' : 'resgate',
              nomePopular,
              regiao
            });
          }
        }
        
        // Ponto de soltura
        if (r.latitude_soltura && r.longitude_soltura) {
          const lat = parseFloat(r.latitude_soltura);
          const lng = parseFloat(r.longitude_soltura);
          if (!isNaN(lat) && !isNaN(lng)) {
            pontos.push({
              id: `${r.id}-soltura`,
              latitude: lat,
              longitude: lng,
              tipo: 'soltura',
              nomePopular,
              regiao
            });
          }
        }
      });
      
      return pontos;
    },
    staleTime: 5 * 60 * 1000
  });

  if (errorKPIs) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados do ano {year}. Verifique se a tabela existe.
        </AlertDescription>
      </Alert>
    );
  }

  const isLoading = loadingKPIs || loadingMonthly || loadingClasse || loadingEspecies || loadingIndicadores || loadingOrdem || loadingSazonalidade || loadingRecordes || loadingHorario;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Verificar se há indicadores operacionais disponíveis
  const hasIndicadores = indicadoresData && indicadoresData.atendimentosRegistrados > 0;
  
  // Verificar se há dados de distribuição por ordem
  const hasOrdemData = ordemPorClasseData && ordemPorClasseData.length > 0;

  // Verificar se há dados de sazonalidade
  const hasSazonalidadeData = sazonalidadeData && sazonalidadeData.anos.length > 0;

  // Verificar se há recordes de apreensão do ano
  const hasRecordes = recordesApreensao && recordesApreensao.filter(r => r.ano === year).length > 0;

  // Verificar se há dados de horário
  const hasHorarioData = horarioData && horarioData.length > 0 && horarioData.some(h => h.quantidade > 0);

  return (
    <div className="space-y-8">
      {/* Indicadores Operacionais (se disponíveis) */}
      {hasIndicadores && (
        <DashboardOperacionalIndicadores data={indicadoresData!} year={year} />
      )}
      
      {/* Recordes de Apreensão */}
      {hasRecordes && (
        <DashboardOperacionalRecordes recordes={recordesApreensao!} year={year} />
      )}
      
      {/* KPIs de Fauna */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Resgate de Fauna Silvestre - {year}</h3>
        <DashboardOperacionalKPIs kpis={kpis!} year={year} />
      </div>
      
      {/* Gráficos de Fauna */}
      <DashboardOperacionalCharts
        monthlyData={monthlyData || []}
        classeData={classeData || []}
        year={year}
        isHistorico={isHistorico}
      />
      
      {/* Análise de Sazonalidade - Comparativo entre anos */}
      {hasSazonalidadeData && (
        <DashboardOperacionalSazonalidade dados={sazonalidadeData!} />
      )}
      
      {/* Distribuição por Ordem para cada Classe */}
      {hasOrdemData && (
        <DashboardOperacionalOrdemPorClasse
          data={ordemPorClasseData!}
          year={year}
        />
      )}
      
      {/* Rankings de Espécies */}
      <DashboardOperacionalRankings
        especiesRanking={especiesRanking || []}
        year={year}
        isHistorico={isHistorico}
      />
      
      {/* Ranking Interativo de Espécies com Filtros */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ranking Interativo - Top 10 Espécies por Período e Região</h3>
        <DashboardRankingEspecies 
          anosDisponiveis={[2026, 2025, 2024, 2023, 2022, 2021, 2020]}
        />
      </div>
      
      {/* Tendência Sazonal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Análise de Tendência Sazonal</h3>
        <DashboardTendenciaSazonal />
      </div>
      
      {/* Gráfico de distribuição por horário (apenas 2026+) */}
      {hasHorarioData && (
        <DashboardOperacionalHorarioChart data={horarioData!} year={year} />
      )}
      
      {/* Gráficos Comparativos entre Anos */}
      {dadosComparativos && dadosComparativos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Análise Comparativa entre Anos</h3>
          <DashboardComparativoAnos 
            dadosHistoricos={dadosComparativos}
            anosDisponiveis={[2026, 2025, 2024, 2023, 2022, 2021, 2020]}
          />
        </div>
      )}
      
      {/* Mapa de Calor (apenas 2026+) */}
      {pontosMapaCalor && pontosMapaCalor.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Distribuição Geográfica das Ocorrências</h3>
          <DashboardMapaCalor 
            pontos={pontosMapaCalor}
            ano={year}
          />
        </div>
      )}
      
      {/* Alertas de Picos Incomuns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sistema de Alertas</h3>
        <DashboardAlertasPicos year={year} />
      </div>
      
      {/* Análise de Atropelamentos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Análise de Atropelamentos de Fauna</h3>
        <DashboardAtropelamentos year={year} />
      </div>
    </div>
  );
};

function getEmptyIndicadores(): IndicadoresData {
  return {
    atendimentosRegistrados: 0,
    tcoPMDF: 0,
    tcoOutras: 0,
    emApuracao: 0,
    flagrantes: 0,
    paai: 0,
    apreensaoArma: 0,
    crimesContraFauna: 0,
    crimesContraFlora: 0,
    outrosCrimesAmbientais: 0,
    corteArvores: 0,
    crimeAPP: 0,
    crimeUC: 0,
    crimeLicenciamento: 0,
    crimeRecursosHidricos: 0,
    crimeRecursosPesqueiros: 0,
    crimeAdmAmbiental: 0,
    parcelamentoIrregular: 0,
  };
}

export default DashboardOperacionalContent;
