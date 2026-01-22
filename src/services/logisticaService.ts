import { supabase } from '@/integrations/supabase/client';

// ==================== TIPOS ====================

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
  ano_fabricacao?: string;
  localizacao?: string;
  situacao?: string;
  motivo_baixa?: string;
  km_hm_atual?: number;
  km_proxima_troca_pneu?: number;
  km_hm_proxima_revisao?: number;
  data_ultima_troca_pneu?: string;
  modelo_pneu?: string;
  tombamento_kit_sinalizador?: string;
  tombamento_radio?: string;
  numero_serie_radio?: string;
  responsavel?: string;
  observacoes?: string;
}

export interface TGRL {
  id: string;
  created_at?: string;
  updated_at?: string;
  tombamento: string;
  subitem?: string;
  especificacao_bem: string;
  chassi_serie?: string;
  valor?: number;
  estado_conservacao?: string;
  localizacao?: string;
  situacao?: string;
  observacoes?: string;
}

export interface FrotaHistorico {
  id: string;
  frota_id: string;
  created_at?: string;
  usuario_id?: string;
  km_hm_atual?: number;
  situacao?: string;
  motivo_baixa?: string;
  localizacao?: string;
  responsavel?: string;
  km_proxima_troca_pneu?: number;
  km_hm_proxima_revisao?: number;
  data_ultima_troca_pneu?: string;
  observacoes?: string;
  tipo_atualizacao?: string;
  observacao_mudanca?: string;
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
      // Se a tabela não existe, retornar array vazio em vez de lançar erro
      if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar frota:', error);
    return [];
  }
};

export const buscarFrotaPorId = async (id: string): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar veículo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return null;
  }
};

export const buscarFrotaPorPrefixo = async (prefixo: string): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota')
      .select('*')
      .eq('prefixo', prefixo)
      .single();

    if (error) {
      console.error('Erro ao buscar veículo por prefixo:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar veículo por prefixo:', error);
    return null;
  }
};

export const criarFrota = async (frota: Omit<Frota, 'id' | 'created_at' | 'updated_at'>): Promise<Frota | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_frota')
      .insert(frota)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar veículo:', error);
      throw error;
    }

    return data;
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
      .update(atualizacoes)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }

    // Registrar no histórico se houver mudanças relevantes
    if (atualizacoes.km_hm_atual || atualizacoes.situacao || atualizacoes.localizacao) {
      await criarFrotaHistorico(id, atualizacoes);
    }

    return data;
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
      throw error;
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
    const historico: Partial<FrotaHistorico> = {
      frota_id: frotaId,
      ...mudancas,
      tipo_atualizacao: mudancas.km_hm_atual ? 'km' : 
                       mudancas.situacao ? 'situacao' :
                       mudancas.localizacao ? 'localizacao' :
                       'outro',
    };

    const { data, error } = await supabase
      .from('fat_frota_historico')
      .insert(historico)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar histórico:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    return null;
  }
};

export const buscarFrotaHistorico = async (frotaId: string): Promise<FrotaHistorico[]> => {
  try {
    const { data, error } = await supabase
      .from('fat_frota_historico')
      .select('*')
      .eq('frota_id', frotaId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
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
      // Se a tabela não existe, retornar array vazio em vez de lançar erro
      if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar TGRL:', error);
    return [];
  }
};

export const buscarTGRLPorId = async (id: string): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_tgrl')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar equipamento:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar equipamento:', error);
    return null;
  }
};

export const buscarTGRLPorTombamento = async (tombamento: string): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_tgrl')
      .select('*')
      .eq('tombamento', tombamento)
      .single();

    if (error) {
      console.error('Erro ao buscar equipamento por tombamento:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar equipamento por tombamento:', error);
    return null;
  }
};

export const criarTGRL = async (tgrl: Omit<TGRL, 'id' | 'created_at' | 'updated_at'>): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabase
      .from('dim_tgrl')
      .insert(tgrl)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar equipamento:', error);
      throw error;
    }

    return data;
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
      .update(atualizacoes)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar equipamento:', error);
      throw error;
    }

    return data;
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
      throw error;
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
}

export const buscarEstatisticasFrota = async (): Promise<EstatisticasFrota> => {
  try {
    const { data, error } = await supabase.from('dim_frota').select('situacao, tipo, localizacao');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Se a tabela não existe, retornar valores padrão
      if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
        return {
          total: 0,
          disponiveis: 0,
          indisponiveis: 0,
          baixadas: 0,
          porTipo: {},
          porLocalizacao: {},
        };
      }
      return {
        total: 0,
        disponiveis: 0,
        indisponiveis: 0,
        baixadas: 0,
        porTipo: {},
        porLocalizacao: {},
      };
    }

    const total = data?.length || 0;
    const disponiveis = data?.filter(v => v.situacao === 'Disponível').length || 0;
    const indisponiveis = data?.filter(v => v.situacao === 'Indisponível').length || 0;
    const baixadas = data?.filter(v => v.situacao === 'Baixada').length || 0;

    const porTipo: Record<string, number> = {};
    const porLocalizacao: Record<string, number> = {};

    data?.forEach(veiculo => {
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
    const { data, error } = await supabase.from('dim_tgrl').select('estado_conservacao, localizacao, valor');

    if (error) {
      console.error('Erro ao buscar estatísticas TGRL:', error);
      // Se a tabela não existe, retornar valores padrão
      if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01') {
        return {
          total: 0,
          porEstado: {},
          porLocalizacao: {},
          valorTotal: 0,
        };
      }
      return {
        total: 0,
        porEstado: {},
        porLocalizacao: {},
        valorTotal: 0,
      };
    }

    const total = data?.length || 0;
    const porEstado: Record<string, number> = {};
    const porLocalizacao: Record<string, number> = {};
    let valorTotal = 0;

    data?.forEach(equipamento => {
      if (equipamento.estado_conservacao) {
        porEstado[equipamento.estado_conservacao] = (porEstado[equipamento.estado_conservacao] || 0) + 1;
      }
      if (equipamento.localizacao) {
        porLocalizacao[equipamento.localizacao] = (porLocalizacao[equipamento.localizacao] || 0) + 1;
      }
      if (equipamento.valor) {
        valorTotal += Number(equipamento.valor);
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
