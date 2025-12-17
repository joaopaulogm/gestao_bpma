import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      if (result.canonicalName?.toLowerCase() === scientificName.toLowerCase() ||
          result.scientificName?.toLowerCase().startsWith(scientificName.toLowerCase())) {
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
      .filter(m => m.type === 'StillImage' && m.identifier)
      .map(m => m.identifier)
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
      headers: { 'User-Agent': 'BPMA-Species-Sync/1.0' }
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
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, uint8Array, {
        contentType,
        upsert: true
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { tipo, limit = 3 } = await req.json().catch(() => ({}))
    
    const results: any[] = []
    const processLimit = Math.min(limit, 5) // Max 5 species per run to avoid timeout
    
    // Process fauna
    if (!tipo || tipo === 'fauna') {
      console.log('Processing fauna species without images...')
      
      const { data: faunaSpecies, error: faunaError } = await supabase
        .from('dim_especies_fauna')
        .select('id, nome_cientifico, nome_popular')
        .or('imagens.is.null,imagens.eq.{}')
        .limit(processLimit)
      
      if (faunaError) {
        console.error('Fauna query error:', faunaError)
      } else if (faunaSpecies && faunaSpecies.length > 0) {
        console.log(`Found ${faunaSpecies.length} fauna species without images`)
        
        for (const species of faunaSpecies) {
          if (!species.nome_cientifico) continue
          
          const gbifKey = await searchGBIF(species.nome_cientifico, 'Animalia')
          if (!gbifKey) {
            results.push({ tipo: 'fauna', nome: species.nome_popular, status: 'not_found_gbif' })
            continue
          }
          
          const imageUrls = await getGBIFMedia(gbifKey)
          if (imageUrls.length === 0) {
            results.push({ tipo: 'fauna', nome: species.nome_popular, status: 'no_images_gbif' })
            continue
          }
          
          const slug = slugify(species.nome_popular)
          const uploadedFiles: string[] = []
          
          for (let i = 0; i < imageUrls.length && i < 5; i++) {
            const filename = await downloadAndUploadImage(
              supabase, imageUrls[i], 'imagens-fauna', slug, i
            )
            if (filename) uploadedFiles.push(filename)
          }
          
          if (uploadedFiles.length > 0) {
            // Update dim_especies_fauna
            await supabase
              .from('dim_especies_fauna')
              .update({ 
                imagens: uploadedFiles,
                foto_principal_path: uploadedFiles[0],
                fotos_paths: uploadedFiles,
                foto_status: 'pendente'
              })
              .eq('id', species.id)
            
            // Update fauna table
            await supabase
              .from('fauna')
              .update({ imagens: uploadedFiles })
              .eq('id_dim_especie_fauna', species.id)
            
            results.push({ 
              tipo: 'fauna', 
              nome: species.nome_popular, 
              status: 'success', 
              images: uploadedFiles.length 
            })
          }
        }
      }
    }
    
    // Process flora
    if (!tipo || tipo === 'flora') {
      console.log('Processing flora species without images...')
      
      const { data: floraSpecies, error: floraError } = await supabase
        .from('dim_especies_flora')
        .select('id, "Nome Científico", "Nome Popular"')
        .or('imagens.is.null,imagens.eq.{}')
        .limit(processLimit)
      
      if (floraError) {
        console.error('Flora query error:', floraError)
      } else if (floraSpecies && floraSpecies.length > 0) {
        console.log(`Found ${floraSpecies.length} flora species without images`)
        
        for (const species of floraSpecies) {
          const nomeCientifico = species['Nome Científico']
          const nomePopular = species['Nome Popular']
          
          if (!nomeCientifico) continue
          
          const gbifKey = await searchGBIF(nomeCientifico, 'Plantae')
          if (!gbifKey) {
            results.push({ tipo: 'flora', nome: nomePopular, status: 'not_found_gbif' })
            continue
          }
          
          const imageUrls = await getGBIFMedia(gbifKey)
          if (imageUrls.length === 0) {
            results.push({ tipo: 'flora', nome: nomePopular, status: 'no_images_gbif' })
            continue
          }
          
          const slug = slugify(nomePopular || nomeCientifico)
          const uploadedFiles: string[] = []
          
          for (let i = 0; i < imageUrls.length && i < 5; i++) {
            const filename = await downloadAndUploadImage(
              supabase, imageUrls[i], 'imagens-flora', slug, i
            )
            if (filename) uploadedFiles.push(filename)
          }
          
          if (uploadedFiles.length > 0) {
            // Update dim_especies_flora
            await supabase
              .from('dim_especies_flora')
              .update({ 
                imagens: uploadedFiles,
                foto_principal_path: uploadedFiles[0],
                fotos_paths: uploadedFiles,
                foto_status: 'pendente'
              })
              .eq('id', species.id)
            
            // Update flora table
            await supabase
              .from('flora')
              .update({ imagens: uploadedFiles })
              .eq('id_dim_especie_flora', species.id)
            
            results.push({ 
              tipo: 'flora', 
              nome: nomePopular, 
              status: 'success', 
              images: uploadedFiles.length 
            })
          }
        }
      }
    }
    
    console.log('Auto-images completed:', results)
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Auto-images error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
