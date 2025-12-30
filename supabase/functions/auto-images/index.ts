import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// Restrict CORS to known origins for security
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    'https://lovable.dev',
    'https://preview--gestao-bpma.lovable.app',
    'https://gestao-bpma.lovable.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (requestOrigin && allowedOrigins.some(origin => requestOrigin.startsWith(origin.replace(/\/$/, '')))) {
    return requestOrigin;
  }
  
  // Fallback for Lovable preview domains
  if (requestOrigin && requestOrigin.includes('.lovable.app')) {
    return requestOrigin;
  }
  
  return allowedOrigins[0];
};

interface GBIFSearchResult {
  results: Array<{
    key: number
    scientificName: string
    canonicalName: string
  }>
}

interface GBIFMedia {
  results: Array<{
    identifier: string
    type: string
    format: string
  }>
}

async function searchGBIF(scientificName: string, kingdom: 'Animalia' | 'Plantae'): Promise<number | null> {
  const kingdomKey = kingdom === 'Animalia' ? 1 : 6
  const url = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(scientificName)}&rank=SPECIES&highertaxonKey=${kingdomKey}&limit=5`

  console.log(`Searching GBIF for: ${scientificName} in kingdom ${kingdom}`)

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return null

    const data: GBIFSearchResult = await response.json()

    // Find exact or close match
    for (const result of data.results) {
      if (
        result.canonicalName?.toLowerCase() === scientificName.toLowerCase() ||
        result.scientificName?.toLowerCase().startsWith(scientificName.toLowerCase())
      ) {
        console.log(`Found GBIF key: ${result.key} for ${scientificName}`)
        return result.key
      }
    }

    // Return first result if no exact match
    if (data.results.length > 0) {
      console.log(`Using first GBIF result: ${data.results[0].key}`)
      return data.results[0].key
    }

    return null
  } catch (error) {
    console.error(`GBIF search error for ${scientificName}:`, error)
    return null
  }
}

async function getGBIFMedia(speciesKey: number): Promise<string[]> {
  const url = `https://api.gbif.org/v1/species/${speciesKey}/media?limit=10`

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) return []

    const data: GBIFMedia = await response.json()

    // Filter for images only
    const imageUrls = data.results
      .filter((m) => m.type === 'StillImage' && m.identifier)
      .map((m) => m.identifier)
      .slice(0, 5)

    console.log(`Found ${imageUrls.length} images for species key ${speciesKey}`)
    return imageUrls
  } catch (error) {
    console.error(`GBIF media error:`, error)
    return []
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function downloadAndUploadImage(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string,
  bucket: string,
  slug: string,
  index: number
): Promise<string | null> {
  try {
    console.log(`Downloading image ${index + 1}: ${imageUrl}`)

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'BPMA-Species-Sync/1.0' },
    })

    if (!response.ok) {
      console.error(`Failed to download: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Determine extension
    let extension = 'jpg'
    if (contentType.includes('png')) extension = 'png'
    else if (contentType.includes('webp')) extension = 'webp'
    else if (contentType.includes('gif')) extension = 'gif'

    const filename = `${slug}_foto${String(index + 1).padStart(4, '0')}.${extension}`

    console.log(`Uploading to ${bucket}/${filename}`)

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filename, uint8Array, {
      contentType,
      upsert: true,
    })

    if (uploadError) {
      console.error(`Upload error:`, uploadError)
      return null
    }

    console.log(`Successfully uploaded: ${filename}`)
    return filename
  } catch (error) {
    console.error(`Download/upload error:`, error)
    return null
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // First verify the user with anon key
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Use service role for database operations (needed to update dimension tables and storage)
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { tipo, limit = 3 } = await req.json().catch(() => ({}))

    const results: any[] = []
    const processLimit = Math.min(Number(limit) || 3, 10) // safety cap

    // dim_especies_* uses jsonb default '[]', so we must check for [] as well
    const hasNoImagesFilter = 'imagens.is.null,imagens.eq.[],imagens.eq.{}'

    const processSpecies = async (
      tipoLocal: 'fauna' | 'flora',
      table: 'dim_especies_fauna' | 'dim_especies_flora',
      bucket: 'imagens-fauna' | 'imagens-flora',
      kingdom: 'Animalia' | 'Plantae'
    ) => {
      console.log(`Processing ${tipoLocal} species without images...`)

      // Query species without images AND that haven't been marked as failed/not found
      const { data: speciesList, error } = await supabase
        .from(table)
        .select('id, nome_cientifico, nome_popular, imagens_status')
        .or(hasNoImagesFilter)
        .or('imagens_status.is.null,imagens_status.eq.pendente')
        .not('imagens_status', 'in', '("nao_encontrado","erro")')
        .limit(processLimit)

      if (error) {
        console.error(`${tipoLocal} query error:`, error)
        return
      }

      if (!speciesList || speciesList.length === 0) {
        console.log(`No ${tipoLocal} species found without images (limit=${processLimit}).`)
        return
      }

      console.log(`Found ${speciesList.length} ${tipoLocal} species without images`)

      for (const species of speciesList as Array<{ id: string; nome_cientifico: string | null; nome_popular: string | null }>) {
        const scientificName = species.nome_cientifico
        const popularName = species.nome_popular
        const displayName = popularName || scientificName || '(sem nome)'

        if (!scientificName) {
          results.push({ tipo: tipoLocal, nome: displayName, status: 'missing_scientific_name' })
          continue
        }

        const gbifKey = await searchGBIF(scientificName, kingdom)
        if (!gbifKey) {
          // Mark as not found so we don't reprocess
          await supabase.from(table).update({ imagens_status: 'nao_encontrado', imagens_erro: 'Espécie não encontrada no GBIF' }).eq('id', species.id)
          results.push({ tipo: tipoLocal, nome: displayName, status: 'not_found_gbif' })
          continue
        }

        const imageUrls = await getGBIFMedia(gbifKey)
        if (imageUrls.length === 0) {
          // Mark as not found so we don't reprocess
          await supabase.from(table).update({ imagens_status: 'nao_encontrado', imagens_erro: 'Nenhuma imagem disponível no GBIF' }).eq('id', species.id)
          results.push({ tipo: tipoLocal, nome: displayName, status: 'no_images_gbif' })
          continue
        }

        const slugBase = popularName || scientificName
        const slug = slugify(slugBase)

        const uploadedFiles: string[] = []
        for (let i = 0; i < imageUrls.length && i < 5; i++) {
          const filename = await downloadAndUploadImage(supabase, imageUrls[i], bucket, slug, i)
          if (filename) uploadedFiles.push(filename)
        }

        if (uploadedFiles.length === 0) {
          results.push({ tipo: tipoLocal, nome: displayName, status: 'upload_failed' })
          continue
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({
            imagens: uploadedFiles,
            imagens_paths: uploadedFiles,
            foto_principal_path: uploadedFiles[0],
            fotos_paths: uploadedFiles,
            foto_status: 'pendente',
          })
          .eq('id', species.id)

        if (updateError) {
          console.error(`Update error (${table}):`, updateError)
          results.push({ tipo: tipoLocal, nome: displayName, status: 'db_update_failed', error: updateError.message })
          continue
        }

        results.push({ tipo: tipoLocal, nome: displayName, status: 'success', images: uploadedFiles.length })
      }
    }

    if (!tipo || tipo === 'fauna') {
      await processSpecies('fauna', 'dim_especies_fauna', 'imagens-fauna', 'Animalia')
    }

    if (!tipo || tipo === 'flora') {
      await processSpecies('flora', 'dim_especies_flora', 'imagens-flora', 'Plantae')
    }

    console.log('Auto-images completed:', results)

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Auto-images error:', error)
    const origin = req.headers.get('origin');
    const corsHeaders = {
      'Access-Control-Allow-Origin': getAllowedOrigin(origin),
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})