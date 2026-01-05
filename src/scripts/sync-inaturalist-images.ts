import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir, rm, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SUPABASE_URL = "https://oiwwptnqaunsyhpkwbrz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERRO: A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está definida!');
  console.error('Por favor, defina a variável antes de executar o script:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY="sua-chave-aqui"');
  process.exit(1);
}

const FAUNA_BUCKET = "imagens-fauna";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface SpeciesData {
  nome_cientifico: string;
  nome_popular: string;
  iNaturalistUrl: string;
  classe_taxonomica?: string;
  ordem_taxonomica?: string;
  estado_de_conservacao?: string;
  tipo_de_fauna?: string;
}

// Lista de espécies para processar
const especies: SpeciesData[] = [
  {
    nome_cientifico: "Bothrops moojeni",
    nome_popular: "Jararaca Caiçaca",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/30784-Bothrops-moojeni",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Bothrops marmoratus",
    nome_popular: "Jararaca-Pintada",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/95917-Bothrops-marmoratus",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Bothrops itapetiningae",
    nome_popular: "Cotiarinha",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/539416-Bothrops-itapetiningae",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Bothrops pauloensis",
    nome_popular: "Boca-de-Sapo",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/539420-Bothrops-pauloensis",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Micrurus carvalhoi",
    nome_popular: "Cobra Coral de Faixas Brasileira",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/539417-Micrurus-carvalhoi", // Usando taxa ao invés de observação
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Apostolepis assimilis",
    nome_popular: "Coral Falsa",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/28322-Apostolepis-assimilis",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Apostolepis albicollaris",
    nome_popular: "Coral Falsa",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/28324-Apostolepis-albicollaris",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Chironius exoletus",
    nome_popular: "Caninana-Verde",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/97536-Chironius-exoletus",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  },
  {
    nome_cientifico: "Oxyrhopus petolarius",
    nome_popular: "Coral Falsa",
    iNaturalistUrl: "https://www.inaturalist.org/taxa/146320-Oxyrhopus-petolarius",
    classe_taxonomica: "RÉPTEIS",
    ordem_taxonomica: "Squamata",
    estado_de_conservacao: "Pouco Preocupante",
    tipo_de_fauna: "Silvestre"
  }
];

// Função para extrair taxon_id da URL do iNaturalist
function extractTaxonId(url: string): string | null {
  // Para URLs de taxa: /taxa/30784-Bothrops-moojeni
  const taxaMatch = url.match(/\/taxa\/(\d+)-/);
  if (taxaMatch) return taxaMatch[1];
  
  // Para URLs de observação, precisamos buscar o taxon_id da observação
  const obsMatch = url.match(/\/observations\/(\d+)/);
  if (obsMatch) return obsMatch[1];
  
  return null;
}

// Função para buscar imagens do iNaturalist via API
async function fetchiNaturalistImages(taxonId: string, limit: number = 6): Promise<string[]> {
  try {
    // API do iNaturalist para buscar observações com fotos
    const apiUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&per_page=${limit}&photos=true&quality_grade=research,needs_id&order=desc&order_by=observed_on`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'BPMA-Species-Sync/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar imagens: ${response.status}`);
      return [];
    }
    
    const data = await response.json() as any;
    const imageUrls: string[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      for (const observation of data.results) {
        if (observation.photos && Array.isArray(observation.photos)) {
          for (const photo of observation.photos) {
            // Usar a URL de tamanho grande (ou original se disponível)
            let imageUrl = photo.url;
            if (imageUrl) {
              // Tentar obter a versão large da imagem
              imageUrl = imageUrl.replace(/square|small|medium/, 'large');
              // Se não houver large, usar original
              if (!imageUrl.includes('large') && photo.original_url) {
                imageUrl = photo.original_url;
              }
              if (imageUrl && !imageUrls.includes(imageUrl)) {
                imageUrls.push(imageUrl);
                if (imageUrls.length >= limit) break;
              }
            }
          }
        }
        if (imageUrls.length >= limit) break;
      }
    }
    
    return imageUrls.slice(0, limit);
  } catch (error) {
    console.error(`Erro ao buscar imagens do iNaturalist:`, error);
    return [];
  }
}

// Função para buscar taxon_id de uma observação
async function getTaxonIdFromObservation(observationId: string): Promise<string | null> {
  try {
    const apiUrl = `https://api.inaturalist.org/v1/observations/${observationId}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json() as any;
    return data.results?.[0]?.taxon?.id?.toString() || null;
  } catch (error) {
    console.error(`Erro ao buscar taxon_id da observação:`, error);
    return null;
  }
}

// Função para baixar e converter imagem para webp
async function downloadAndConvertToWebp(imageUrl: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'BPMA-Species-Sync/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`Erro ao baixar imagem: ${response.status}`);
      return false;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Tentar usar sharp se disponível, senão salvar como está
    try {
      const sharp = (await import('sharp')).default;
      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(outputPath);
    } catch (sharpError) {
      // Se sharp não estiver disponível, tentar salvar como está
      // Mas primeiro verificar se já é webp
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('webp')) {
        await writeFile(outputPath, buffer);
      } else {
        // Tentar converter usando canvas ou salvar como jpg
        console.warn('Sharp não disponível, salvando imagem original');
        await writeFile(outputPath, buffer);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao converter imagem:`, error);
    return false;
  }
}

// Função para fazer upload para Supabase Storage
async function uploadToSupabaseStorage(filePath: string, fileName: string): Promise<string | null> {
  try {
    const fileBuffer = await readFile(filePath);
    
    const { data, error } = await supabase.storage
      .from(FAUNA_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });
    
    if (error) {
      console.error(`Erro ao fazer upload:`, error);
      return null;
    }
    
    return data.path;
  } catch (error) {
    console.error(`Erro ao fazer upload:`, error);
    return null;
  }
}

// Função para buscar nomes populares do iNaturalist
async function fetchCommonNames(taxonId: string): Promise<string[]> {
  try {
    const apiUrl = `https://api.inaturalist.org/v1/taxa/${taxonId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'BPMA-Species-Sync/1.0'
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json() as any;
    const names: string[] = [];
    
    if (data.results?.[0]?.names) {
      for (const name of data.results[0].names) {
        if (name.locale === 'pt' || name.locale === 'pt-BR') {
          if (name.name && !names.includes(name.name)) {
            names.push(name.name);
          }
        }
      }
    }
    
    return names;
  } catch (error) {
    console.error(`Erro ao buscar nomes populares:`, error);
    return [];
  }
}

// Função para criar slug do nome
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Função principal para processar uma espécie
async function processSpecies(species: SpeciesData) {
  console.log(`\nProcessando: ${species.nome_popular} (${species.nome_cientifico})`);
  
  try {
    // Extrair taxon_id
    let taxonId = extractTaxonId(species.iNaturalistUrl);
    
    // Se for uma observação, buscar o taxon_id
    if (species.iNaturalistUrl.includes('/observations/')) {
      const obsId = species.iNaturalistUrl.match(/\/observations\/(\d+)/)?.[1];
      if (obsId) {
        taxonId = await getTaxonIdFromObservation(obsId);
      }
    }
    
    if (!taxonId) {
      console.error(`Não foi possível extrair taxon_id de ${species.iNaturalistUrl}`);
      return;
    }
    
    console.log(`Taxon ID: ${taxonId}`);
    
    // Buscar imagens
    console.log('Buscando imagens...');
    const imageUrls = await fetchiNaturalistImages(taxonId, 6);
    
    if (imageUrls.length === 0) {
      console.log('Nenhuma imagem encontrada');
      return;
    }
    
    console.log(`Encontradas ${imageUrls.length} imagens`);
    
    // Criar diretório temporário
    const tempDir = path.join(process.cwd(), 'temp_images');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    // Baixar, converter e fazer upload das imagens
    const uploadedFiles: string[] = [];
    const slug = createSlug(species.nome_popular || species.nome_cientifico);
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const tempPath = path.join(tempDir, `${slug}_${i + 1}.webp`);
      
      console.log(`Processando imagem ${i + 1}/${imageUrls.length}...`);
      
      const success = await downloadAndConvertToWebp(imageUrl, tempPath);
      if (!success) continue;
      
      const fileName = `${slug}_foto${String(i + 1).padStart(4, '0')}.webp`;
      const uploadedPath = await uploadToSupabaseStorage(tempPath, fileName);
      
      if (uploadedPath) {
        uploadedFiles.push(fileName);
        console.log(`✓ Upload concluído: ${fileName}`);
      }
      
      // Limpar arquivo temporário
      await rm(tempPath).catch(() => {});
    }
    
    // Limpar diretório temporário
    await rm(tempDir, { recursive: true }).catch(() => {});
    
    if (uploadedFiles.length === 0) {
      console.log('Nenhuma imagem foi enviada com sucesso');
      return;
    }
    
    // Buscar nomes populares
    console.log('Buscando nomes populares...');
    const commonNames = await fetchCommonNames(taxonId);
    const allNames = [species.nome_popular, ...commonNames].filter(Boolean) as string[];
    const uniqueNames = Array.from(new Set(allNames));
    
    // Buscar ou criar espécie na tabela
    const { data: existing } = await supabase
      .from('dim_especies_fauna')
      .select('id, imagens_paths, nomes_populares')
      .eq('nome_cientifico', species.nome_cientifico)
      .maybeSingle();
    
    const updateData: any = {
      nome_popular: species.nome_popular,
      nome_cientifico: species.nome_cientifico,
      nome_cientifico_slug: createSlug(species.nome_cientifico),
      imagens_paths: uploadedFiles,
      imagens_qtd: uploadedFiles.length,
      imagens_status: 'processado',
      imagens_updated_at: new Date().toISOString(),
      nomes_populares: uniqueNames,
      classe_taxonomica: species.classe_taxonomica || null,
      ordem_taxonomica: species.ordem_taxonomica || null,
      estado_de_conservacao: species.estado_de_conservacao || null,
      tipo_de_fauna: species.tipo_de_fauna || null
    };
    
    if (existing) {
      // Atualizar espécie existente
      const existingImages = Array.isArray(existing.imagens_paths) ? existing.imagens_paths : [];
      const mergedImages = [...new Set([...existingImages, ...uploadedFiles])];
      updateData.imagens_paths = mergedImages;
      updateData.imagens_qtd = mergedImages.length;
      
      // Mesclar nomes populares
      const existingNames = Array.isArray(existing.nomes_populares) ? existing.nomes_populares : [];
      const mergedNames = [...new Set([...existingNames, ...uniqueNames])];
      updateData.nomes_populares = mergedNames;
      
      const { error } = await supabase
        .from('dim_especies_fauna')
        .update(updateData)
        .eq('id', existing.id);
      
      if (error) throw error;
      console.log(`✓ Espécie atualizada: ${species.nome_popular}`);
    } else {
      // Criar nova espécie
      const { error } = await supabase
        .from('dim_especies_fauna')
        .insert([{
          id: randomUUID(),
          ...updateData
        }]);
      
      if (error) throw error;
      console.log(`✓ Nova espécie criada: ${species.nome_popular}`);
    }
    
  } catch (error) {
    console.error(`Erro ao processar espécie:`, error);
  }
}

// Função para remover Bothrops jararaca
async function removeBothropsJararaca() {
  console.log('\nRemovendo Bothrops jararaca...');
  
  const { error } = await supabase
    .from('dim_especies_fauna')
    .delete()
    .eq('nome_cientifico', 'Bothrops jararaca');
  
  if (error) {
    console.error('Erro ao remover espécie:', error);
  } else {
    console.log('✓ Bothrops jararaca removida com sucesso');
  }
}

// Função para atualizar nomes populares de todas as espécies
async function updateAllCommonNames() {
  console.log('\nAtualizando nomes populares de todas as espécies...');
  
  const { data: allSpecies, error: fetchError } = await supabase
    .from('dim_especies_fauna')
    .select('id, nome_cientifico, nomes_populares');
  
  if (fetchError) {
    console.error('Erro ao buscar espécies:', fetchError);
    return;
  }
  
  if (!allSpecies || allSpecies.length === 0) {
    console.log('Nenhuma espécie encontrada');
    return;
  }
  
  console.log(`Encontradas ${allSpecies.length} espécies`);
  
  for (const species of allSpecies) {
    if (!species.nome_cientifico) continue;
    
    try {
      // Buscar taxon_id pelo nome científico na API do iNaturalist
      const searchUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(species.nome_cientifico)}&per_page=1`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'BPMA-Species-Sync/1.0'
        }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json() as any;
      const taxonId = data.results?.[0]?.id;
      
      if (!taxonId) {
        console.log(`Taxon não encontrado para: ${species.nome_cientifico}`);
        continue;
      }
      
      const commonNames = await fetchCommonNames(taxonId.toString());
      
      if (commonNames.length > 0) {
        const existingNames = Array.isArray(species.nomes_populares) ? species.nomes_populares : [];
        const mergedNames = [...new Set([...existingNames, ...commonNames])];
        
        await supabase
          .from('dim_especies_fauna')
          .update({ nomes_populares: mergedNames })
          .eq('id', species.id);
        
        console.log(`✓ ${species.nome_cientifico}: ${commonNames.length} nomes adicionados`);
      }
      
      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Erro ao processar ${species.nome_cientifico}:`, error);
    }
  }
  
  console.log('✓ Atualização de nomes populares concluída');
}

// Função principal
async function main() {
  console.log('Iniciando sincronização com iNaturalist...\n');
  
  // Processar novas espécies
  for (const species of especies) {
    await processSpecies(species);
    // Delay entre requisições
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Remover Bothrops jararaca
  await removeBothropsJararaca();
  
  // Atualizar nomes populares de todas as espécies
  await updateAllCommonNames();
  
  console.log('\n✓ Sincronização concluída!');
}

// Executar
main().catch(console.error);

