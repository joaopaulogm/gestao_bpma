// ==================== TIPOS ====================

import { supabase } from '@/integrations/supabase/client';

export interface Frota {
  id: string;
  created_at?: string;
  updated_at?: string;
  prefixo: string;
  tombamento?: string;
  placa?: string;
  chassi?: string;
  tipo?: string;
  emprego?: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  localizacao?: string;
  situacao?: string;
  motivo_baixa?: string;
  km_atual?: number;
  km_proxima_troca_pneu?: number;
  km_proxima_revisao?: number;
  data_troca_pneu?: string;
  modelo_pneu?: string;
  tombamento_kit_sinalizador?: string;
  tombamento_radio?: string;
  numero_serie_radio?: string;
  responsavel?: string;
  observacoes?: string;
  valor_aquisicao?: number;
  // Aliases para compatibilidade
  ano_fabricacao?: string;
  km_hm_atual?: number;
  km_hm_proxima_revisao?: number;
  data_ultima_troca_pneu?: string;
}

export interface TGRL {
  id: string;
  created_at?: string;
  updated_at?: string;
  tombamento: string;
  subitem?: string;
  descricao: string;
  chassi_serie?: string;
  valor_aquisicao?: number;
  estado_conservacao?: string;
  localizacao?: string;
  situacao?: string;
  observacoes?: string;
  // Aliases para compatibilidade
  especificacao_bem?: string;
  valor?: number;
}

export interface FrotaHistorico {
  id: string;
  frota_id: string;
  created_at?: string;
  usuario_id?: string;
  campo_alterado: string;
  valor_anterior?: string;
  valor_novo?: string;
}

// ==================== FROTA ====================

export const buscarFrota = async (filtros?: {
  prefixo?: string;
  situacao?: string;
  tipo?: string;
  localizacao?: string;
}): Promise<Frota[]> => {
  try {
    let query = supabase.from('dim_frota').select('*').order('prefixo', { ascending: true });

    if (filtros?.prefixo) {
      query = query.ilike('prefixo', `%${filtros.prefixo}%`);
    }
    if (filtros?.situacao) {
      query = query.eq('situacao', filtros.situacao);
    }
    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    if (filtros?.localizacao) {
      query = query.eq('localizacao', filtros.localizacao);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar frota:', error);
      return [];
    }

    return (data as Frota[]) || [];
  } catch (error) {
    console.error('Erro ao buscar frota:', error);
    return [];
  }
};

export const buscarFrotaPorId = async (id: string): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase.from('dim_frota').select('*').eq('id', id).single();

    if (error) {
      console.error('Erro ao buscar veículo:', error);
      return null;
    }

    return data as Frota;
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return null;
  }
};

export const buscarFrotaPorPrefixo = async (prefixo: string): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase.from('dim_frota').select('*').eq('prefixo', prefixo).single();

    if (error) {
      console.error('Erro ao buscar veículo por prefixo:', error);
      return null;
    }

    return data as Frota;
  } catch (error) {
    console.error('Erro ao buscar veículo por prefixo:', error);
    return null;
  }
};

export const criarFrota = async (frota: Omit<Frota, 'id' | 'created_at' | 'updated_at'>): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase.from('dim_frota').insert(frota as any).select().single();

    if (error) {
      console.error('Erro ao criar veículo:', error);
      return null;
    }

    return data as Frota;
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return null;
  }
};

export const atualizarFrota = async (
  id: string,
  atualizacoes: Partial<Frota>
): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota')
      .update(atualizacoes as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar veículo:', error);
      return null;
    }

    // Registrar no histórico se houver mudanças relevantes
    if (atualizacoes.km_atual || atualizacoes.situacao || atualizacoes.localizacao) {
      await criarFrotaHistorico(id, atualizacoes);
    }

    return data as Frota;
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return null;
  }
};

export const deletarFrota = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('dim_frota').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar veículo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    return false;
  }
};

export const criarFrotaHistorico = async (
  frotaId: string,
  mudancas: Partial<Frota>
): Promise<FrotaHistorico | null> => {
  try {
    // Determinar qual campo foi alterado
    const campoAlterado = mudancas.km_atual ? 'km_atual' : 
                         mudancas.situacao ? 'situacao' :
                         mudancas.localizacao ? 'localizacao' : 'outro';

    const historico = {
      frota_id: frotaId,
      campo_alterado: campoAlterado,
      valor_novo: String(mudancas[campoAlterado as keyof Frota] || ''),
    };

    const { data, error } = await supabase
      .from('dim_frota_historico')
      .insert(historico)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar histórico:', error);
      return null;
    }

    return data as FrotaHistorico;
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    return null;
  }
};

export const buscarFrotaHistorico = async (frotaId: string): Promise<FrotaHistorico[]> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota_historico')
      .select('*')
      .eq('frota_id', frotaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return (data as FrotaHistorico[]) || [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
};

// ==================== TGRL ====================

export const buscarTGRL = async (filtros?: {
  tombamento?: string;
  subitem?: string;
  localizacao?: string;
  estado_conservacao?: string;
}): Promise<TGRL[]> => {
  try {
    let query = supabase.from('dim_tgrl').select('*').order('tombamento', { ascending: true });

    if (filtros?.tombamento) {
      query = query.ilike('tombamento', `%${filtros.tombamento}%`);
    }
    if (filtros?.subitem) {
      query = query.eq('subitem', filtros.subitem);
    }
    if (filtros?.localizacao) {
      query = query.eq('localizacao', filtros.localizacao);
    }
    if (filtros?.estado_conservacao) {
      query = query.eq('estado_conservacao', filtros.estado_conservacao);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar TGRL:', error);
      return [];
    }

    return (data as TGRL[]) || [];
  } catch (error) {
    console.error('Erro ao buscar TGRL:', error);
    return [];
  }
};

export const buscarTGRLPorId = async (id: string): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase.from('dim_tgrl').select('*').eq('id', id).single();

    if (error) {
      console.error('Erro ao buscar equipamento:', error);
      return null;
    }

    return data as TGRL;
  } catch (error) {
    console.error('Erro ao buscar equipamento:', error);
    return null;
  }
};

export const buscarTGRLPorTombamento = async (tombamento: string): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase.from('dim_tgrl').select('*').eq('tombamento', tombamento).single();

    if (error) {
      console.error('Erro ao buscar equipamento por tombamento:', error);
      return null;
    }

    return data as TGRL;
  } catch (error) {
    console.error('Erro ao buscar equipamento por tombamento:', error);
    return null;
  }
};

export const criarTGRL = async (tgrl: Omit<TGRL, 'id' | 'created_at' | 'updated_at'>): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase.from('dim_tgrl').insert(tgrl as any).select().single();

    if (error) {
      console.error('Erro ao criar equipamento:', error);
      return null;
    }

    return data as TGRL;
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    return null;
  }
};

export const atualizarTGRL = async (
  id: string,
  atualizacoes: Partial<TGRL>
): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_tgrl')
      .update(atualizacoes as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar equipamento:', error);
      return null;
    }

    return data as TGRL;
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    return null;
  }
};

export const deletarTGRL = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('dim_tgrl').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar equipamento:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar equipamento:', error);
    return false;
  }
};

// ==================== ESTATÍSTICAS ====================

export interface EstatisticasFrota {
  total: number;
  disponiveis: number;
  indisponiveis: number;
  baixadas: number;
  porTipo: Record<string, number>;
  porLocalizacao: Record<string, number>;
  valorTotal: number;
}

export const buscarEstatisticasFrota = async (): Promise<EstatisticasFrota> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota')
      .select('situacao,tipo,localizacao,valor_aquisicao');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total: 0,
        disponiveis: 0,
        indisponiveis: 0,
        baixadas: 0,
        porTipo: {},
        porLocalizacao: {},
        valorTotal: 0,
      };
    }

    const typedData = data || [];
    const total = typedData.length;
    const disponiveis = typedData.filter(v => v.situacao?.toLowerCase() === 'disponível').length;
    const indisponiveis = typedData.filter(v => v.situacao?.toLowerCase() === 'indisponível').length;
    const baixadas = typedData.filter(v => v.situacao?.toLowerCase() === 'baixada' || v.situacao?.toLowerCase() === 'descarga').length;
    const valorTotal = typedData.reduce((sum, v) => sum + (Number((v as any).valor_aquisicao) || 0), 0);

    const porTipo: Record<string, number> = {};
    const porLocalizacao: Record<string, number> = {};

    typedData.forEach(veiculo => {
      if (veiculo.tipo) {
        porTipo[veiculo.tipo] = (porTipo[veiculo.tipo] || 0) + 1;
      }
      if (veiculo.localizacao) {
        porLocalizacao[veiculo.localizacao] = (porLocalizacao[veiculo.localizacao] || 0) + 1;
      }
    });

    return {
      total,
      disponiveis,
      indisponiveis,
      baixadas,
      porTipo,
      porLocalizacao,
      valorTotal,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      total: 0,
      disponiveis: 0,
      indisponiveis: 0,
      baixadas: 0,
      porTipo: {},
      porLocalizacao: {},
      valorTotal: 0,
    };
  }
};

export interface EstatisticasTGRL {
  total: number;
  porEstado: Record<string, number>;
  porLocalizacao: Record<string, number>;
  valorTotal: number;
}

export const buscarEstatisticasTGRL = async (): Promise<EstatisticasTGRL> => {
  try {
    const { data, error } = await supabase
      .from('dim_tgrl')
      .select('estado_conservacao,localizacao,valor_aquisicao');

    if (error) {
      console.error('Erro ao buscar estatísticas TGRL:', error);
      return {
        total: 0,
        porEstado: {},
        porLocalizacao: {},
        valorTotal: 0,
      };
    }

    const typedData = data || [];
    const total = typedData.length;
    const valorTotal = typedData.reduce((sum, item) => sum + (item.valor_aquisicao || 0), 0);

    const porEstado: Record<string, number> = {};
    const porLocalizacao: Record<string, number> = {};

    typedData.forEach(item => {
      if (item.estado_conservacao) {
        porEstado[item.estado_conservacao] = (porEstado[item.estado_conservacao] || 0) + 1;
      }
      if (item.localizacao) {
        porLocalizacao[item.localizacao] = (porLocalizacao[item.localizacao] || 0) + 1;
      }
    });

    return {
      total,
      porEstado,
      porLocalizacao,
      valorTotal,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas TGRL:', error);
    return {
      total: 0,
      porEstado: {},
      porLocalizacao: {},
      valorTotal: 0,
    };
  }
};
