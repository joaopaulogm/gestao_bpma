import { supabase } from "@/integrations/supabase/client";

export interface Especie {
  id: string;
  classe_taxonomica: string;
  nome_popular: string;
  nome_cientifico: string;
  ordem_taxonomica: string;
  estado_de_conservacao: string;
  tipo_de_fauna: string;
  imagens?: string[];
}

const FAUNA_BUCKET = 'imagens-fauna';

// Helper to normalize filename (remove accents and spaces)
const normalizeFilename = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
};

export const uploadFaunaImage = async (
  especieId: string,
  nomePopular: string,
  file: File
): Promise<string | null> => {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const normalizedName = normalizeFilename(nomePopular);
    const timestamp = Date.now();
    const filename = `${normalizedName}-${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(FAUNA_BUCKET)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem:', uploadError);
      return null;
    }

    return filename;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return null;
  }
};

export const deleteFaunaImage = async (filename: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(FAUNA_BUCKET)
      .remove([filename]);

    if (error) {
      console.error('Erro ao excluir imagem:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return false;
  }
};

export const getFaunaImageUrl = (filename: string): string => {
  const { data } = supabase.storage
    .from(FAUNA_BUCKET)
    .getPublicUrl(filename);
  return data.publicUrl;
};

export const atualizarImagensEspecie = async (
  id: string,
  imagens: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dim_especies_fauna')
      .update({ imagens })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar imagens:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar imagens:', error);
    return false;
  }
};

export const buscarTodasEspecies = async (): Promise<Especie[]> => {
  try {
    const { data, error } = await supabase
      .from("dim_especies_fauna")
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
    let query = supabase.from("dim_especies_fauna").select("*");
    
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
      .from("dim_especies_fauna")
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
      .from("dim_especies_fauna")
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

export const buscarEspeciePorNomeCientifico = async (nomeCientifico: string): Promise<Especie | null> => {
  try {
    const { data, error } = await supabase
      .from("dim_especies_fauna")
      .select("*")
      .ilike("nome_cientifico", nomeCientifico)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao buscar espécie por nome científico:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar espécie por nome científico:", error);
    return null;
  }
};

export const cadastrarEspecie = async (especie: Omit<Especie, 'id'>): Promise<Especie | null> => {
  try {
    const { data, error } = await supabase
      .from("dim_especies_fauna")
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
      .from("dim_especies_fauna")
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
      .from("dim_especies_fauna")
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
