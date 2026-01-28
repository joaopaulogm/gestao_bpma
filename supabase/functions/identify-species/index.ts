import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(origin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { imageBase64, tipo } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Primeiro, usar IA para identificar a espécie
    // Depois vamos buscar no banco de dados

    const systemPrompt = tipo === 'flora' 
      ? `Você é um especialista botânico brasileiro, especialmente em espécies do Cerrado e do Distrito Federal do Brasil. Analise a imagem e identifique a espécie de planta.
         
         CONTEXTO: Esta ferramenta é utilizada pelo Batalhão de Polícia Militar Ambiental do Distrito Federal (BPMA-DF) para identificar espécies de flora encontradas no Cerrado brasileiro.
         
         PRIORIDADE: Considere prioritariamente espécies nativas ou comuns no Cerrado e no Distrito Federal. Se houver múltiplas possibilidades, priorize espécies que ocorrem naturalmente no bioma Cerrado.
         
         Responda APENAS no seguinte formato JSON (sem markdown, sem texto adicional):
         {
           "identificado": true ou false,
           "nome_popular": "nome popular da planta em português (mais comum no Brasil)",
           "nome_cientifico": "nome científico (gênero e espécie)",
           "confianca": número de 0 a 100,
           "classe_taxonomica": "classe taxonômica",
           "familia": "família taxonômica",
           "caracteristicas": ["característica 1", "característica 2", "característica 3"],
           "observacoes": "observações sobre a identificação, incluindo se é espécie típica do Cerrado/DF",
           "madeira_lei": true ou false,
           "imune_corte": true ou false
         }
         
         Se não conseguir identificar, retorne identificado: false com observacoes explicando o motivo.`
      : `Você é um especialista em fauna brasileira, especialmente em espécies do Cerrado e do Distrito Federal do Brasil. Analise a imagem e identifique a espécie animal.
         
         CONTEXTO: Esta ferramenta é utilizada pelo Batalhão de Polícia Militar Ambiental do Distrito Federal (BPMA-DF) para identificar espécies de fauna encontradas no Cerrado brasileiro e região do DF.
         
         PRIORIDADE: Considere prioritariamente espécies nativas ou comuns no Cerrado e no Distrito Federal. Se houver múltiplas possibilidades, priorize espécies que ocorrem naturalmente no bioma Cerrado.
         
         Responda APENAS no seguinte formato JSON (sem markdown, sem texto adicional):
         {
           "identificado": true ou false,
           "nome_popular": "nome popular do animal em português (mais comum no Brasil)",
           "nome_cientifico": "nome científico (gênero e espécie)",
           "confianca": número de 0 a 100,
           "classe_taxonomica": "AVE, MAMIFERO, REPTIL, PEIXE, ANFIBIO ou INVERTEBRADO",
           "ordem": "ordem taxonômica",
           "familia": "família taxonômica",
           "caracteristicas": ["característica 1", "característica 2", "característica 3"],
           "observacoes": "observações sobre a identificação, incluindo se é espécie típica do Cerrado/DF",
           "estado_conservacao": "estado de conservação se conhecido (LC, NT, VU, EN, CR, etc)"
         }
         
         Se não conseguir identificar, retorne identificado: false com observacoes explicando o motivo.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: `Identifique esta espécie de ${tipo === 'flora' ? 'planta' : 'animal'}. Analise cuidadosamente as características visíveis na imagem.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para IA." }),
          { status: 402, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse JSON response, handling potential markdown wrapping
    let aiResult;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      aiResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Error parsing AI response:", content);
      aiResult = {
        identificado: false,
        observacoes: "Não foi possível processar a resposta da IA. Tente novamente."
      };
    }

    // Se a IA identificou uma espécie, buscar no banco de dados primeiro
    let result = aiResult;
    let encontradoNoBanco = false;
    
    if (aiResult.identificado && aiResult.nome_popular) {
      try {
        // Criar cliente Supabase para buscar no banco
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
        
        if (supabaseUrl && supabaseKey) {
          const tableName = tipo === 'flora' ? 'dim_especies_flora' : 'dim_especies_fauna';
          
          // Buscar por nome popular (ILIKE para busca case-insensitive)
          const searchResponse = await fetch(
            `${supabaseUrl}/rest/v1/${tableName}?nome_popular=ilike.*${encodeURIComponent(aiResult.nome_popular)}*&select=id,nome_popular,nome_cientifico,classe_taxonomica&limit=5`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (searchResponse.ok) {
            const especies = await searchResponse.json();
            
            if (especies && especies.length > 0) {
              // Encontrou no banco! Usar dados do banco
              const especieEncontrada = especies[0];
              encontradoNoBanco = true;
              
              result = {
                ...aiResult,
                encontrado_no_banco: true,
                especie_id: especieEncontrada.id,
                nome_popular: especieEncontrada.nome_popular,
                nome_cientifico: especieEncontrada.nome_cientifico || aiResult.nome_cientifico,
                classe_taxonomica: especieEncontrada.classe_taxonomica || aiResult.classe_taxonomica,
                confianca: Math.min(100, (aiResult.confianca || 70) + 10), // Aumentar confiança se encontrado no banco
                observacoes: `Espécie encontrada no banco de dados do BPMA. ${aiResult.observacoes || ''}`
              };
            } else {
              // Não encontrou no banco, buscar por nome científico também
              if (aiResult.nome_cientifico) {
                const sciSearchResponse = await fetch(
                  `${supabaseUrl}/rest/v1/${tableName}?nome_cientifico=ilike.*${encodeURIComponent(aiResult.nome_cientifico)}*&select=id,nome_popular,nome_cientifico,classe_taxonomica&limit=5`,
                  {
                    headers: {
                      'apikey': supabaseKey,
                      'Authorization': `Bearer ${supabaseKey}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                if (sciSearchResponse.ok) {
                  const especiesSci = await sciSearchResponse.json();
                  
                  if (especiesSci && especiesSci.length > 0) {
                    const especieEncontrada = especiesSci[0];
                    encontradoNoBanco = true;
                    
                    result = {
                      ...aiResult,
                      encontrado_no_banco: true,
                      especie_id: especieEncontrada.id,
                      nome_popular: especieEncontrada.nome_popular,
                      nome_cientifico: especieEncontrada.nome_cientifico,
                      classe_taxonomica: especieEncontrada.classe_taxonomica || aiResult.classe_taxonomica,
                      confianca: Math.min(100, (aiResult.confianca || 70) + 10),
                      observacoes: `Espécie encontrada no banco de dados do BPMA por nome científico. ${aiResult.observacoes || ''}`
                    };
                  }
                }
              }
            }
          }
        }
      } catch (dbError) {
        console.error("Erro ao buscar no banco de dados:", dbError);
        // Continuar com resultado da IA mesmo se houver erro no banco
      }
    }
    
    // Se não encontrou no banco, marcar como sugestão da internet
    if (!encontradoNoBanco && aiResult.identificado) {
      result = {
        ...aiResult,
        encontrado_no_banco: false,
        aviso: "Esta espécie não está cadastrada no banco de dados do BPMA. A identificação foi feita pela IA usando informações da internet e não pode ser confirmada com certeza. Por favor, verifique manualmente antes de salvar.",
        observacoes: `⚠️ ATENÇÃO: ${aiResult.observacoes || 'Espécie identificada pela IA mas não encontrada no banco de dados. Verifique manualmente.'}`
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...headers, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in identify-species function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao identificar espécie",
        identificado: false 
      }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
});
