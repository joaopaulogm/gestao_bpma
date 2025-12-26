import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";

export interface SpeciesImageResult {
  success: boolean;
  url: string | null;
  urls: string[];
  filenames?: string[];
  bucket?: string;
  tipo?: string;
  message?: string;
  error?: string;
}

/**
 * Buscar imagens de uma espécie via edge function
 */
export async function buscarImagemEspecie(
  nomeCientifico: string | null,
  nomePopular: string | null,
  tipo: 'fauna' | 'flora',
  grupoTaxonomico?: string | null
): Promise<SpeciesImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke('buscar-imagens-especies', {
      body: {
        nome_cientifico: nomeCientifico,
        nome_popular: nomePopular,
        tipo: tipo,
        grupo_taxonomico: grupoTaxonomico
      }
    });

    if (error) {
      console.error('Erro ao buscar imagem:', error);
      return {
        success: false,
        url: null,
        urls: [],
        error: error.message
      };
    }

    return data as SpeciesImageResult;
  } catch (err: any) {
    console.error('Erro ao invocar buscar-imagens-especies:', err);
    return {
      success: false,
      url: null,
      urls: [],
      error: err.message
    };
  }
}

/**
 * Gerar URL de imagem direta a partir do bucket
 */
export function getDirectImageUrl(bucket: string, filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
}
