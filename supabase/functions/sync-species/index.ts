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

// Validate species via Wikipedia API
async function validateSpeciesWithWikipedia(nomeCientifico: string): Promise<{ valid: boolean; source: string; imageUrl?: string }> {
  try {
    const searchUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeCientifico)}`;
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const data = await response.json();
      if (data.title && data.thumbnail?.source) {
        return {
          valid: true,
          source: `Wikipedia PT: ${data.title}`,
          imageUrl: data.thumbnail.source
        };
      }
    }
    
    // Try English Wikipedia
    const searchUrlEn = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nomeCientifico)}`;
    const responseEn = await fetch(searchUrlEn);
    
    if (responseEn.ok) {
      const dataEn = await responseEn.json();
      if (dataEn.title && dataEn.thumbnail?.source) {
        return {
          valid: true,
          source: `Wikipedia EN: ${dataEn.title}`,
          imageUrl: dataEn.thumbnail.source
        };
      }
    }
    
    return { valid: false, source: 'Não encontrado na Wikipedia' };
  } catch (error) {
    console.error('Wikipedia validation error:', error);
    return { valid: false, source: `Erro: ${error.message}` };
  }
}

// Find matching images in bucket
async function findImagesInBucket(
  supabase: any,
  bucket: string,
  slug: string
): Promise<string[]> {
  try {
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });
    
    if (error) {
      console.error(`Error listing bucket ${bucket}:`, error);
      return [];
    }
    
    if (!files || files.length === 0) return [];
    
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
      .sort();
    
    // Prioritize foto0001, foto0002, foto0003
    const prioritized = matchingFiles.sort((a: string, b: string) => {
      const aHasFoto = a.includes('foto0001') || a.includes('foto0002') || a.includes('foto0003');
      const bHasFoto = b.includes('foto0001') || b.includes('foto0002') || b.includes('foto0003');
      if (aHasFoto && !bHasFoto) return -1;
      if (!aHasFoto && bHasFoto) return 1;
      return a.localeCompare(b);
    });
    
    // Return up to 3 images
    return prioritized.slice(0, 3);
  } catch (error) {
    console.error('Error finding images:', error);
    return [];
  }
}

// Sync fauna records
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
    // Get all fauna records
    const { data: faunaRecords, error: faunaError } = await supabase
      .from('fauna')
      .select('*');
    
    if (faunaError) throw faunaError;
    
    for (const record of faunaRecords || []) {
      result.processed++;
      const detail: any = {
        id: record.id,
        nome_popular: record.nome_popular,
        nome_cientifico: record.nome_cientifico,
        action: 'none'
      };
      
      try {
        const slug = slugify(record.nome_popular || '');
        
        // Check if dimension exists
        let dimId = record.id_dim_especie_fauna;
        
        if (!dimId) {
          // Find or create dimension record
          const { data: existingDim } = await supabase
            .from('dim_especies_fauna')
            .select('id')
            .eq('nome_cientifico', record.nome_cientifico)
            .maybeSingle();
          
          if (existingDim) {
            dimId = existingDim.id;
            detail.action = 'linked';
          } else {
            // Create new dimension record
            const { data: newDim, error: createError } = await supabase
              .from('dim_especies_fauna')
              .insert({
                nome_popular: record.nome_popular,
                nome_cientifico: record.nome_cientifico,
                classe_taxonomica: record.classe_taxonomica || 'Não classificado',
                ordem_taxonomica: record.ordem_taxonomica || 'Não classificado',
                estado_de_conservacao: record.estado_conservacao || 'Não avaliado',
                tipo_de_fauna: record.tipo_fauna || 'Silvestre'
              })
              .select('id')
              .single();
            
            if (createError) throw createError;
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          // Update fauna with FK
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
        
        if (images.length > 0) {
          // Validate with Wikipedia
          const validation = await validateSpeciesWithWikipedia(record.nome_cientifico || record.nome_popular);
          detail.validation = validation;
          
          if (!dryRun) {
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
            
            // Also update imagens array in fauna table
            await supabase
              .from('fauna')
              .update({ imagens: images })
              .eq('id', record.id);
            
            detail.action = detail.action === 'none' ? 'photos_updated' : detail.action + '_photos_updated';
          }
          
          result.updated++;
        }
        
        // Log sync
        if (!dryRun) {
          await supabase.from('sync_logs').insert({
            tipo: 'fauna',
            especie_nome: record.nome_popular,
            especie_id: dimId,
            acao: detail.action,
            fotos_encontradas: images.length,
            status_final: detail.action,
            detalhes: detail
          });
        }
        
      } catch (recordError: any) {
        detail.error = recordError.message;
        result.errors.push(`${record.nome_popular}: ${recordError.message}`);
      }
      
      result.details.push(detail);
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(error.message);
  }
  
  return result;
}

// Sync flora records
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
    // Get all flora records
    const { data: floraRecords, error: floraError } = await supabase
      .from('flora')
      .select('*');
    
    if (floraError) throw floraError;
    
    for (const record of floraRecords || []) {
      result.processed++;
      const detail: any = {
        id: record.id,
        nome_popular: record.nome_popular,
        nome_cientifico: record.nome_cientifico,
        action: 'none'
      };
      
      try {
        const slug = slugify(record.nome_popular || '');
        
        // Check if dimension exists
        let dimId = record.id_dim_especie_flora;
        
        if (!dimId) {
          // Find or create dimension record
          const { data: existingDim } = await supabase
            .from('dim_especies_flora')
            .select('id')
            .eq('Nome Científico', record.nome_cientifico)
            .maybeSingle();
          
          if (existingDim) {
            dimId = existingDim.id;
            detail.action = 'linked';
          } else {
            // Create new dimension record
            const { data: newDim, error: createError } = await supabase
              .from('dim_especies_flora')
              .insert({
                'Nome Popular': record.nome_popular,
                'Nome Científico': record.nome_cientifico,
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
            
            if (createError) throw createError;
            dimId = newDim.id;
            detail.action = 'created';
          }
          
          // Update flora with FK
          if (!dryRun) {
            await supabase
              .from('flora')
              .update({ id_dim_especie_flora: dimId })
              .eq('id', record.id);
          }
        }
        
        // Find images in bucket
        const images = await findImagesInBucket(supabase, 'imagens-flora', slug);
        detail.images_found = images.length;
        
        if (images.length > 0) {
          // Validate with Wikipedia
          const validation = await validateSpeciesWithWikipedia(record.nome_cientifico || record.nome_popular);
          detail.validation = validation;
          
          if (!dryRun) {
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
            
            // Also update imagens array in flora table
            await supabase
              .from('flora')
              .update({ imagens: images })
              .eq('id', record.id);
            
            detail.action = detail.action === 'none' ? 'photos_updated' : detail.action + '_photos_updated';
          }
          
          result.updated++;
        }
        
        // Log sync
        if (!dryRun) {
          await supabase.from('sync_logs').insert({
            tipo: 'flora',
            especie_nome: record.nome_popular,
            especie_id: dimId,
            acao: detail.action,
            fotos_encontradas: images.length,
            status_final: detail.action,
            detalhes: detail
          });
        }
        
      } catch (recordError: any) {
        detail.error = recordError.message;
        result.errors.push(`${record.nome_popular}: ${recordError.message}`);
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
  // Handle CORS preflight
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
      console.log(`Fauna sync complete: ${faunaResult.processed} processed, ${faunaResult.updated} updated`);
    }

    if (!tipo || tipo === 'flora') {
      const floraResult = await syncFlora(supabase, dryRun);
      results.push(floraResult);
      console.log(`Flora sync complete: ${floraResult.processed} processed, ${floraResult.updated} updated`);
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
