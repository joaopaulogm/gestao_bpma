import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardOperacionalKPIs from './DashboardOperacionalKPIs';
import DashboardOperacionalCharts from './DashboardOperacionalCharts';
import DashboardOperacionalRankings from './DashboardOperacionalRankings';

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

  // Buscar KPIs do ano
  const { data: kpis, isLoading: loadingKPIs, error: errorKPIs } = useQuery({
    queryKey: ['dashboard-operacional-kpis', year],
    queryFn: async (): Promise<YearKPIs> => {
      if (isHistorico) {
        // Buscar dados históricos via view
        const { data, error } = await supabase
          .from(`fat_resgates_diarios_${year}` as any)
          .select('quantidade_resgates, quantidade_solturas, quantidade_obitos, quantidade_feridos, quantidade_filhotes');
        
        if (error) throw error;

        const totals = (data || []).reduce((acc, row: any) => ({
          resgates: acc.resgates + (row.quantidade_resgates || 0),
          solturas: acc.solturas + (row.quantidade_solturas || 0),
          obitos: acc.obitos + (row.quantidade_obitos || 0),
          feridos: acc.feridos + (row.quantidade_feridos || 0),
          filhotes: acc.filhotes + (row.quantidade_filhotes || 0)
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
        // Buscar dados de 2026+ dos formulários
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const [resgatesRes, crimesAmbRes, criComRes, prevRes] = await Promise.all([
          supabase.from('fat_registros_de_resgate')
            .select('quantidade_total, quantidade_adulto, quantidade_filhote')
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

        const prevencao = prevRes.data || [];
        const publicoPrev = prevencao.reduce((sum, p) => sum + (p.quantidade_publico || 0), 0);

        return {
          totalAnimais,
          totalSolturas: 0, // Calcular via desfecho
          totalObitos: 0,
          totalFeridos: 0,
          totalFilhotes,
          taxaMortalidade: 0,
          taxaSoltura: 0,
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

  // Buscar série mensal
  const { data: monthlyData, isLoading: loadingMonthly } = useQuery({
    queryKey: ['dashboard-operacional-monthly', year],
    queryFn: async (): Promise<MonthlyData[]> => {
      if (isHistorico) {
        const { data, error } = await supabase
          .from(`fat_resgates_diarios_${year}` as any)
          .select('data_ocorrencia, quantidade_resgates, quantidade_solturas, quantidade_obitos');

        if (error) {
          console.warn('Erro ao buscar dados mensais:', error);
          return MESES.map((mesNome, i) => ({ mes: i + 1, mesNome, resgates: 0, solturas: 0, obitos: 0 }));
        }

        const byMonth: Record<number, { resgates: number; solturas: number; obitos: number }> = {};
        (data || []).forEach((row: any) => {
          const month = new Date(row.data_ocorrencia).getMonth() + 1;
          if (!byMonth[month]) byMonth[month] = { resgates: 0, solturas: 0, obitos: 0 };
          byMonth[month].resgates += row.quantidade_resgates || 0;
          byMonth[month].solturas += row.quantidade_solturas || 0;
          byMonth[month].obitos += row.quantidade_obitos || 0;
        });

        return MESES.map((mesNome, i) => ({
          mes: i + 1,
          mesNome,
          resgates: byMonth[i + 1]?.resgates || 0,
          solturas: byMonth[i + 1]?.solturas || 0,
          obitos: byMonth[i + 1]?.obitos || 0
        }));
      } else {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data } = await supabase
          .from('fat_registros_de_resgate')
          .select('data, quantidade_total')
          .gte('data', startDate).lte('data', endDate);

        const byMonth: Record<number, number> = {};
        (data || []).forEach(row => {
          const month = new Date(row.data).getMonth() + 1;
          byMonth[month] = (byMonth[month] || 0) + (row.quantidade_total || 1);
        });

        return MESES.map((mesNome, i) => ({
          mes: i + 1,
          mesNome,
          resgates: byMonth[i + 1] || 0,
          solturas: 0,
          obitos: 0
        }));
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar distribuição por classe
  const { data: classeData, isLoading: loadingClasse } = useQuery({
    queryKey: ['dashboard-operacional-classe', year],
    queryFn: async (): Promise<ClasseDistribuicao[]> => {
      if (isHistorico) {
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
      return [];
    },
    staleTime: 5 * 60 * 1000
  });

  // Buscar ranking de espécies
  const { data: especiesRanking, isLoading: loadingEspecies } = useQuery({
    queryKey: ['dashboard-operacional-especies', year],
    queryFn: async (): Promise<EspecieRanking[]> => {
      if (isHistorico) {
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
      return [];
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

  const isLoading = loadingKPIs || loadingMonthly || loadingClasse || loadingEspecies;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardOperacionalKPIs kpis={kpis!} year={year} />
      <DashboardOperacionalCharts
        monthlyData={monthlyData || []}
        classeData={classeData || []}
        year={year}
        isHistorico={isHistorico}
      />
      <DashboardOperacionalRankings
        especiesRanking={especiesRanking || []}
        year={year}
        isHistorico={isHistorico}
      />
    </div>
  );
};

export default DashboardOperacionalContent;
