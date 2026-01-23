import { supabase } from "@/integrations/supabase/client";

export interface DimensionItem {
  id: string;
  nome: string;
}

export interface DesfechoItem {
  id: string;
  nome: string;
  tipo: string;
}

/**
 * Fetches all administrative regions
 */
export const buscarRegioesAdministrativas = async (): Promise<DimensionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_regiao_administrativa")
      .select("id, nome")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar regiões administrativas:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar regiões administrativas:", error);
    return [];
  }
};

/**
 * Fetches all origins
 */
export const buscarOrigens = async (): Promise<DimensionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_origem")
      .select("id, nome")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar origens:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar origens:", error);
    return [];
  }
};

/**
 * Fetches all destinations
 */
export const buscarDestinacoes = async (): Promise<DimensionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_destinacao")
      .select("id, nome")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar destinações:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar destinações:", error);
    return [];
  }
};

/**
 * Fetches all health states
 */
export const buscarEstadosSaude = async (): Promise<DimensionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_estado_saude")
      .select("id, nome")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar estados de saúde:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar estados de saúde:", error);
    return [];
  }
};

/**
 * Fetches all life stages
 */
export const buscarEstagiosVida = async (): Promise<DimensionItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_estagio_vida")
      .select("id, nome")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar estágios de vida:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar estágios de vida:", error);
    return [];
  }
};

/**
 * Fetches all outcomes (desfechos)
 */
export const buscarDesfechosResgate = async (): Promise<DesfechoItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_desfecho_resgates")
      .select("id, nome, tipo")
      .eq("tipo", "resgate")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar desfechos de resgate:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar desfechos de resgate:", error);
    return [];
  }
};

export const buscarDesfechosCrimeAmbiental = async (): Promise<DesfechoItem[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_desfecho_crime_ambientais")
      .select("id, nome, tipo")
      .order("nome");
    
    if (error) {
      console.error("Erro ao buscar desfechos de crime ambiental:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar desfechos de crime ambiental:", error);
    return [];
  }
};

/**
 * Finds dimension ID by name
 */
export const buscarIdPorNome = async (
  tabela: 'dim_regiao_administrativa' | 'dim_origem' | 'dim_destinacao' | 'dim_estado_saude' | 'dim_estagio_vida' | 'dim_desfecho_resgates' | 'dim_desfecho_crime_ambientais',
  nome: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select("id")
      .ilike("nome", nome)
      .maybeSingle();
    
    if (error) {
      console.error(`Erro ao buscar ID em ${tabela}:`, error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error(`Erro ao buscar ID em ${tabela}:`, error);
    return null;
  }
};
