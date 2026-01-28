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

        // Função auxiliar para normalizar strings (remove acentos, números de versão, etc.)
        const normalizar = (str: string): string => {
          return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[0-9.,]+\s*(l|cc|cv|v|turbo|diesel|flex|gasolina|alcool)?/gi, '') // Remove specs
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Função para calcular similaridade entre strings
        const calcularSimilaridade = (str1: string, str2: string): number => {
          const s1 = normalizar(str1);
          const s2 = normalizar(str2);
          
          // Verifica se uma string contém a outra
          if (s1.includes(s2) || s2.includes(s1)) return 0.9;
          
          // Verifica palavras em comum
          const palavras1 = s1.split(' ').filter(p => p.length > 2);
          const palavras2 = s2.split(' ').filter(p => p.length > 2);
          
          let matches = 0;
          for (const p1 of palavras1) {
            for (const p2 of palavras2) {
              if (p1.includes(p2) || p2.includes(p1)) {
                matches++;
                break;
              }
            }
          }
          
          const maxPalavras = Math.max(palavras1.length, palavras2.length);
          return maxPalavras > 0 ? matches / maxPalavras : 0;
        };

        // 1. Buscar todas as marcas
        const marcasResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas`);
        const marcas = await marcasResponse.json();
        
        // Encontrar marca pelo nome (busca flexível)
        let marcaEncontrada = marcas.find((m: any) => {
          const nomeApi = m.nome.toLowerCase();
          const nomeBusca = marcaNome.toLowerCase();
          return nomeApi.includes(nomeBusca) || 
                 nomeBusca.includes(nomeApi) ||
                 nomeApi.replace(/\s|-/g, '').includes(nomeBusca.replace(/\s|-/g, '')) ||
                 nomeBusca.replace(/\s|-/g, '').includes(nomeApi.replace(/\s|-/g, ''));
        });

        // Tentar busca por GM se for Chevrolet
        if (!marcaEncontrada && marcaNome.includes('chevrolet')) {
          marcaEncontrada = marcas.find((m: any) => m.nome.toLowerCase().includes('gm'));
        }

        if (!marcaEncontrada) {
          // Marca não existe na FIPE (ex: tratores)
          console.log(`[FIPE] Marca não encontrada: ${marcaNome}`);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Marca não disponível na tabela FIPE', 
              marcaBuscada: marcaNome,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[FIPE] Marca encontrada: ${marcaEncontrada.nome} (${marcaEncontrada.codigo})`);

        // 2. Buscar modelos da marca
        const modelosResponse = await fetch(`${FIPE_API_BASE}/${tipoVeiculo}/marcas/${marcaEncontrada.codigo}/modelos`);
        const modelosData = await modelosResponse.json();
        
        let modeloEncontrado = null;
        if (modeloNome) {
          const modeloNormalizado = normalizar(modeloNome);
          
          // Extrair palavras-chave do modelo (ex: "S10", "KWID", "XTZ", "LANDER", "PAJERO")
          const palavrasChave = modeloNome
            .toUpperCase()
            .split(/[\s\-\/]+/)
            .filter((p: string) => p.length >= 2 && !/^[0-9.,]+$/.test(p));
          
          console.log(`[FIPE] Palavras-chave do modelo: ${palavrasChave.join(', ')}`);
          
          // Busca por palavras-chave
          for (const palavra of palavrasChave) {
            modeloEncontrado = modelosData.modelos?.find((m: any) => 
              m.nome.toUpperCase().includes(palavra)
            );
            if (modeloEncontrado) break;
          }
          
          // Se não encontrou, tenta busca por similaridade
          if (!modeloEncontrado) {
            let melhorSimilaridade = 0;
            for (const m of modelosData.modelos || []) {
              const sim = calcularSimilaridade(m.nome, modeloNome);
              if (sim > melhorSimilaridade && sim > 0.3) {
                melhorSimilaridade = sim;
                modeloEncontrado = m;
              }
            }
          }
        }

        if (!modeloEncontrado && modeloNome) {
          // Retornar como não encontrado mas com status 200
          console.log(`[FIPE] Modelo não encontrado: ${modeloNome}`);
          return new Response(
            JSON.stringify({ 
              success: false,
              error: 'Modelo não encontrado na tabela FIPE', 
              modeloBuscado: modeloNome,
              marca: marcaEncontrada,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    const errMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: 'Erro ao consultar API FIPE', details: errMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
