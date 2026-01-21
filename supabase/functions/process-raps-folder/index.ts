import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Folder ID da pasta RAP's (2026) no Google Drive
const RAP_FOLDER_ID = '1Rx_056ruXq_NuiVwOQ5TKmRT9TcMIMog';

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

// Mapeamento de Origens
const ORIGEM_MAP: Record<string, string> = {
  'ação policial': '44de5dce-9d62-4ba3-95c6-457b57c1b5e5',
  'comunidade': '4c2ab3fe-416c-4fbd-9f19-34ab1245c4af',
  'copom': 'd85eeb9e-8be9-4b91-9c76-c0a4867b4c57',
  'outras instituições': '16df9c20-c37e-4c24-ab6a-8f5dde024a96',
  'pmdf': 'fbb9a873-756f-40e9-bdef-0435f4b4ec57',
};

// Mapeamento de Destinação
const DESTINACAO_MAP: Record<string, string> = {
  'cetas': '5ce6457e-161f-47eb-9529-6c225acb39ca',
  'ibama': '5ce6457e-161f-47eb-9529-6c225acb39ca',
  'hfaus': '6a07f8ec-81c0-458e-b987-7755d4ddaa7a',
  'ibram': '6a07f8ec-81c0-458e-b987-7755d4ddaa7a',
  'hvet': '44f3e0f2-3ac5-4975-9695-379be46eb7fc',
  'unb': '44f3e0f2-3ac5-4975-9695-379be46eb7fc',
  'outros': 'd9c9940e-5684-4c36-91c8-4cff4ef899e7',
  'soltura': '82f30e69-e500-4112-b817-dafed516201f',
  'vida livre': '32c9b56d-9c74-4d1f-9960-a0dfccb829d1',
  'ceapa': '6a07f8ec-81c0-458e-b987-7755d4ddaa7a',
};

// Mapeamento de Estado de Saúde
const ESTADO_SAUDE_MAP: Record<string, string> = {
  'debilitado': '33052ac0-06f4-405a-8080-33ae894496b9',
  'ferido': '5bb0173d-bb78-4ece-89d0-0c7eb1e0c62c',
  'óbito': '075ab11d-c032-46f4-9023-0bd28c73186f',
  'obito': '075ab11d-c032-46f4-9023-0bd28c73186f',
  'saudável': 'e1260933-7615-4a8f-ad8e-3593ec8288c4',
  'saudavel': 'e1260933-7615-4a8f-ad8e-3593ec8288c4',
  'bom': 'e1260933-7615-4a8f-ad8e-3593ec8288c4',
  'regular': '33052ac0-06f4-405a-8080-33ae894496b9',
  'grave': '5bb0173d-bb78-4ece-89d0-0c7eb1e0c62c',
};

// Mapeamento de Estágio de Vida
const ESTAGIO_VIDA_MAP: Record<string, string> = {
  'adulto': '9ac625d9-6b52-4824-9521-28fba57d88c9',
  'ambos': '657e6e0d-e066-477a-a5a5-cbf124ac8578',
  'filhote': '740c7da0-9e07-4c7a-866f-1dd690440f78',
  'jovem': 'e87980d0-f75d-4791-a5f3-79aba37ba113',
  'filhotão': 'e87980d0-f75d-4791-a5f3-79aba37ba113',
  'filhotao': 'e87980d0-f75d-4791-a5f3-79aba37ba113',
};

// Schema para extração de dados do RAP
const rapExtractionSchema = {
  type: "object",
  properties: {
    form_type: { 
      type: "string", 
      enum: ["resgate_fauna", "crime_ambiental"],
      description: "Tipo de formulário detectado"
    },
    rap_numero: { type: "string", description: "Número do RAP (ex: 007135-2026)" },
    data: { type: "string", description: "Data da ocorrência no formato YYYY-MM-DD" },
    hora: { type: "string", description: "Hora no formato HH:MM" },
    regiao_administrativa: { type: "string", description: "Nome da Região Administrativa/Cidade" },
    endereco: { type: "string", description: "Endereço completo" },
    latitude: { type: "number", description: "Latitude decimal (negativo para Sul)" },
    longitude: { type: "number", description: "Longitude decimal (negativo para Oeste)" },
    latitude_soltura: { type: "number", description: "Latitude do local de soltura se houver" },
    longitude_soltura: { type: "number", description: "Longitude do local de soltura se houver" },
    origem: { type: "string", description: "Origem: COPOM, Ação Policial, Comunidade, PMDF ou Outras instituições" },
    
    // Fauna
    animais: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome_popular: { type: "string" },
          nome_cientifico: { type: "string" },
          quantidade_adulto: { type: "integer", default: 0 },
          quantidade_filhote: { type: "integer", default: 0 },
          estado_saude: { type: "string" },
          estagio_vida: { type: "string" },
          atropelamento: { type: "boolean", default: false }
        }
      }
    },
    destinacao: { type: "string", description: "Destino do animal" },
    
    // Crime ambiental
    tipo_crime: { type: "string" },
    enquadramento: { type: "string", description: "Artigo de lei (ex: Art. 46 Lei 9.605/98)" },
    ocorreu_apreensao: { type: "boolean" },
    bens_apreendidos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          quantidade: { type: "integer" }
        }
      }
    },
    qtd_detidos_maior: { type: "integer", default: 0 },
    qtd_detidos_menor: { type: "integer", default: 0 },
    
    // Equipe
    equipe: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          matricula: { type: "string" },
          posto_graduacao: { type: "string" },
          funcao: { type: "string" }
        }
      }
    },
    
    observacoes: { type: "string" },
    confidence_score: { type: "number" }
  },
  required: ["form_type", "rap_numero", "data", "confidence_score"]
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

async function listPDFsInFolder(accessToken: string): Promise<any[]> {
  const query = `'${RAP_FOLDER_ID}' in parents and mimeType = 'application/pdf'`;
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

async function extractRAPData(pdfBase64: string, fileName: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

  const systemPrompt = `Você é um especialista em análise de Relatórios de Atividade Policial (RAP) do BPMA - DF.

OBJETIVO: Extrair TODOS os dados estruturados do RAP para preencher formulários automaticamente.

REGRAS CRÍTICAS:
1. NÚMERO DO RAP: Sempre no formato NNNNNN-AAAA (ex: 007135-2026)
2. DATA: Converter para formato ISO YYYY-MM-DD
3. COORDENADAS: Converter para decimal negativo (Sul = negativo, Oeste = negativo)
   - "16.042776°S, 48.029226°W" → latitude: -16.042776, longitude: -48.029226
4. REGIAO: Extrair a cidade/RA (ex: "SANTA MARIA", "GAMA", "BRAZLÂNDIA")
5. ANIMAIS: Para cada animal, identificar:
   - Nome popular (ex: "Sagui", "Gambá", "Jibóia")
   - Quantidade de adultos e filhotes
   - Estado de saúde (Saudável, Ferido, Debilitado, Óbito)
   - Se foi atropelamento
6. EQUIPE: Extrair matrícula, nome e posto de cada policial
7. DESTINAÇÃO: Soltura, CETAS, CEAPA, HFAUS, etc.

TIPO DE FORMULÁRIO:
- resgate_fauna: Quando envolve resgate/captura de animais silvestres sem crime
- crime_ambiental: Quando há infração ambiental (fauna, flora, poluição, etc.)

ARTIGOS COMUNS DE CRIMES AMBIENTAIS:
- Art. 29 Lei 9.605/98: Fauna silvestre
- Art. 46 Lei 9.605/98: Transporte de produtos florestais sem licença
- Art. 51 Decreto 6.514/08: Motosserra sem licença`;

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
            { type: "text", text: `Analise este RAP (${fileName}) e extraia todos os dados estruturados:` },
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
          name: "extract_rap_data",
          description: "Extrai dados estruturados do RAP",
          parameters: rapExtractionSchema
        }
      }],
      tool_choice: { type: "function", function: { name: "extract_rap_data" } }
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

function findOrigemId(origem: string | undefined): string | null {
  if (!origem) return 'd85eeb9e-8be9-4b91-9c76-c0a4867b4c57'; // Default: COPOM
  const normalized = origem.toLowerCase();
  
  for (const [key, id] of Object.entries(ORIGEM_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return 'd85eeb9e-8be9-4b91-9c76-c0a4867b4c57'; // Default: COPOM
}

function findDestinacaoId(destinacao: string | undefined): string | null {
  if (!destinacao) return null;
  const normalized = destinacao.toLowerCase();
  
  for (const [key, id] of Object.entries(DESTINACAO_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return null;
}

function findEstadoSaudeId(estado: string | undefined): string | null {
  if (!estado) return 'e1260933-7615-4a8f-ad8e-3593ec8288c4'; // Default: Saudável
  const normalized = estado.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, id] of Object.entries(ESTADO_SAUDE_MAP)) {
    const keyNormalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(keyNormalized)) return id;
  }
  return 'e1260933-7615-4a8f-ad8e-3593ec8288c4';
}

function findEstagioVidaId(estagio: string | undefined): string | null {
  if (!estagio) return '9ac625d9-6b52-4824-9521-28fba57d88c9'; // Default: Adulto
  const normalized = estagio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, id] of Object.entries(ESTAGIO_VIDA_MAP)) {
    const keyNormalized = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(keyNormalized)) return id;
  }
  return '9ac625d9-6b52-4824-9521-28fba57d88c9';
}

async function findEspecieId(supabase: any, nomePopular: string): Promise<string | null> {
  const { data } = await supabase
    .from('dim_especies_fauna')
    .select('id')
    .ilike('nome_popular', `%${nomePopular}%`)
    .limit(1);
  
  return data?.[0]?.id || null;
}

async function findEfetivoId(supabase: any, matricula: string): Promise<string | null> {
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
    const limit = body.limit || 5; // Processar no máximo 5 por vez para evitar timeout

    console.log(`[process-raps-folder] Action: ${action}, Limit: ${limit}`);

    // Get Google Drive access token
    const accessToken = await getAccessToken();
    console.log('[process-raps-folder] Got Google access token');

    // List PDFs in folder
    const files = await listPDFsInFolder(accessToken);
    console.log(`[process-raps-folder] Found ${files.length} PDF files`);

    // Get already processed RAPs
    const { data: processedRaps } = await supabase
      .from('rap_processados')
      .select('drive_file_id, rap_numero');

    const processedIds = new Set(processedRaps?.map(r => r.drive_file_id) || []);
    const processedNumbers = new Set(processedRaps?.map(r => r.rap_numero) || []);

    // Filter unprocessed files
    const unprocessedFiles = files.filter(f => !processedIds.has(f.id));
    console.log(`[process-raps-folder] ${unprocessedFiles.length} files not yet processed`);

    if (action === 'list') {
      return new Response(JSON.stringify({
        success: true,
        total_files: files.length,
        processed_count: processedIds.size,
        pending_count: unprocessedFiles.length,
        pending_files: unprocessedFiles.slice(0, 20).map(f => ({ id: f.id, name: f.name }))
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Process files
    const results: any[] = [];
    const filesToProcess = unprocessedFiles.slice(0, limit);

    for (const file of filesToProcess) {
      console.log(`[process-raps-folder] Processing: ${file.name}`);
      
      try {
        // Download PDF
        const pdfBase64 = await downloadPDFAsBase64(file.id, accessToken);
        console.log(`[process-raps-folder] Downloaded ${file.name} (${pdfBase64.length} chars)`);

        // Extract data with AI
        const extractedData = await extractRAPData(pdfBase64, file.name);
        console.log(`[process-raps-folder] Extracted data:`, JSON.stringify(extractedData, null, 2));

        // Check if RAP number already exists
        if (processedNumbers.has(extractedData.rap_numero)) {
          console.log(`[process-raps-folder] RAP ${extractedData.rap_numero} already processed, skipping`);
          results.push({ file: file.name, status: 'skipped', reason: 'already_processed' });
          continue;
        }

        // Insert into database based on form type
        if (extractedData.form_type === 'resgate_fauna') {
          // Process each animal
          const animais = extractedData.animais || [{ nome_popular: 'Animal não identificado', quantidade_adulto: 1 }];
          
          for (const animal of animais) {
            const especieId = await findEspecieId(supabase, animal.nome_popular);
            
            const registroData = {
              data: extractedData.data,
              regiao_administrativa_id: findRegiaoId(extractedData.regiao_administrativa),
              origem_id: findOrigemId(extractedData.origem),
              especie_id: especieId,
              estado_saude_id: findEstadoSaudeId(animal.estado_saude),
              estagio_vida_id: findEstagioVidaId(animal.estagio_vida),
              atropelamento: animal.atropelamento ? 'Sim' : 'Não',
              quantidade_adulto: animal.quantidade_adulto || 1,
              quantidade_filhote: animal.quantidade_filhote || 0,
              latitude_origem: extractedData.latitude?.toString(),
              longitude_origem: extractedData.longitude?.toString(),
              latitude_soltura: extractedData.latitude_soltura?.toString(),
              longitude_soltura: extractedData.longitude_soltura?.toString(),
              destinacao_id: findDestinacaoId(extractedData.destinacao),
              origem_registro: 'importacao_automatica_rap',
            };

            const { data: registro, error: regError } = await supabase
              .from('fat_registros_de_resgate')
              .insert(registroData)
              .select('id')
              .single();

            if (regError) {
              console.error(`[process-raps-folder] Insert error:`, regError);
              throw regError;
            }

            // Insert team members
            if (extractedData.equipe && registro) {
              for (const membro of extractedData.equipe) {
                const efetivoId = await findEfetivoId(supabase, membro.matricula);
                if (efetivoId) {
                  await supabase.from('fat_equipe_resgate').insert({
                    registro_id: registro.id,
                    efetivo_id: efetivoId
                  });
                }
              }
            }

            console.log(`[process-raps-folder] Inserted resgate record: ${registro?.id}`);
          }
        } else if (extractedData.form_type === 'crime_ambiental') {
          // Insert crime record
          const crimeData = {
            data: extractedData.data,
            latitude: extractedData.latitude?.toString(),
            longitude: extractedData.longitude?.toString(),
            regiao_administrativa_id: findRegiaoId(extractedData.regiao_administrativa),
            endereco: extractedData.endereco,
            qtd_detidos_maior_idade: extractedData.qtd_detidos_maior || 0,
            qtd_detidos_menor_idade: extractedData.qtd_detidos_menor || 0,
            origem_registro: 'importacao_automatica_rap',
          };

          const { data: crime, error: crimeError } = await supabase
            .from('fat_registros_de_crime')
            .insert(crimeData)
            .select('id')
            .single();

          if (crimeError) {
            console.error(`[process-raps-folder] Crime insert error:`, crimeError);
            throw crimeError;
          }

          // Insert team members
          if (extractedData.equipe && crime) {
            for (const membro of extractedData.equipe) {
              const efetivoId = await findEfetivoId(supabase, membro.matricula);
              if (efetivoId) {
                await supabase.from('fat_equipe_crime').insert({
                  crime_id: crime.id,
                  efetivo_id: efetivoId
                });
              }
            }
          }

          // Insert seized items
          if (extractedData.bens_apreendidos && crime) {
            for (const bem of extractedData.bens_apreendidos) {
              await supabase.from('fat_ocorrencia_apreensao').insert({
                crime_id: crime.id,
                item_apreendido: bem.item,
                quantidade: bem.quantidade || 1
              });
            }
          }

          console.log(`[process-raps-folder] Inserted crime record: ${crime?.id}`);
        }

        // Mark RAP as processed
        await supabase.from('rap_processados').insert({
          drive_file_id: file.id,
          drive_file_name: file.name,
          rap_numero: extractedData.rap_numero,
          form_type: extractedData.form_type,
          extracted_data: extractedData,
          confidence_score: extractedData.confidence_score
        });

        results.push({ 
          file: file.name, 
          status: 'success', 
          rap_numero: extractedData.rap_numero,
          form_type: extractedData.form_type,
          confidence: extractedData.confidence_score
        });

      } catch (error) {
        console.error(`[process-raps-folder] Error processing ${file.name}:`, error);
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
    console.error('[process-raps-folder] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
