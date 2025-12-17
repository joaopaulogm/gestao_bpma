import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://oiwwptnqaunsyhpkwbrz.supabase.co';

export interface SyncResult {
  success: boolean;
  dryRun: boolean;
  results: {
    tipo: string;
    processed: number;
    updated: number;
    errors: string[];
    details: any[];
  }[];
}

export const syncSpecies = async (tipo?: 'fauna' | 'flora', dryRun = false): Promise<SyncResult> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Usuário não autenticado');
  }

  const response = await supabase.functions.invoke('sync-species', {
    body: { tipo, dryRun }
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const getImageUrl = (bucket: string, filename: string): string => {
  if (!filename) return '';
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
};

export const listBucketImages = async (bucket: string, slug: string): Promise<string[]> => {
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list('', { limit: 100 });

  if (error || !files) return [];

  return files
    .filter(file => {
      const fileName = file.name.toLowerCase();
      const normalizedSlug = slug.toLowerCase();
      return fileName.startsWith(normalizedSlug) || 
             fileName.includes(`${normalizedSlug}_`) ||
             fileName.includes(`${normalizedSlug}-`);
    })
    .map(file => file.name)
    .sort();
};

export const updateSpeciesPhoto = async (
  table: 'dim_especies_fauna' | 'dim_especies_flora',
  id: string,
  fotoPrincipal: string,
  fotos: string[]
): Promise<boolean> => {
  const { error } = await supabase
    .from(table)
    .update({
      foto_principal_path: fotoPrincipal,
      fotos_paths: fotos,
      foto_status: 'validada',
      foto_validada_em: new Date().toISOString()
    })
    .eq('id', id);

  return !error;
};

export const revalidateSpeciesPhoto = async (
  table: 'dim_especies_fauna' | 'dim_especies_flora',
  id: string
): Promise<boolean> => {
  const { error } = await supabase
    .from(table)
    .update({
      foto_status: 'pendente',
      foto_validada_em: null
    })
    .eq('id', id);

  return !error;
};

export const getSyncLogs = async (tipo?: 'fauna' | 'flora', limit = 50) => {
  let query = supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};
