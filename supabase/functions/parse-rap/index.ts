import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema for fauna rescue extraction
const rescueExtractionSchema = {
  type: "object",
  properties: {
    form_type: { 
      type: "string", 
      enum: ["resgate_fauna", "crime_ambiental"],
      description: "Tipo de formulário detectado baseado no conteúdo do RAP"
    },
    data: { type: "string", description: "Data da ocorrência no formato DD/MM/YYYY" },
    hora: { type: "string", description: "Hora da ocorrência no formato HH:MM" },
    regiao_administrativa: { type: "string", description: "Nome da Região Administrativa do DF" },
    endereco: { type: "string", description: "Endereço completo da ocorrência" },
    latitude: { type: "string", description: "Latitude da ocorrência (número decimal)" },
    longitude: { type: "string", description: "Longitude da ocorrência (número decimal)" },
    origem: { 
      type: "string", 
      enum: ["COPOM", "Ação Policial", "Comunidade", "Outras instituições", "PMDF"],
      description: "Origem da ocorrência"
    },
    tipo_area: { type: "string", description: "Tipo de área (residencial, comercial, rural, etc.)" },
    
    // Fauna específico
    animais: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome_popular: { type: "string", description: "Nome popular do animal" },
          nome_cientifico: { type: "string", description: "Nome científico se mencionado" },
          classe_taxonomica: { 
            type: "string", 
            enum: ["Mamíferos", "Aves", "Répteis", "Anfíbios", "Peixes", "Invertebrados"],
            description: "Classe taxonômica do animal"
          },
          quantidade_adulto: { type: "integer", description: "Quantidade de adultos" },
          quantidade_filhote: { type: "integer", description: "Quantidade de filhotes" },
          estado_saude: { 
            type: "string", 
            enum: ["Bom", "Regular", "Grave", "Óbito"],
            description: "Estado de saúde do animal"
          },
          atropelamento: { type: "boolean", description: "Se foi atropelamento" }
        },
        required: ["nome_popular", "quantidade_adulto"]
      },
      description: "Lista de animais envolvidos"
    },
    
    desfecho: { type: "string", description: "Desfecho da ocorrência (resgatado, solto, óbito, evadido, etc.)" },
    destinacao: { type: "string", description: "Destino do animal (CETAS, soltura, CEAPA, etc.)" },
    
    // Crime ambiental específico
    tipo_crime: { 
      type: "string",
      enum: ["Crime Contra a Fauna", "Crime Contra a Flora", "Poluição", "Ordenamento Urbano", "Administração Ambiental"],
      description: "Tipo de crime ambiental se aplicável"
    },
    enquadramento: { type: "string", description: "Artigo de lei mencionado" },
    ocorreu_apreensao: { type: "boolean", description: "Se houve apreensão de bens" },
    bens_apreendidos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string", description: "Descrição do item apreendido" },
          quantidade: { type: "integer", description: "Quantidade" }
        }
      },
      description: "Lista de bens apreendidos"
    },
    qtd_detidos_maior: { type: "integer", description: "Quantidade de maiores de idade detidos" },
    qtd_detidos_menor: { type: "integer", description: "Quantidade de menores de idade detidos" },
    
    // Equipe
    equipe: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome do policial" },
          matricula: { type: "string", description: "Matrícula do policial" },
          posto_graduacao: { type: "string", description: "Posto ou graduação" }
        }
      },
      description: "Membros da equipe que atendeu a ocorrência"
    },
    
    observacoes: { type: "string", description: "Observações adicionais relevantes" },
    confidence_score: { 
      type: "number", 
      description: "Nível de confiança na extração (0-1)"
    }
  },
  required: ["form_type", "data", "confidence_score"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rap_text, rap_images } = await req.json();

    if (!rap_text && (!rap_images || rap_images.length === 0)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Texto ou imagens do RAP são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing RAP document...');

    // Build messages array
    const messages: any[] = [
      {
        role: "system",
        content: `Você é um especialista em análise de Relatórios de Atividade Policial (RAP) do Batalhão de Polícia Militar Ambiental (BPMA) do Distrito Federal.

Sua tarefa é extrair informações estruturadas do RAP para preencher automaticamente formulários de:
1. **Resgate de Fauna** - quando envolve resgate, captura ou atendimento a animais silvestres
2. **Crime Ambiental** - quando envolve infrações ambientais (fauna, flora, poluição, etc.)

REGRAS IMPORTANTES:
- Extraia TODOS os dados mencionados no documento
- Se um dado não estiver presente, omita o campo (não invente)
- Coordenadas devem ser números decimais (ex: -15.7801, -47.9292)
- Datas no formato DD/MM/YYYY
- Identifique corretamente a classe taxonômica dos animais
- Para crimes, identifique o artigo de lei quando mencionado
- Avalie sua confiança na extração (0-1) baseado na clareza do documento

REGIÕES ADMINISTRATIVAS DO DF:
Águas Claras, Arniqueira, Brazlândia, Candangolândia, Ceilândia, Cruzeiro, Fercal, Gama, Guará, Itapoã, Jardim Botânico, Lago Norte, Lago Sul, Núcleo Bandeirante, Paranoá, Park Way, Planaltina, Plano Piloto, Recanto das Emas, Riacho Fundo, Riacho Fundo II, Samambaia, Santa Maria, São Sebastião, SCIA/Estrutural, SIA, Sobradinho, Sobradinho II, Sol Nascente/Pôr do Sol, Sudoeste/Octogonal, Taguatinga, Varjão, Vicente Pires`
      }
    ];

    // Handle text and/or images
    if (rap_images && rap_images.length > 0) {
      // Multimodal request with images
      const userContent: any[] = [];
      
      if (rap_text) {
        userContent.push({
          type: "text",
          text: `Analise o seguinte RAP e extraia os dados estruturados:\n\n${rap_text}`
        });
      } else {
        userContent.push({
          type: "text",
          text: "Analise as imagens do RAP abaixo e extraia os dados estruturados:"
        });
      }
      
      // Add images
      for (const image of rap_images) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
          }
        });
      }
      
      messages.push({ role: "user", content: userContent });
    } else {
      // Text-only request
      messages.push({
        role: "user",
        content: `Analise o seguinte RAP e extraia os dados estruturados:\n\n${rap_text}`
      });
    }

    console.log('Calling Lovable AI for extraction...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "extract_rap_data",
              description: "Extrai dados estruturados do Relatório de Atividade Policial",
              parameters: rescueExtractionSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_rap_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar documento' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_rap_data') {
      console.error('Unexpected AI response format:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de resposta inesperado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted data:', JSON.stringify(extractedData, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        message: `Dados extraídos com ${Math.round(extractedData.confidence_score * 100)}% de confiança`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing RAP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
