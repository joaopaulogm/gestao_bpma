import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function findImages(supabase: any, bucket: string, slug: string): Promise<string[]> {
  try {
    const { data: files } = await supabase.storage.from(bucket).list('', { limit: 50 });
    if (!files?.length) return [];
    
    return files
      .filter((f: any) => f.name.toLowerCase().startsWith(slug))
      .map((f: any) => f.name)
      .sort()
      .slice(0, 3);
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { tipo = 'fauna', dryRun = false, offset = 0 } = await req.json();
    const BATCH_SIZE = 10;

    const results = { processed: 0, updated: 0, errors: [] as string[], hasMore: false };

    if (tipo === 'fauna') {
      const { data: records } = await supabase
        .from('fauna')
        .select('id, nome_popular, id_dim_especie_fauna')
        .range(offset, offset + BATCH_SIZE - 1);

      if (records?.length) {
        results.hasMore = records.length === BATCH_SIZE;
        
        for (const rec of records) {
          results.processed++;
          const slug = slugify(rec.nome_popular || '');
          const images = await findImages(supabase, 'imagens-fauna', slug);
          
          if (images.length > 0 && !dryRun) {
            if (rec.id_dim_especie_fauna) {
              await supabase.from('dim_especies_fauna').update({
                foto_principal_path: images[0],
                fotos_paths: images,
                foto_status: 'pendente'
              }).eq('id', rec.id_dim_especie_fauna);
            }
            await supabase.from('fauna').update({ imagens: images }).eq('id', rec.id);
            results.updated++;
          }
        }
      }
    } else if (tipo === 'flora') {
      const { data: records } = await supabase
        .from('flora')
        .select('id, nome_popular, id_dim_especie_flora')
        .range(offset, offset + BATCH_SIZE - 1);

      if (records?.length) {
        results.hasMore = records.length === BATCH_SIZE;
        
        for (const rec of records) {
          results.processed++;
          const slug = slugify(rec.nome_popular || '');
          const images = await findImages(supabase, 'imagens-flora', slug);
          
          if (images.length > 0 && !dryRun) {
            if (rec.id_dim_especie_flora) {
              await supabase.from('dim_especies_flora').update({
                foto_principal_path: images[0],
                fotos_paths: images,
                foto_status: 'pendente'
              }).eq('id', rec.id_dim_especie_flora);
            }
            await supabase.from('flora').update({ imagens: images }).eq('id', rec.id);
            results.updated++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, dryRun, tipo, offset, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
