import { supabase } from "@/integrations/supabase/client";

// Enable real-time updates for especies_fauna table
const setupRealtimeUpdates = async () => {
  try {
    // Note: We don't need special setup for basic realtime functionality
    // The supabase client already supports realtime updates
    // The actual subscription is managed in the components that need it
    console.log('Realtime updates configured for especies_fauna table');
  } catch (error) {
    console.error('Error setting up realtime for especies_fauna table:', error);
  }
};

// Call this function immediately to ensure realtime is set up
setupRealtimeUpdates();

export interface Especie {
  id: string;
  classe_taxonomica: string;
  nome_popular: string;
  nome_cientifico: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
}

export const buscarTodasEspecies = async (): Promise<Especie[]> => {
  try {
    const { data, error } = await supabase
      .from("especies_fauna")
      .select("*")
      .order("nome_popular");
    
    if (error) {
      console.error("Erro ao buscar espécies:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar espécies:", error);
    return [];
  }
};

export const buscarEspeciesPorClasse = async (
  classe?: string
): Promise<Especie[]> => {
  try {
    let query = supabase.from("especies_fauna").select("*");
    
    if (classe) {
      query = query.eq("classe_taxonomica", classe);
    }
    
    const { data, error } = await query.order("nome_popular");
    
    if (error) {
      console.error("Erro ao buscar espécies:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar espécies:", error);
    return [];
  }
};

export const buscarClassesTaxonomicas = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("especies_fauna")
      .select("classe_taxonomica")
      .order("classe_taxonomica");
    
    if (error) {
      console.error("Erro ao buscar classes taxonômicas:", error);
      return [];
    }
    
    // Remover duplicatas
    const classes = [...new Set(data.map(item => item.classe_taxonomica))];
    return classes;
  } catch (error) {
    console.error("Erro ao buscar classes taxonômicas:", error);
    return [];
  }
};

export const buscarEspeciePorId = async (id: string): Promise<Especie | null> => {
  try {
    const { data, error } = await supabase
      .from("especies_fauna")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar espécie por ID:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar espécie por ID:", error);
    return null;
  }
};

export const cadastrarEspecie = async (especie: Omit<Especie, 'id'>): Promise<Especie | null> => {
  try {
    const { data, error } = await supabase
      .from("especies_fauna")
      .insert([especie])
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao cadastrar espécie:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao cadastrar espécie:", error);
    return null;
  }
};

export const atualizarEspecie = async (id: string, especie: Omit<Especie, 'id'>): Promise<Especie | null> => {
  try {
    const { data, error } = await supabase
      .from("especies_fauna")
      .update(especie)
      .eq("id", id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao atualizar espécie:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao atualizar espécie:", error);
    return null;
  }
};

export const excluirEspecie = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("especies_fauna")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Erro ao excluir espécie:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao excluir espécie:", error);
    return false;
  }
};
