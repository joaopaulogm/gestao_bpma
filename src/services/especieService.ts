
import { supabase } from "@/integrations/supabase/client";

export interface Especie {
  id: string;
  classe_taxonomica: string;
  nome_popular: string;
  nome_cientifico: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
}

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
      .single();
    
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
