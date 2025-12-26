import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome_cientifico, nome_popular, tipo, grupo_taxonomico } = await req.json();

    console.log('Buscando imagem para:', { nome_cientifico, nome_popular, tipo, grupo_taxonomico });

    if (!tipo || (tipo !== 'fauna' && tipo !== 'flora')) {
      return new Response(
        JSON.stringify({ error: 'Tipo deve ser "fauna" ou "flora"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const bucket = tipo === 'fauna' ? 'imagens-fauna' : 'imagens-flora';

    // Generate slug from nome_cientifico or nome_popular
    const slugify = (text: string): string => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // Try nome_cientifico first, then nome_popular
    const searchTerms: string[] = [];
    if (nome_cientifico) {
      searchTerms.push(slugify(nome_cientifico));
      // Also try genus only (first word)
      const genus = nome_cientifico.split(' ')[0];
      if (genus) searchTerms.push(slugify(genus));
    }
    if (nome_popular) {
      searchTerms.push(slugify(nome_popular));
    }

    console.log('Termos de busca:', searchTerms);

    // Search bucket for matching images
    let foundImages: string[] = [];

    for (const searchTerm of searchTerms) {
      if (!searchTerm || searchTerm.length < 2) continue;

      // List files in bucket that start with the search term
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list('', {
          limit: 100,
          search: searchTerm
        });

      if (listError) {
        console.error('Erro ao listar bucket:', listError);
        continue;
      }

      if (files && files.length > 0) {
        // Filter files that match the pattern
        const matchingFiles = files
          .filter(file => {
            const fileName = file.name.toLowerCase();
            return fileName.startsWith(searchTerm) && 
                   (fileName.endsWith('.webp') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png'));
          })
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(file => file.name);

        if (matchingFiles.length > 0) {
          foundImages = matchingFiles;
          console.log('Imagens encontradas para', searchTerm, ':', foundImages);
          break;
        }
      }
    }

    // If no images found in bucket, return null
    if (foundImages.length === 0) {
      console.log('Nenhuma imagem encontrada no bucket');
      return new Response(
        JSON.stringify({ 
          success: false, 
          url: null, 
          urls: [],
          message: 'Nenhuma imagem encontrada' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build public URLs
    const baseUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}`;
    const urls = foundImages.slice(0, 6).map(filename => `${baseUrl}/${filename}`);
    const primaryUrl = urls[0];

    console.log('URLs geradas:', urls);

    return new Response(
      JSON.stringify({
        success: true,
        url: primaryUrl,
        urls: urls,
        filenames: foundImages.slice(0, 6),
        bucket: bucket,
        tipo: tipo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função buscar-imagens-especies:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno',
        success: false,
        url: null,
        urls: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
