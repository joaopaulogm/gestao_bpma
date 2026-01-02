import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EspecieResumo {
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  tipo_de_fauna: string;
  estado_de_conservacao: string;
  total_resgates: number;
  total_filhotes: number;
  total_obitos: number;
  total_solturas: number;
  total_feridos: number;
  num_ocorrencias: number;
}

export interface DistribuicaoClasse {
  ano: number;
  classe_taxonomica: string;
  registros: number;
  total_resgates: number;
  total_obitos: number;
  total_solturas: number;
}

export interface ResumoAnual {
  ano: number;
  classe_taxonomica: string;
  tipo_de_fauna: string;
  especies_unicas: number;
  total_resgates: number;
  total_filhotes: number;
  total_obitos: number;
  total_solturas: number;
  total_feridos: number;
}

export interface HistoricalFilters {
  ano?: number | null;
  classe?: string | null;
  estadoConservacao?: string | null;
}

export const useHistoricalData = (filters: HistoricalFilters = {}) => {
  // Fetch top 10 species
  const topSpeciesQuery = useQuery({
    queryKey: ['topSpecies', filters],
    queryFn: async (): Promise<EspecieResumo[]> => {
      const { data, error } = await (supabase as any)
        .from('vw_resumo_especies_historico')
        .select('*')
        .order('total_resgates', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as unknown as EspecieResumo[];
    }
  });

  // Fetch class distribution by year
  const classDistributionQuery = useQuery({
    queryKey: ['classDistribution', filters],
    queryFn: async (): Promise<DistribuicaoClasse[]> => {
      let query = (supabase as any)
        .from('vw_distribuicao_classe_historico')
        .select('*')
        .order('ano', { ascending: true });
      
      if (filters.ano) {
        query = query.eq('ano', filters.ano);
      }
      if (filters.classe) {
        query = query.eq('classe_taxonomica', filters.classe);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DistribuicaoClasse[];
    }
  });

  // Fetch annual summary
  const annualSummaryQuery = useQuery({
    queryKey: ['annualSummary', filters],
    queryFn: async (): Promise<ResumoAnual[]> => {
      let query = (supabase as any)
        .from('vw_resumo_anual_resgates')
        .select('*')
        .order('ano', { ascending: true });
      
      if (filters.ano) {
        query = query.eq('ano', filters.ano);
      }
      if (filters.classe) {
        query = query.eq('classe_taxonomica', filters.classe);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ResumoAnual[];
    }
  });

  // Get unique classes for filter
  const classesQuery = useQuery({
    queryKey: ['historicalClasses'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await (supabase as any)
        .from('vw_distribuicao_classe_historico')
        .select('classe_taxonomica');
      
      if (error) throw error;
      const classes = [...new Set((data || []).map((d: any) => d.classe_taxonomica))];
      return classes.filter(Boolean).sort() as string[];
    }
  });

  // Get unique conservation states for filter
  const conservationStatesQuery = useQuery({
    queryKey: ['conservationStates'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await (supabase as any)
        .from('vw_resumo_especies_historico')
        .select('estado_de_conservacao');
      
      if (error) throw error;
      const states = [...new Set((data || []).map((d: any) => d.estado_de_conservacao))];
      return states.filter(Boolean).sort() as string[];
    }
  });

  const isLoading = 
    topSpeciesQuery.isLoading || 
    classDistributionQuery.isLoading || 
    annualSummaryQuery.isLoading;

  return {
    topSpecies: topSpeciesQuery.data || [],
    classDistribution: classDistributionQuery.data || [],
    annualSummary: annualSummaryQuery.data || [],
    classes: classesQuery.data || [],
    conservationStates: conservationStatesQuery.data || [],
    isLoading,
    error: topSpeciesQuery.error || classDistributionQuery.error || annualSummaryQuery.error,
    refetch: () => {
      topSpeciesQuery.refetch();
      classDistributionQuery.refetch();
      annualSummaryQuery.refetch();
    }
  };
};
