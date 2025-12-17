import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  success: boolean;
  tipo: string;
  processed: number;
  updated: number;
  errors: string[];
  details: any[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function findImagesInBucket(
  supabase: any,
  bucket: string,
  slug: string
): Promise<string[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 200, search: slug });
    
    if (error || !files || files.length === 0) return [];
    
    const matchingFiles = files
      .filter((file: any) => {
        const fileName = file.name.toLowerCase();
        const normalizedSlug = slug.toLowerCase();
        return fileName.startsWith(normalizedSlug + '_') || 
               fileName.startsWith(normalizedSlug + '-') ||
               fileName === normalizedSlug + '.webp';
      })
      .map((file: any) => file.name)
      .sort()
      .slice(0, 3);
    
    return matchingFiles;
  } catch {
    return [];
  }
}

async function syncFauna(supabase: any, dryRun: boolean): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    tipo: 'fauna',
    processed: 0,
    updated: 0,
    errors: [],
    details: []
  };

  try {
    const { data: faunaRecords, error: faunaError } = await supabase
      .from('fauna')
      .select('id, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, estado_conservacao, tipo_fauna, id_dim_especie_fauna')
      .limit(30);
    
    if (faunaError) throw faunaError;
    if (!faunaRecords?.length) return result;

    console.info(`Processing ${faunaRecords.length} fauna records`);

    for (const record of faunaRecords) {
      result.processed++;
      const detail: any = { id: record.id, nome_popular: record.nome_popular, action: 'none', images_found: 0 };
      
      try {
        const slug = slugify(record.nome_popular || '');
        let dimId = record.id_dim_especie_fauna;
        
        if (!dimId) {
          const { data: existingDim } = await supabase
            .from('dim_especies_fauna')
            .select('id')
            .eq('nome_cientifico', record.nome_cientifico)
            .maybeSingle();
          
          if (existingDim) {
            dimId = existingDim.id;
            detail.action = 'linked';
          } else if (!dryRun) {
            const { data: newDim, error: createError } = await supabase
              .from('dim_especies_fauna')
              .insert({
                nome_popular: record.nome_popular,
                nome_cientifico: record.nome_cientifico || 'Não identificado',
                classe_taxonomica: record.classe_taxonomica || 'Não classificado',
                ordem_taxonomica: record.ordem_taxonomica || 'Não classificado',
                estado_de_conservacao: record.estado_conservacao || 'Não avaliado',
                tipo_de_fauna: record.tipo_fauna || 'Silvestre'
              })
              .select('id')
              .single();
            
            if (createError) {
              result.errors.push(`${record.nome_popular}: ${createError.message}`);
              continue;
            }
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          if (!dryRun && dimId) {
            await supabase.from('fauna').update({ id_dim_especie_fauna: dimId }).eq('id', record.id);
          }
        }
        
        const images = await findImagesInBucket(supabase, 'imagens-fauna', slug);
        detail.images_found = images.length;
        
        if (images.length > 0 && !dryRun && dimId) {
          await supabase
            .from('dim_especies_fauna')
            .update({
              foto_principal_path: images[0],
              fotos_paths: images,
              foto_status: 'pendente',
              foto_fonte_validacao: null
            })
            .eq('id', dimId);
          
          await supabase.from('fauna').update({ imagens: images }).eq('id', record.id);
          
          detail.action = detail.action === 'none' ? 'photos_updated' : detail.action;
          result.updated++;
        }
      } catch (e: any) {
        result.errors.push(`${record.nome_popular}: ${e.message}`);
      }
      
      result.details.push(detail);
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

async function syncFlora(supabase: any, dryRun: boolean): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    tipo: 'flora',
    processed: 0,
    updated: 0,
    errors: [],
    details: []
  };

  try {
    const { data: floraRecords, error: floraError } = await supabase
      .from('flora')
      .select('id, nome_popular, nome_cientifico, classe, ordem, familia, estado_conservacao, tipo_planta, madeira_lei, imune_ao_corte, id_dim_especie_flora')
      .limit(30);
    
    if (floraError) throw floraError;
    if (!floraRecords?.length) return result;

    console.info(`Processing ${floraRecords.length} flora records`);

    for (const record of floraRecords) {
      result.processed++;
      const detail: any = { id: record.id, nome_popular: record.nome_popular, action: 'none', images_found: 0 };
      
      try {
        const slug = slugify(record.nome_popular || '');
        let dimId = record.id_dim_especie_flora;
        
        if (!dimId) {
          const { data: existingDim } = await supabase
            .from('dim_especies_flora')
            .select('id')
            .eq('Nome Científico', record.nome_cientifico)
            .maybeSingle();
          
          if (existingDim) {
            dimId = existingDim.id;
            detail.action = 'linked';
          } else if (!dryRun) {
            const { data: newDim, error: createError } = await supabase
              .from('dim_especies_flora')
              .insert({
                'Nome Popular': record.nome_popular,
                'Nome Científico': record.nome_cientifico || 'Não identificado',
                'Classe': record.classe,
                'Ordem': record.ordem,
                'Família': record.familia,
                'Estado de Conservação': record.estado_conservacao,
                'Tipo de Planta': record.tipo_planta,
                'Madeira de Lei': record.madeira_lei ? 'Sim' : 'Não',
                'Imune ao Corte': record.imune_ao_corte ? 'Sim' : 'Não'
              })
              .select('id')
              .single();
            
            if (createError) {
              result.errors.push(`${record.nome_popular}: ${createError.message}`);
              continue;
            }
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          if (!dryRun && dimId) {
            await supabase.from('flora').update({ id_dim_especie_flora: dimId }).eq('id', record.id);
          }
        }
        
        const images = await findImagesInBucket(supabase, 'imagens-flora', slug);
        detail.images_found = images.length;
        
        if (images.length > 0 && !dryRun && dimId) {
          await supabase
            .from('dim_especies_flora')
            .update({
              foto_principal_path: images[0],
              fotos_paths: images,
              foto_status: 'pendente',
              foto_fonte_validacao: null
            })
            .eq('id', dimId);
          
          await supabase.from('flora').update({ imagens: images }).eq('id', record.id);
          
          detail.action = detail.action === 'none' ? 'photos_updated' : detail.action;
          result.updated++;
        }
      } catch (e: any) {
        result.errors.push(`${record.nome_popular}: ${e.message}`);
      }
      
      result.details.push(detail);
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { tipo, dryRun = false } = await req.json();
    console.info(`Starting sync for ${tipo || 'all'}, dryRun: ${dryRun}`);

    const results: SyncResult[] = [];

    if (!tipo || tipo === 'fauna') {
      const faunaResult = await syncFauna(supabase, dryRun);
      results.push(faunaResult);
      console.info(`Fauna: ${faunaResult.processed} processed, ${faunaResult.updated} updated`);
    }

    if (!tipo || tipo === 'flora') {
      const floraResult = await syncFlora(supabase, dryRun);
      results.push(floraResult);
      console.info(`Flora: ${floraResult.processed} processed, ${floraResult.updated} updated`);
    }

    return new Response(
      JSON.stringify({ success: results.every(r => r.success), dryRun, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
