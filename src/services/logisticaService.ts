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

// ==================== CONFIGURAÇÃO ====================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oiwwptnqaunsyhpkwbrz.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE';

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

async function supabaseQuery<T>(
  table: string, 
  options?: {
    select?: string;
    filters?: Record<string, string | number>;
    order?: { column: string; ascending?: boolean };
    single?: boolean;
    eq?: Record<string, string | number>;
    ilike?: Record<string, string>;
  }
): Promise<SupabaseResponse<T>> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    const params: string[] = [];
    
    if (options?.select) {
      params.push(`select=${encodeURIComponent(options.select)}`);
    } else {
      params.push('select=*');
    }
    
    if (options?.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        params.push(`${key}=eq.${encodeURIComponent(String(value))}`);
      }
    }
    
    if (options?.ilike) {
      for (const [key, value] of Object.entries(options.ilike)) {
        params.push(`${key}=ilike.${encodeURIComponent(value)}`);
      }
    }
    
    if (options?.order) {
      params.push(`order=${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const headers: Record<string, string> = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    };
    
    if (options?.single) {
      headers['Accept'] = 'application/vnd.pgrst.object+json';
    }
    
    const response = await fetch(url, { method: 'GET', headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: { message: errorText, code: String(response.status) } };
    }
    
    const data = await response.json();
    return { data: data as T, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { data: null, error: { message } };
  }
}

async function supabaseInsert<T>(table: string, record: Record<string, unknown>): Promise<SupabaseResponse<T>> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(record),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: { message: errorText, code: String(response.status) } };
    }
    
    const data = await response.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { data: null, error: { message } };
  }
}

async function supabaseUpdate<T>(table: string, id: string, updates: Record<string, unknown>): Promise<SupabaseResponse<T>> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: { message: errorText, code: String(response.status) } };
    }
    
    const data = await response.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { data: null, error: { message } };
  }
}

async function supabaseDelete(table: string, id: string): Promise<{ error: { message: string } | null }> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: { message: errorText } };
    }
    
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { error: { message } };
  }
}

// ==================== FROTA ====================

export const buscarFrota = async (filtros?: {
  prefixo?: string;
  situacao?: string;
  tipo?: string;
  localizacao?: string;
}): Promise<Frota[]> => {
  try {
    const eq: Record<string, string> = {};
    const ilike: Record<string, string> = {};
    
    if (filtros?.prefixo) {
      ilike.prefixo = `*${filtros.prefixo}*`;
    }
    if (filtros?.situacao) {
      eq.situacao = filtros.situacao;
    }
    if (filtros?.tipo) {
      eq.tipo = filtros.tipo;
    }
    if (filtros?.localizacao) {
      eq.localizacao = filtros.localizacao;
    }

    const { data, error } = await supabaseQuery<Frota[]>('dim_frota', {
      order: { column: 'prefixo', ascending: true },
      eq: Object.keys(eq).length > 0 ? eq : undefined,
      ilike: Object.keys(ilike).length > 0 ? ilike : undefined,
    });

    if (error) {
      console.error('Erro ao buscar frota:', error);
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar frota:', error);
    return [];
  }
};

export const buscarFrotaPorId = async (id: string): Promise<Frota | null> => {
  try {
    const { data, error } = await supabaseQuery<Frota>('dim_frota', {
      eq: { id },
      single: true,
    });

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
    const { data, error } = await supabaseQuery<Frota>('dim_frota', {
      eq: { prefixo },
      single: true,
    });

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
    const { data, error } = await supabaseInsert<Frota>('dim_frota', frota as Record<string, unknown>);

    if (error) {
      console.error('Erro ao criar veículo:', error);
      return null;
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
    const { data, error } = await supabaseUpdate<Frota>('dim_frota', id, atualizacoes as Record<string, unknown>);

    if (error) {
      console.error('Erro ao atualizar veículo:', error);
      return null;
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
    const { error } = await supabaseDelete('dim_frota', id);

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
    const historico = {
      frota_id: frotaId,
      ...mudancas,
      tipo_atualizacao: mudancas.km_hm_atual ? 'km' : 
                       mudancas.situacao ? 'situacao' :
                       mudancas.localizacao ? 'localizacao' :
                       'outro',
    };

    const { data, error } = await supabaseInsert<FrotaHistorico>('fat_frota_historico', historico);

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
    const { data, error } = await supabaseQuery<FrotaHistorico[]>('fat_frota_historico', {
      eq: { frota_id: frotaId },
      order: { column: 'created_at', ascending: false },
    });

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
    const eq: Record<string, string> = {};
    const ilike: Record<string, string> = {};
    
    if (filtros?.tombamento) {
      ilike.tombamento = `*${filtros.tombamento}*`;
    }
    if (filtros?.subitem) {
      eq.subitem = filtros.subitem;
    }
    if (filtros?.localizacao) {
      eq.localizacao = filtros.localizacao;
    }
    if (filtros?.estado_conservacao) {
      eq.estado_conservacao = filtros.estado_conservacao;
    }

    const { data, error } = await supabaseQuery<TGRL[]>('dim_tgrl', {
      order: { column: 'tombamento', ascending: true },
      eq: Object.keys(eq).length > 0 ? eq : undefined,
      ilike: Object.keys(ilike).length > 0 ? ilike : undefined,
    });

    if (error) {
      console.error('Erro ao buscar TGRL:', error);
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return [];
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar TGRL:', error);
    return [];
  }
};

export const buscarTGRLPorId = async (id: string): Promise<TGRL | null> => {
  try {
    const { data, error } = await supabaseQuery<TGRL>('dim_tgrl', {
      eq: { id },
      single: true,
    });

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
    const { data, error } = await supabaseQuery<TGRL>('dim_tgrl', {
      eq: { tombamento },
      single: true,
    });

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
    const { data, error } = await supabaseInsert<TGRL>('dim_tgrl', tgrl as Record<string, unknown>);

    if (error) {
      console.error('Erro ao criar equipamento:', error);
      return null;
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
    const { data, error } = await supabaseUpdate<TGRL>('dim_tgrl', id, atualizacoes as Record<string, unknown>);

    if (error) {
      console.error('Erro ao atualizar equipamento:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    return null;
  }
};

export const deletarTGRL = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseDelete('dim_tgrl', id);

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
}

export const buscarEstatisticasFrota = async (): Promise<EstatisticasFrota> => {
  try {
    const { data, error } = await supabaseQuery<{ situacao?: string; tipo?: string; localizacao?: string }[]>('dim_frota', {
      select: 'situacao,tipo,localizacao',
    });

    if (error) {
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

    const typedData = data || [];
    const total = typedData.length;
    const disponiveis = typedData.filter(v => v.situacao === 'Disponível').length;
    const indisponiveis = typedData.filter(v => v.situacao === 'Indisponível').length;
    const baixadas = typedData.filter(v => v.situacao === 'Baixada').length;

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
    const { data, error } = await supabaseQuery<{ estado_conservacao?: string; localizacao?: string; valor?: number }[]>('dim_tgrl', {
      select: 'estado_conservacao,localizacao,valor',
    });

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
    const valorTotal = typedData.reduce((sum, item) => sum + (item.valor || 0), 0);

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
