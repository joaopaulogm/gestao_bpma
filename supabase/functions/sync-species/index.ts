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

// Slugify function to normalize names
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Simple validation - just check if Wikipedia page exists (no image comparison)
async function validateSpeciesWithWikipedia(nomeCientifico: string): Promise<{ valid: boolean; source: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const searchUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeCientifico)}`;
    const response = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { valid: true, source: `Wikipedia PT` };
    }
    
    // Try English Wikipedia with timeout
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 3000);
    
    const searchUrlEn = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeCientifico)}`;
    const responseEn = await fetch(searchUrlEn, { signal: controller2.signal });
    clearTimeout(timeoutId2);
    
    if (responseEn.ok) {
      return { valid: true, source: `Wikipedia EN` };
    }
    
    return { valid: false, source: 'Não encontrado' };
  } catch (error) {
    console.log('Wikipedia validation skipped:', error.message);
    return { valid: false, source: 'Timeout/Erro' };
  }
}

// Find matching images in bucket - optimized
async function findImagesInBucket(
  supabase: any,
  bucket: string,
  slug: string
): Promise<string[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 500, search: slug });
    
    if (error || !files || files.length === 0) return [];
    
    // Find files matching the slug pattern
    const matchingFiles = files
      .filter((file: any) => {
        const fileName = file.name.toLowerCase();
        const normalizedSlug = slug.toLowerCase();
        return fileName.startsWith(normalizedSlug) || 
               fileName.includes(`${normalizedSlug}_`) ||
               fileName.includes(`${normalizedSlug}-`);
      })
      .map((file: any) => file.name)
      .slice(0, 3); // Max 3 images
    
    return matchingFiles;
  } catch (error) {
    console.error('Error finding images:', error);
    return [];
  }
}

// Sync fauna records - optimized with batch processing
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
    // Get fauna records that need processing (limit to 50 per run)
    const { data: faunaRecords, error: faunaError } = await supabase
      .from('fauna')
      .select('*')
      .limit(50);
    
    if (faunaError) throw faunaError;
    if (!faunaRecords || faunaRecords.length === 0) {
      return result;
    }

    console.log(`Processing ${faunaRecords.length} fauna records`);

    for (const record of faunaRecords) {
      result.processed++;
      const detail: any = {
        id: record.id,
        nome_popular: record.nome_popular,
        action: 'none'
      };
      
      try {
        const slug = slugify(record.nome_popular || '');
        let dimId = record.id_dim_especie_fauna;
        
        // Link or create dimension if not exists
        if (!dimId) {
          const { data: existingDim } = await supabase
            .from('dim_especies_fauna')
            .select('id')
            .eq('nome_cientifico', record.nome_cientifico)
            .maybeSingle();
          
          if (existingDim) {
            dimId = existingDim.id;
            detail.action = 'linked';
          } else {
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
              detail.error = createError.message;
              result.errors.push(`${record.nome_popular}: ${createError.message}`);
              result.details.push(detail);
              continue;
            }
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          if (!dryRun) {
            await supabase
              .from('fauna')
              .update({ id_dim_especie_fauna: dimId })
              .eq('id', record.id);
          }
        }
        
        // Find images in bucket
        const images = await findImagesInBucket(supabase, 'imagens-fauna', slug);
        detail.images_found = images.length;
        
        if (images.length > 0 && !dryRun) {
          // Only validate with Wikipedia if we have images
          const validation = await validateSpeciesWithWikipedia(record.nome_cientifico || record.nome_popular);
          const fotoStatus = validation.valid ? 'validada' : 'pendente';
          
          await supabase
            .from('dim_especies_fauna')
            .update({
              foto_principal_path: images[0],
              fotos_paths: images,
              foto_status: fotoStatus,
              foto_fonte_validacao: validation.source,
              foto_validada_em: validation.valid ? new Date().toISOString() : null
            })
            .eq('id', dimId);
          
          await supabase
            .from('fauna')
            .update({ imagens: images })
            .eq('id', record.id);
          
          detail.action = detail.action === 'none' ? 'photos_updated' : detail.action + '+photos';
          result.updated++;
        }
        
      } catch (recordError: any) {
        detail.error = recordError.message;
        result.errors.push(`${record.nome_popular}: ${recordError.message}`);
      }
      
      result.details.push(detail);
    }

    // Log summary (not individual records to save resources)
    if (!dryRun && result.updated > 0) {
      await supabase.from('sync_logs').insert({
        tipo: 'fauna',
        especie_nome: `Batch: ${result.processed} processados`,
        acao: 'sync_batch',
        fotos_encontradas: result.updated,
        status_final: result.success ? 'success' : 'partial',
        detalhes: { processed: result.processed, updated: result.updated, errors: result.errors.length }
      });
    }

  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

// Sync flora records - optimized
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
      .select('*')
      .limit(50);
    
    if (floraError) throw floraError;
    if (!floraRecords || floraRecords.length === 0) {
      return result;
    }

    console.log(`Processing ${floraRecords.length} flora records`);

    for (const record of floraRecords) {
      result.processed++;
      const detail: any = {
        id: record.id,
        nome_popular: record.nome_popular,
        action: 'none'
      };
      
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
          } else {
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
              detail.error = createError.message;
              result.errors.push(`${record.nome_popular}: ${createError.message}`);
              result.details.push(detail);
              continue;
            }
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          if (!dryRun) {
            await supabase
              .from('flora')
              .update({ id_dim_especie_flora: dimId })
              .eq('id', record.id);
          }
        }
        
        // Find images
        const images = await findImagesInBucket(supabase, 'imagens-flora', slug);
        detail.images_found = images.length;
        
        if (images.length > 0 && !dryRun) {
          const validation = await validateSpeciesWithWikipedia(record.nome_cientifico || record.nome_popular);
          const fotoStatus = validation.valid ? 'validada' : 'pendente';
          
          await supabase
            .from('dim_especies_flora')
            .update({
              foto_principal_path: images[0],
              fotos_paths: images,
              foto_status: fotoStatus,
              foto_fonte_validacao: validation.source,
              foto_validada_em: validation.valid ? new Date().toISOString() : null
            })
            .eq('id', dimId);
          
          await supabase
            .from('flora')
            .update({ imagens: images })
            .eq('id', record.id);
          
          detail.action = detail.action === 'none' ? 'photos_updated' : detail.action + '+photos';
          result.updated++;
        }
        
      } catch (recordError: any) {
        detail.error = recordError.message;
        result.errors.push(`${record.nome_popular}: ${recordError.message}`);
      }
      
      result.details.push(detail);
    }

    if (!dryRun && result.updated > 0) {
      await supabase.from('sync_logs').insert({
        tipo: 'flora',
        especie_nome: `Batch: ${result.processed} processados`,
        acao: 'sync_batch',
        fotos_encontradas: result.updated,
        status_final: result.success ? 'success' : 'partial',
        detalhes: { processed: result.processed, updated: result.updated, errors: result.errors.length }
      });
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

    console.log(`Starting sync for ${tipo || 'all'}, dryRun: ${dryRun}`);

    const results: SyncResult[] = [];

    if (!tipo || tipo === 'fauna') {
      const faunaResult = await syncFauna(supabase, dryRun);
      results.push(faunaResult);
      console.log(`Fauna: ${faunaResult.processed} processed, ${faunaResult.updated} updated`);
    }

    if (!tipo || tipo === 'flora') {
      const floraResult = await syncFlora(supabase, dryRun);
      results.push(floraResult);
      console.log(`Flora: ${floraResult.processed} processed, ${floraResult.updated} updated`);
    }

    return new Response(
      JSON.stringify({
        success: results.every(r => r.success),
        dryRun,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
