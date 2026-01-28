import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIPE_API_BASE = 'https://parallelum.com.br/fipe/api/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const tipoVeiculo = url.searchParams.get('tipo') || 'carros'; // carros, motos, caminhoes
    const marcaId = url.searchParams.get('marca');
    const modeloId = url.searchParams.get('modelo');
    const anoId = url.searchParams.get('ano');

    let endpoint = '';
    
    switch (action) {
      case 'marcas':
        endpoint = `${FIPE_API_BASE}/${tipoVeiculo}/marcas`;
        break;
      case 'modelos':
        if (!marcaId) {
          return new Response(
            JSON.stringify({ error: 'Parâmetro marca é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = `${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaId}/modelos`;
        break;
      case 'anos':
        if (!marcaId || !modeloId) {
          return new Response(
            JSON.stringify({ error: 'Parâmetros marca e modelo são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = `${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaId}/modelos/${modeloId}/anos`;
        break;
      case 'valor':
        if (!marcaId || !modeloId || !anoId) {
          return new Response(
            JSON.stringify({ error: 'Parâmetros marca, modelo e ano são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = `${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`;
        break;
      case 'buscar-por-nome':
        // Buscar marca e modelo pelo nome
        const marcaNome = url.searchParams.get('marcaNome')?.toLowerCase();
        const modeloNome = url.searchParams.get('modeloNome')?.toLowerCase();
        const anoVeiculo = url.searchParams.get('anoVeiculo');

        if (!marcaNome) {
          return new Response(
            JSON.stringify({ error: 'Parâmetro marcaNome é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[FIPE] Buscando marca: ${marcaNome}, modelo: ${modeloNome}, ano: ${anoVeiculo}`);

        // 1. Buscar todas as marcas
        const marcasResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas`);
        const marcas = await marcasResponse.json();
        
        // Encontrar marca pelo nome (busca parcial)
        const marcaEncontrada = marcas.find((m: any) => 
          m.nome.toLowerCase().includes(marcaNome) || 
          marcaNome.includes(m.nome.toLowerCase())
        );

        if (!marcaEncontrada) {
          return new Response(
            JSON.stringify({ 
              error: 'Marca não encontrada', 
              marcaBuscada: marcaNome,
              sugestoes: marcas.slice(0, 10).map((m: any) => m.nome)
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[FIPE] Marca encontrada: ${marcaEncontrada.nome} (${marcaEncontrada.codigo})`);

        // 2. Buscar modelos da marca
        const modelosResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaEncontrada.codigo}/modelos`);
        const modelosData = await modelosResponse.json();
        
        let modeloEncontrado = null;
        if (modeloNome) {
          // Buscar modelo pelo nome (busca parcial)
          modeloEncontrado = modelosData.modelos?.find((m: any) => 
            m.nome.toLowerCase().includes(modeloNome) || 
            modeloNome.includes(m.nome.toLowerCase())
          );
        }

        if (!modeloEncontrado && modeloNome) {
          return new Response(
            JSON.stringify({ 
              error: 'Modelo não encontrado', 
              modeloBuscado: modeloNome,
              marca: marcaEncontrada,
              sugestoes: modelosData.modelos?.slice(0, 10).map((m: any) => m.nome) || []
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Se não tem modelo, retornar apenas a marca e lista de modelos
        if (!modeloEncontrado) {
          return new Response(
            JSON.stringify({ 
              marca: marcaEncontrada,
              modelos: modelosData.modelos || []
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[FIPE] Modelo encontrado: ${modeloEncontrado.nome} (${modeloEncontrado.codigo})`);

        // 3. Buscar anos disponíveis
        const anosResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos`);
        const anos = await anosResponse.json();

        // Encontrar ano mais próximo
        let anoEncontrado = null;
        if (anoVeiculo) {
          // Procurar ano exato ou mais próximo
          anoEncontrado = anos.find((a: any) => a.nome.includes(anoVeiculo));
          
          if (!anoEncontrado && anos.length > 0) {
            // Pegar o primeiro ano disponível (geralmente o mais recente)
            anoEncontrado = anos[0];
          }
        } else if (anos.length > 0) {
          anoEncontrado = anos[0];
        }

        if (!anoEncontrado) {
          return new Response(
            JSON.stringify({ 
              error: 'Ano não encontrado',
              marca: marcaEncontrada,
              modelo: modeloEncontrado,
              anosDisponiveis: anos
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[FIPE] Ano encontrado: ${anoEncontrado.nome} (${anoEncontrado.codigo})`);

        // 4. Buscar valor final
        const valorResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos/${anoEncontrado.codigo}`);
        const valorData = await valorResponse.json();

        return new Response(
          JSON.stringify({
            success: true,
            marca: marcaEncontrada,
            modelo: modeloEncontrado,
            ano: anoEncontrado,
            valor: valorData
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Ação inválida',
            acoesDisponiveis: ['marcas', 'modelos', 'anos', 'valor', 'buscar-por-nome']
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`[FIPE] Consultando: ${endpoint}`);
    
    const response = await fetch(endpoint);
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FIPE] Erro:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao consultar API FIPE', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
