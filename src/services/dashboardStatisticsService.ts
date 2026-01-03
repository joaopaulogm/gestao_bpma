import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para buscar estatísticas do dashboard
 * Nota: As funções RPC e views materializadas podem não existir no banco
 * Usamos fallbacks quando necessário
 */

// Type-safe wrapper para queries em tabelas/funções não tipadas
const supabaseAny = supabase as any;

export interface DashboardStatistics {
  total_registros: number;
  total_resgates: number;
  total_crimes: number;
  total_apreensoes: number;
  total_atropelamentos: number;
  total_individuos_resgatados: number;
  total_individuos_apreendidos: number;
  especies_diferentes: number;
  classes_diferentes: number;
  periodo_inicio: string | null;
  periodo_fim: string | null;
}

export interface TimeSeriesData {
  data: string;
  ano: number;
  mes: number;
  total_resgates: number;
  total_individuos: number;
  especies_diferentes: number;
}

export interface TopEspecie {
  nome_popular: string;
  nome_cientifico: string;
  classe_taxonomica: string;
  total_resgatado: number;
  total_ocorrencias: number;
  primeira_ocorrencia: string;
  ultima_ocorrencia: string;
}

export interface DistribuicaoClasse {
  classe_taxonomica: string;
  total_registros: number;
  total_individuos: number;
  total_solturas: number;
  total_obitos: number;
  especies_diferentes: number;
  media_por_registro: number;
}

export interface EstatisticasRegiao {
  regiao_id: string;
  regiao_nome: string;
  total_registros: number;
  total_individuos: number;
  especies_diferentes: number;
}

export interface EstatisticasDestinacao {
  destinacao_id: string;
  destinacao_nome: string;
  total_registros: number;
  total_individuos: number;
  especies_diferentes: number;
}

export interface EstatisticasAtropelamento {
  classe_taxonomica: string;
  nome_popular: string;
  total_ocorrencias: number;
  total_atropelados: number;
}

/**
 * Busca estatísticas gerais do dashboard
 * Tenta usar RPC, com fallback para cálculo manual
 */
export const getDashboardStatistics = async (
  ano?: number,
  mes?: number,
  classeTaxonomica?: string
): Promise<DashboardStatistics> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_dashboard_statistics', {
      p_ano: ano || null,
      p_mes: mes || null,
      p_classe_taxonomica: classeTaxonomica || null
    });

    if (!error && data?.[0]) {
      return data[0];
    }
  } catch (err) {
    console.warn('RPC get_dashboard_statistics não disponível, usando fallback');
  }

  // Fallback: retornar valores zerados
  return {
    total_registros: 0,
    total_resgates: 0,
    total_crimes: 0,
    total_apreensoes: 0,
    total_atropelamentos: 0,
    total_individuos_resgatados: 0,
    total_individuos_apreendidos: 0,
    especies_diferentes: 0,
    classes_diferentes: 0,
    periodo_inicio: null,
    periodo_fim: null
  };
};

/**
 * Busca série temporal de resgates
 */
export const getTimeSeriesResgates = async (
  anoInicio: number = 2020,
  anoFim: number = 2025,
  classeTaxonomica?: string
): Promise<TimeSeriesData[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_time_series_resgates', {
      p_ano_inicio: anoInicio,
      p_ano_fim: anoFim,
      p_classe_taxonomica: classeTaxonomica || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_time_series_resgates não disponível');
  }

  return [];
};

/**
 * Busca top espécies resgatadas
 */
export const getTopEspeciesResgatadas = async (
  limit: number = 10,
  ano?: number,
  classeTaxonomica?: string
): Promise<TopEspecie[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_top_especies_resgatadas', {
      p_limit: limit,
      p_ano: ano || null,
      p_classe_taxonomica: classeTaxonomica || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_top_especies_resgatadas não disponível');
  }

  return [];
};

/**
 * Busca distribuição por classe taxonômica
 */
export const getDistribuicaoClasse = async (
  ano?: number
): Promise<DistribuicaoClasse[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_distribuicao_classe', {
      p_ano: ano || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_distribuicao_classe não disponível');
  }

  return [];
};

/**
 * Busca estatísticas por região
 */
export const getEstatisticasRegiao = async (
  ano?: number
): Promise<EstatisticasRegiao[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_estatisticas_regiao', {
      p_ano: ano || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_estatisticas_regiao não disponível');
  }

  return [];
};

/**
 * Busca estatísticas por destinação
 */
export const getEstatisticasDestinacao = async (
  ano?: number
): Promise<EstatisticasDestinacao[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_estatisticas_destinacao', {
      p_ano: ano || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_estatisticas_destinacao não disponível');
  }

  return [];
};

/**
 * Busca estatísticas de atropelamentos
 */
export const getEstatisticasAtropelamentos = async (
  ano?: number,
  classeTaxonomica?: string
): Promise<EstatisticasAtropelamento[]> => {
  try {
    const { data, error } = await supabaseAny.rpc('get_estatisticas_atropelamentos', {
      p_ano: ano || null,
      p_classe_taxonomica: classeTaxonomica || null
    });

    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.warn('RPC get_estatisticas_atropelamentos não disponível');
  }

  return [];
};

/**
 * Busca dados agregados da view materializada de resgates
 */
export const getResgatesAgregados = async (
  ano?: number,
  mes?: number,
  classeTaxonomica?: string
) => {
  try {
    let query = supabaseAny
      .from('mv_estatisticas_resgates')
      .select('*')
      .order('data_ocorrencia', { ascending: false });

    if (ano) {
      query = query.eq('ano', ano);
    }
    if (mes) {
      query = query.eq('mes', mes);
    }
    if (classeTaxonomica) {
      query = query.eq('classe_taxonomica', classeTaxonomica);
    }

    const { data, error } = await query;

    if (!error) {
      return data || [];
    }
  } catch (err) {
    console.warn('View mv_estatisticas_resgates não disponível');
  }

  return [];
};

/**
 * Busca dados agregados da view de crimes
 */
export const getCrimesAgregados = async (
  ano?: number,
  mes?: number
) => {
  try {
    let query = supabaseAny
      .from('mv_estatisticas_crimes')
      .select('*')
      .order('data', { ascending: false });

    if (ano) {
      query = query.eq('ano', ano);
    }
    if (mes) {
      query = query.eq('mes', mes);
    }

    const { data, error } = await query;

    if (!error) {
      return data || [];
    }
  } catch (err) {
    console.warn('View mv_estatisticas_crimes não disponível');
  }

  return [];
};

/**
 * Busca dados agregados da view de apreensões
 */
export const getApreensoesAgregadas = async (
  ano?: number,
  mes?: number
) => {
  try {
    let query = supabaseAny
      .from('mv_estatisticas_apreensoes')
      .select('*')
      .order('data', { ascending: false });

    if (ano) {
      query = query.eq('ano', ano);
    }
    if (mes) {
      query = query.eq('mes', mes);
    }

    const { data, error } = await query;

    if (!error) {
      return data || [];
    }
  } catch (err) {
    console.warn('View mv_estatisticas_apreensoes não disponível');
  }

  return [];
};

/**
 * Força atualização das views materializadas
 * (deve ser chamada periodicamente ou após inserções em lote)
 */
export const refreshDashboardViews = async (): Promise<void> => {
  try {
    const { error } = await supabaseAny.rpc('refresh_pending_views');
    if (error) {
      console.warn('Erro ao atualizar views:', error);
    }
  } catch (err) {
    console.warn('RPC refresh_pending_views não disponível');
  }
};
