import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Folder ID da pasta ORDENS DE SERVIÇOS no Google Drive
const OS_FOLDER_ID = '1l_pC4X_BnsqKDh4XUkE5jeh9FI9lgHKc';

// Mapeamento de Regiões Administrativas
const REGIOES_MAP: Record<string, string> = {
  'água quente': '333c788c-5ec8-4747-8283-a9ae68966ccc',
  'águas claras': '9692f96d-23bb-44f1-a514-af81e325c7cb',
  'arapoanga': 'c434efdb-06f7-439d-9426-6daae2c4ca79',
  'arniqueira': '300955b4-cbb1-4661-8046-2342f065c310',
  'brazlândia': '21a4f62c-3e76-4138-a6f9-4bf0a7ea7603',
  'candangolândia': 'ddf08559-7658-4b56-acd4-71cd5280a3c4',
  'ceilândia': '2d70cdf1-6e05-4d5a-9cdd-86076cd16347',
  'cruzeiro': '8bb5d701-5f9e-47e0-b8c8-df50011ee3a1',
  'fercal': 'cc9b0ec4-c52c-4775-9ab6-9a433a6ca7ff',
  'gama': '2e331c24-e7b6-4699-8d73-8f0b0ed8ee86',
  'guará': '2ee14267-7e93-4adc-a33a-50aefb077224',
  'itapoã': '1c66c58f-02b2-4fc9-a080-866b68bdb199',
  'jardim botânico': 'eb7011ba-925b-42dc-ba9c-9e7cdd7ce9be',
  'lago norte': '6be1a26e-ef06-4ce6-bbd2-41c358429d99',
  'lago sul': '6c463a5e-347a-4f94-9f62-5582c8a73735',
  'núcleo bandeirante': '11708d1b-1991-44d0-861e-05e00c90be4c',
  'paranoá': '7625d021-f268-4227-999b-0c0618a7a381',
  'park way': '85829d65-e411-4c1d-93c3-5141dc2a2702',
  'planaltina': '0a8cc0cc-e2f5-4e65-a47c-f2ea49c93cf2',
  'plano piloto': 'fb8c8326-365a-4f20-ad0f-3fd94c319161',
  'recanto das emas': '541db810-c21e-42b6-a5bb-4217cea0d8b7',
  'riacho fundo ii': 'dbf37dfd-d082-450b-8572-43d56f6a9382',
  'riacho fundo': '1c42ccbd-399c-4aa2-aac6-cc312dca8356',
  'samambaia': '18a3534e-63c3-4232-8fc3-6d1b20a5e306',
  'santa maria': '67c25c84-b67a-44ff-97b4-67e3def31431',
  'são sebastião': 'ce841d6f-0155-4ba8-b256-ed3aee8cc11a',
  'scia': '8fb218ca-d6c6-4486-b394-816a2db09d9c',
  'estrutural': '8fb218ca-d6c6-4486-b394-816a2db09d9c',
  'sia': '855d7557-136f-4ea4-81dc-682ad23f39d6',
  'sobradinho ii': '9b64e329-feac-4ee6-91e3-a7a20bf08f3b',
  'sobradinho': 'c4d617fc-063c-4560-a2a0-3c33a984e771',
  'sol nascente': '34393f28-189e-4038-8742-b71928ff9ff9',
  'pôr do sol': '34393f28-189e-4038-8742-b71928ff9ff9',
  'sudoeste': '169ec0d4-0a9c-4ab6-8fa4-802af66bfc98',
  'octogonal': '169ec0d4-0a9c-4ab6-8fa4-802af66bfc98',
  'taguatinga': '2d764ee1-f0bf-4a2e-aa0d-c95f440fe73e',
  'varjão': '1bba653e-bb80-4b92-9f5d-3beeb6f02d8b',
  'vicente pires': '3f35cd61-0ec0-4e6a-ba1d-89efbf12f557',
};

// Schema para extração de dados da Ordem de Serviço
const osExtractionSchema = {
  type: "object",
  properties: {
    numero_os: { 
      type: "string", 
      description: "Número completo da OS no formato AAAA.XXXXX.NNNNNN (ex: 2026.00707.0000012)" 
    },
    numero_evento: { 
      type: "string", 
      description: "Número do evento no formato XXX.XXXXX.AAAA (ex: 190.31212.2026)" 
    },
    referencia_sei: { 
      type: "string", 
      description: "Referência SEI (ex: 00054-00007856/2026-65)" 
    },
    data_evento: { 
      type: "string", 
      description: "Data do evento no formato YYYY-MM-DD" 
    },
    horario_inicio: { 
      type: "string", 
      description: "Horário de início no formato HH:MM" 
    },
    horario_termino: { 
      type: "string", 
      description: "Horário de término no formato HH:MM" 
    },
    local_evento: { 
      type: "string", 
      description: "Local/endereço do evento" 
    },
    regiao_administrativa: { 
      type: "string", 
      description: "Nome da Região Administrativa" 
    },
    tipo_servico: { 
      type: "string", 
      description: "Tipo do serviço (POLICIAMENTO ORDINÁRIO, OPERAÇÃO ESPECIAL, etc.)" 
    },
    uniforme_equipamento: { 
      type: "string", 
      description: "Uniforme e equipamento requeridos" 
    },
    missao_policiamento: { 
      type: "string", 
      description: "Descrição da missão de policiamento" 
    },
    situacao: { 
      type: "string", 
      enum: ["ATIVA", "CONCLUÍDA", "CANCELADA"],
      description: "Situação atual da OS" 
    },
    prescricoes_s1: { 
      type: "string", 
      description: "Prescrições da 1ª Seção (S1 - Pessoal)" 
    },
    prescricoes_s2: { 
      type: "string", 
      description: "Prescrições da 2ª Seção (S2 - Inteligência)" 
    },
    prescricoes_s3: { 
      type: "string", 
      description: "Prescrições da 3ª Seção (S3 - Operações)" 
    },
    prescricoes_s4: { 
      type: "string", 
      description: "Prescrições da 4ª Seção (S4 - Logística)" 
    },
    prescricoes_demais: { 
      type: "string", 
      description: "Prescrições das demais seções ou gerais" 
    },
    comandante: {
      type: "object",
      properties: {
        nome: { type: "string" },
        matricula: { type: "string" },
        posto_graduacao: { type: "string" }
      },
      description: "Comandante responsável pela OS"
    },
    chefe_operacoes: {
      type: "object",
      properties: {
        nome: { type: "string" },
        matricula: { type: "string" },
        posto_graduacao: { type: "string" }
      },
      description: "Chefe de Operações"
    },
    efetivo: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          matricula: { type: "string" },
          posto_graduacao: { type: "string" },
          funcao: { type: "string" },
          viatura: { type: "string" }
        }
      },
      description: "Lista do efetivo designado para a OS"
    },
    confidence_score: { 
      type: "number", 
      description: "Nível de confiança na extração (0-100)" 
    }
  },
  required: ["numero_os", "data_evento", "confidence_score"]
};

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth credentials');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh access token: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Lista todas as subpastas recursivamente
async function listFoldersRecursively(accessToken: string, folderId: string, path: string = ''): Promise<{ id: string; name: string; path: string }[]> {
  const folders: { id: string; name: string; path: string }[] = [];
  
  const query = `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=100`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error(`Failed to list folders in ${folderId}: ${await response.text()}`);
    return folders;
  }

  const data = await response.json();
  
  for (const folder of data.files || []) {
    const newPath = path ? `${path}/${folder.name}` : folder.name;
    folders.push({ id: folder.id, name: folder.name, path: newPath });
    
    // Recursivamente buscar subpastas
    const subFolders = await listFoldersRecursively(accessToken, folder.id, newPath);
    folders.push(...subFolders);
  }

  return folders;
}

// Lista PDFs em uma pasta específica
async function listPDFsInFolder(accessToken: string, folderId: string): Promise<any[]> {
  const query = `'${folderId}' in parents and mimeType = 'application/pdf' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,modifiedTime)&pageSize=100`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list files: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

async function downloadPDFAsBase64(fileId: string, accessToken: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to base64 in chunks to avoid stack overflow
  let binary = '';
  const chunkSize = 32768; // 32KB chunks
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

async function extractOSData(pdfBase64: string, fileName: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const systemPrompt = `Você é um especialista em análise de Ordens de Serviço (OS) da Polícia Militar do Distrito Federal - BPMA.

OBJETIVO: Extrair TODOS os dados estruturados da Ordem de Serviço para cadastro automático no sistema.

ESTRUTURA DA OS:
1. CABEÇALHO:
   - Número da OS (ex: 2026.00707.0000012)
   - Número do Evento (ex: 190.31212.2026)
   - Data, Horário de início e término
   - Local do evento
   - Referência SEI

2. CLASSIFICAÇÃO:
   - Tipo do serviço (POLICIAMENTO ORDINÁRIO, OPERAÇÃO ESPECIAL, etc.)
   - Uniforme/Equipamento
   - Missão do Policiamento
   - Situação (ATIVA, CONCLUÍDA, CANCELADA)

3. PRESCRIÇÕES POR SEÇÃO:
   - S1 (Pessoal)
   - S2 (Inteligência)
   - S3 (Operações)
   - S4 (Logística)
   - Demais seções

4. RESPONSÁVEIS:
   - Comandante (nome, matrícula, posto)
   - Chefe de Operações (nome, matrícula, posto)

5. EFETIVO DESIGNADO:
   - Para cada policial: nome, matrícula, posto/graduação, função, viatura

REGRAS CRÍTICAS:
1. NÚMERO DA OS: Formato AAAA.XXXXX.NNNNNN
2. DATA: Converter para formato ISO YYYY-MM-DD
3. HORÁRIO: Formato HH:MM
4. MATRÍCULA: Manter formato original (pode ter X no final)
5. EFETIVO: Extrair todos os policiais mencionados com suas funções

IMPORTANTE: Confie na sua análise e retorne os dados encontrados. Se algum campo não estiver presente, omita-o.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            { type: "text", text: `Analise esta Ordem de Serviço (${fileName}) e extraia todos os dados estruturados:` },
            { 
              type: "image_url", 
              image_url: { url: `data:application/pdf;base64,${pdfBase64}` } 
            }
          ]
        }
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_os_data",
          description: "Extrai dados estruturados da Ordem de Serviço",
          parameters: osExtractionSchema
        }
      }],
      tool_choice: { type: "function", function: { name: "extract_os_data" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI error:', errorText);
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error('No tool call in AI response');
  }

  return JSON.parse(toolCall.function.arguments);
}

function findRegiaoId(regiao: string | undefined): string | null {
  if (!regiao) return null;
  const normalized = regiao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, id] of Object.entries(REGIOES_MAP)) {
    const keyNormalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
      return id;
    }
  }
  return null;
}

async function findEfetivoId(supabase: any, matricula: string): Promise<string | null> {
  if (!matricula) return null;
  const cleanMatricula = matricula.replace(/[^0-9X]/gi, '');
  const { data } = await supabase
    .from('dim_efetivo')
    .select('id')
    .eq('matricula', cleanMatricula)
    .limit(1);
  
  return data?.[0]?.id || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';
    const limit = body.limit || 5;
    const year = body.year || new Date().getFullYear();
    const month = body.month; // opcional

    console.log(`[process-os-folder] Action: ${action}, Limit: ${limit}, Year: ${year}, Month: ${month || 'all'}`);

    // Get Google Drive access token
    const accessToken = await getAccessToken();
    console.log('[process-os-folder] Got Google access token');

    // Buscar estrutura de pastas (ANO/MÊS)
    const allFolders = await listFoldersRecursively(accessToken, OS_FOLDER_ID);
    console.log(`[process-os-folder] Found ${allFolders.length} folders`);

    // Filtrar pastas pelo ano e mês (se especificado)
    const targetFolders = allFolders.filter(f => {
      const pathParts = f.path.split('/');
      const folderYear = pathParts[0];
      const folderMonth = pathParts[1];
      
      if (folderYear !== year.toString()) return false;
      if (month && folderMonth !== month) return false;
      
      // Apenas pastas de mês (ex: JANEIRO, FEVEREIRO)
      return pathParts.length >= 2;
    });

    console.log(`[process-os-folder] Target folders: ${targetFolders.map(f => f.path).join(', ')}`);

    // Coletar todos os PDFs das pastas filtradas
    let allFiles: { file: any; folderPath: string }[] = [];
    for (const folder of targetFolders) {
      const pdfs = await listPDFsInFolder(accessToken, folder.id);
      for (const pdf of pdfs) {
        allFiles.push({ file: pdf, folderPath: folder.path });
      }
    }
    console.log(`[process-os-folder] Found ${allFiles.length} PDF files total`);

    // Get already processed files
    const { data: processedFiles } = await supabase
      .from('os_processadas')
      .select('drive_file_id, numero_os');

    const processedIds = new Set(processedFiles?.map(r => r.drive_file_id) || []);
    const processedNumbers = new Set(processedFiles?.map(r => r.numero_os) || []);

    // Filter unprocessed files
    const unprocessedFiles = allFiles.filter(f => !processedIds.has(f.file.id));
    console.log(`[process-os-folder] ${unprocessedFiles.length} files not yet processed`);

    if (action === 'list') {
      return new Response(JSON.stringify({
        success: true,
        total_files: allFiles.length,
        processed_count: processedIds.size,
        pending_count: unprocessedFiles.length,
        folders: targetFolders.map(f => f.path),
        pending_files: unprocessedFiles.slice(0, 20).map(f => ({ 
          id: f.file.id, 
          name: f.file.name,
          folder: f.folderPath 
        }))
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Process files
    const results: any[] = [];
    const filesToProcess = unprocessedFiles.slice(0, limit);

    for (const { file, folderPath } of filesToProcess) {
      console.log(`[process-os-folder] Processing: ${file.name} from ${folderPath}`);
      
      try {
        // Download PDF
        const pdfBase64 = await downloadPDFAsBase64(file.id, accessToken);
        console.log(`[process-os-folder] Downloaded ${file.name} (${pdfBase64.length} chars)`);

        // Extract data with AI
        const extractedData = await extractOSData(pdfBase64, file.name);
        console.log(`[process-os-folder] Extracted data:`, JSON.stringify(extractedData, null, 2));

        // Check if OS number already exists
        if (processedNumbers.has(extractedData.numero_os)) {
          console.log(`[process-os-folder] OS ${extractedData.numero_os} already processed, skipping`);
          
          await supabase.from('os_processadas').insert({
            drive_file_id: file.id,
            drive_file_name: file.name,
            drive_folder_path: folderPath,
            numero_os: extractedData.numero_os,
            extracted_data: extractedData,
            confidence_score: extractedData.confidence_score,
            status: 'skipped',
            error_message: 'Número da OS já processado anteriormente'
          });
          
          results.push({ file: file.name, status: 'skipped', reason: 'already_processed' });
          continue;
        }

        // Find responsible IDs
        const comandanteId = extractedData.comandante?.matricula 
          ? await findEfetivoId(supabase, extractedData.comandante.matricula) 
          : null;
        const chefeOpId = extractedData.chefe_operacoes?.matricula 
          ? await findEfetivoId(supabase, extractedData.chefe_operacoes.matricula) 
          : null;

        // Insert OS into database
        const osData = {
          numero_os: extractedData.numero_os,
          numero_evento: extractedData.numero_evento,
          referencia_sei: extractedData.referencia_sei,
          data_evento: extractedData.data_evento,
          horario_inicio: extractedData.horario_inicio,
          horario_termino: extractedData.horario_termino,
          local_evento: extractedData.local_evento,
          regiao_administrativa_id: findRegiaoId(extractedData.regiao_administrativa),
          tipo_servico: extractedData.tipo_servico,
          uniforme_equipamento: extractedData.uniforme_equipamento,
          missao_policiamento: extractedData.missao_policiamento,
          situacao: extractedData.situacao || 'ATIVA',
          prescricoes_s1: extractedData.prescricoes_s1,
          prescricoes_s2: extractedData.prescricoes_s2,
          prescricoes_s3: extractedData.prescricoes_s3,
          prescricoes_s4: extractedData.prescricoes_s4,
          prescricoes_demais: extractedData.prescricoes_demais,
          comandante_id: comandanteId,
          chefe_operacoes_id: chefeOpId,
          drive_file_id: file.id,
          drive_file_name: file.name,
          drive_folder_path: folderPath,
          extracted_data: extractedData,
          confidence_score: extractedData.confidence_score,
          origem_registro: 'importacao_automatica'
        };

        const { data: osRecord, error: osError } = await supabase
          .from('fat_ordens_servico')
          .insert(osData)
          .select('id')
          .single();

        if (osError) {
          console.error(`[process-os-folder] Insert error:`, osError);
          throw osError;
        }

        // Insert team members
        if (extractedData.efetivo && osRecord) {
          for (const membro of extractedData.efetivo) {
            const efetivoId = await findEfetivoId(supabase, membro.matricula);
            if (efetivoId) {
              await supabase.from('fat_os_efetivo').insert({
                os_id: osRecord.id,
                efetivo_id: efetivoId,
                funcao: membro.funcao,
                viatura: membro.viatura
              });
            }
          }
        }

        // Mark OS as processed
        await supabase.from('os_processadas').insert({
          drive_file_id: file.id,
          drive_file_name: file.name,
          drive_folder_path: folderPath,
          numero_os: extractedData.numero_os,
          extracted_data: extractedData,
          confidence_score: extractedData.confidence_score,
          status: 'processed'
        });

        console.log(`[process-os-folder] Inserted OS record: ${osRecord?.id}`);

        results.push({ 
          file: file.name, 
          status: 'success', 
          numero_os: extractedData.numero_os,
          folder: folderPath,
          confidence: extractedData.confidence_score
        });

      } catch (error) {
        console.error(`[process-os-folder] Error processing ${file.name}:`, error);
        
        // Log error in os_processadas
        try {
          await supabase.from('os_processadas').insert({
            drive_file_id: file.id,
            drive_file_name: file.name,
            drive_folder_path: folderPath,
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
        } catch (logError) {
          console.error('Failed to log error:', logError);
        }
        
        results.push({ 
          file: file.name, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[process-os-folder] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
