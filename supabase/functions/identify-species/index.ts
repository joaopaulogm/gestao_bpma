import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, tipo } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    let result;
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
      result = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Error parsing AI response:", content);
      result = {
        identificado: false,
        observacoes: "Não foi possível processar a resposta da IA. Tente novamente."
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in identify-species function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao identificar espécie",
        identificado: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
