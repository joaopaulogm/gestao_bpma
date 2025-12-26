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
const FLORA_BUCKET = 'imagens-flora';

// Helper to normalize filename (remove accents and spaces)
const normalizeFilename = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
};

// ==================== FAUNA ====================

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

// ==================== FLORA ====================

export const uploadFloraImage = async (
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
      .from(FLORA_BUCKET)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem flora:', uploadError);
      return null;
    }

    return filename;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem flora:', error);
    return null;
  }
};

export const deleteFloraImage = async (filename: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(FLORA_BUCKET)
      .remove([filename]);

    if (error) {
      console.error('Erro ao excluir imagem flora:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir imagem flora:', error);
    return false;
  }
};

export const getFloraImageUrl = (filename: string): string => {
  const { data } = supabase.storage
    .from(FLORA_BUCKET)
    .getPublicUrl(filename);
  return data.publicUrl;
};

export const atualizarImagensFlora = async (
  id: string,
  imagens: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dim_especies_flora')
      .update({ imagens })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar imagens flora:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar imagens flora:', error);
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
    
    return (data || []).map(item => ({
      ...item,
      imagens: Array.isArray(item.imagens) ? item.imagens as string[] : []
    })) as Especie[];
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
    
    return (data || []).map(item => ({
      ...item,
      imagens: Array.isArray(item.imagens) ? item.imagens as string[] : []
    })) as Especie[];
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
    
    if (!data) return null;
    
    return {
      ...data,
      imagens: Array.isArray(data.imagens) ? data.imagens as string[] : []
    } as Especie;
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
    
    if (!data) return null;
    
    return {
      ...data,
      imagens: Array.isArray(data.imagens) ? data.imagens as string[] : []
    } as Especie;
  } catch (error) {
    console.error("Erro ao buscar espécie por nome científico:", error);
    return null;
  }
};

export const cadastrarEspecie = async (especie: Omit<Especie, 'id'>): Promise<Especie | null> => {
  try {
    // Generate UUID for the new species
    const newId = crypto.randomUUID();
    
    // Insert into dimension table first with explicit ID
    const { data: dimData, error: dimError } = await supabase
      .from("dim_especies_fauna")
      .insert([{ id: newId, ...especie }])
      .select()
      .maybeSingle();
    
    if (dimError) {
      console.error("Erro ao cadastrar espécie na dimensão:", dimError);
      return null;
    }

    if (!dimData) return null;

    // Create slug from nome_popular
    const slug = especie.nome_popular
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Determine grupo based on classe_taxonomica
    const grupoMap: Record<string, string> = {
      'AVE': 'aves',
      'MAMIFERO': 'mamiferos',
      'REPTIL': 'repteis',
      'PEIXE': 'peixes'
    };
    const grupo = grupoMap[especie.classe_taxonomica] || 'outros';

    // Also insert into operational fauna table
    const { error: faunaError } = await supabase
      .from("fauna")
      .insert([{
        nome_popular: especie.nome_popular,
        nome_popular_slug: slug,
        nome_cientifico: especie.nome_cientifico,
        classe_taxonomica: especie.classe_taxonomica,
        ordem_taxonomica: especie.ordem_taxonomica,
        estado_conservacao: especie.estado_de_conservacao,
        tipo_fauna: especie.tipo_de_fauna,
        grupo: grupo,
        id_dim_especie_fauna: dimData.id,
        bucket: 'imagens-fauna',
        imagens: []
      }]);
    
    if (faunaError) {
      console.error("Erro ao cadastrar espécie na tabela fauna:", faunaError);
      // Still return dimData since main record was created
    }
    
    return {
      ...dimData,
      imagens: Array.isArray(dimData.imagens) ? dimData.imagens as string[] : []
    } as Especie;
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
    
    if (!data) return null;
    
    return {
      ...data,
      imagens: Array.isArray(data.imagens) ? data.imagens as string[] : []
    } as Especie;
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
