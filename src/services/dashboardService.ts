
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';
import { format, endOfMonth } from 'date-fns';

// Type-safe wrapper para queries em tabelas não tipadas
const supabaseAny = supabase as any;

/**
 * Fetches registry data from Supabase based on filters
 * Inclui dados atuais (fat_resgates_diarios_2025) e históricos (fat_resgates_diarios_2020a2024)
 */

/**
 * Busca dados sem usar joins (para tabelas sem foreign keys configuradas)
 * Usa paginação para buscar todos os registros (sem limite de 1000)
 */
const fetchDataWithoutJoins = async (
  tableName: string,
  filters: FilterState
): Promise<{ data: any[]; error: any }> => {
  try {
    // Normalizar o ano para número
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    // Aplicar filtros de data
    // Para tabelas fat_resgates_diarios_*, verificar qual campo de data usar
    const campoData = tableName.includes('fat_resgates_diarios_2025') ? 'data' : 
                      tableName.includes('fat_resgates_diarios_') ? 'data_ocorrencia' : 'data';
    
    const startDate = `${ano}-01-01`;
    const endDate = `${ano}-12-31`;
    
    // Usar paginação para buscar todos os registros
    const PAGE_SIZE = 1000;
    let allData: any[] = [];
    let from = 0;
    let hasMore = true;
    
    while (hasMore) {
      let query = supabaseAny.from(tableName).select('*');
      
      // Aplicar filtros de data
      try {
        query = query.gte(campoData, startDate).lte(campoData, endDate);
      } catch {
        // Se falhar, tentar com data_ocorrencia
        const campoAlternativo = campoData === 'data' ? 'data_ocorrencia' : 'data';
        query = query.gte(campoAlternativo, startDate).lte(campoAlternativo, endDate);
      }
      
      // Aplicar filtro de mês se especificado
      if (filters.month !== null) {
        const monthStart = `${ano}-${String(filters.month + 1).padStart(2, '0')}-01`;
        const monthEnd = format(
          endOfMonth(new Date(ano, filters.month, 1)),
          'yyyy-MM-dd'
        );
        query = query.gte(campoData, monthStart).lte(campoData, monthEnd);
      }
      
      // Aplicar filtro de origem se especificado
      if (filters.origem) {
        try {
          const { data: origemData } = await supabase
            .from('dim_origem')
            .select('id')
            .ilike('nome', filters.origem)
            .maybeSingle();
          
          if (origemData) {
            query = query.eq('origem_id', origemData.id);
          }
        } catch (origemErr) {
          console.warn('Erro ao buscar origem:', origemErr);
        }
      }

      // Aplicar novos filtros avançados
      if (filters.especie) {
        query = query.eq('especie_id', filters.especie);
      }
      
      if (filters.regiaoAdministrativa) {
        query = query.eq('regiao_administrativa_id', filters.regiaoAdministrativa);
      }
      
      if (filters.desfecho) {
        query = query.eq('desfecho_id', filters.desfecho);
      }
      
      if (filters.tipoRegistro) {
        // Para dados históricos, verificar tipo_registro ou tabela
        if (tableName.includes('fat_resgates_diarios_')) {
          if (filters.tipoRegistro !== 'historico') {
            // Se não for histórico, não buscar desta tabela
            hasMore = false;
            break;
          }
        } else {
          // Para fat_registros_de_resgate, verificar se há campo tipo_registro
          // ou assumir que é 'resgate'
          if (filters.tipoRegistro !== 'resgate') {
            // Se não for resgate, não buscar desta tabela
            hasMore = false;
            break;
          }
        }
      }
      
      // Aplicar paginação
      query = query.range(from, from + PAGE_SIZE - 1);
      
      const { data: pageData, error } = await query;
      
      if (error) {
        if (from === 0) {
          // Se for a primeira página e houver erro, retornar erro
          return { data: [], error };
        }
        // Se não for a primeira página, parar e retornar o que já foi carregado
        break;
      }
      
      if (pageData && pageData.length > 0) {
        allData = [...allData, ...pageData];
        from += PAGE_SIZE;
        hasMore = pageData.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }
    
    // Buscar dados relacionados manualmente
    const enrichedData = await enrichDataWithRelations(allData);
    
    return { data: enrichedData, error: null };
  } catch (err: any) {
    return { data: [], error: err };
  }
};

/**
 * Enriquece dados com relacionamentos buscando manualmente
 */
const enrichDataWithRelations = async (registros: any[]): Promise<any[]> => {
  if (!registros || registros.length === 0) return [];
  
  // Buscar todas as dimensões de uma vez
  const [regioesRes, origensRes, destinacoesRes, estadosSaudeRes, estagiosVidaRes, desfechosRes, especiesRes] = await Promise.all([
    supabase.from('dim_regiao_administrativa').select('id, nome'),
    supabase.from('dim_origem').select('id, nome'),
    supabase.from('dim_destinacao').select('id, nome'),
    supabase.from('dim_estado_saude').select('id, nome'),
    supabase.from('dim_estagio_vida').select('id, nome'),
    supabase.from('dim_desfecho_resgates').select('id, nome, tipo'),
    supabase.from('dim_especies_fauna').select('*')
  ]);
  
  // Criar maps para lookup rápido
  const regioesMap = new Map((regioesRes.data || []).map(r => [r.id, r]));
  const origensMap = new Map((origensRes.data || []).map(r => [r.id, r]));
  const destinacoesMap = new Map((destinacoesRes.data || []).map(r => [r.id, r]));
  const estadosSaudeMap = new Map((estadosSaudeRes.data || []).map(r => [r.id, r]));
  const estagiosVidaMap = new Map((estagiosVidaRes.data || []).map(r => [r.id, r]));
  const desfechosMap = new Map((desfechosRes.data || []).map(r => [r.id, r]));
  const especiesMap = new Map((especiesRes.data || []).map(r => [r.id, r]));
  
  // Enriquecer cada registro
  return registros.map(reg => ({
    ...reg,
    regiao_administrativa: reg.regiao_administrativa_id ? regioesMap.get(reg.regiao_administrativa_id) : null,
    origem: reg.origem_id ? origensMap.get(reg.origem_id) : null,
    destinacao: reg.destinacao_id ? destinacoesMap.get(reg.destinacao_id) : null,
    estado_saude: reg.estado_saude_id ? estadosSaudeMap.get(reg.estado_saude_id) : null,
    estagio_vida: reg.estagio_vida_id ? estagiosVidaMap.get(reg.estagio_vida_id) : null,
    desfecho: reg.desfecho_id ? desfechosMap.get(reg.desfecho_id) : null,
    especie: reg.especie_id ? especiesMap.get(reg.especie_id) : null
  }));
};

/**
 * Busca dados agregados das novas tabelas BPMA (2021-2024)
 * Retorna dados de todas as naturezas (Resgate, Solturas, Óbitos, Feridos, Filhotes, etc.)
 */
const fetchBpmaAgregados = async (
  filters: FilterState
): Promise<any[]> => {
  try {
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    if (ano < 2021 || ano > 2024) {
      return [];
    }
    
    let query = supabaseAny
      .from('bpma_fato_mensal')
      .select('*')
      .eq('ano', ano);
    
    if (filters.month !== null) {
      query = query.eq('mes', filters.month + 1);
    }
    
    // Buscar todas as naturezas relevantes
    const naturezasRelevantes = [
      'Resgate de Fauna Silvestre',
      'Solturas',
      'Óbitos',
      'Feridos',
      'Filhotes',
      'Atropelamento'
    ];
    
    query = query.in('natureza', naturezasRelevantes);
    
    const { data, error } = await query;
    
    if (error) {
      console.warn('⚠️ [Dashboard] Erro ao buscar bpma_fato_mensal:', error);
      return [];
    }
    
    // Converter dados agregados para formato de registros individuais
    // Criar registros "sintéticos" para cada natureza e mês
    const registrosAgregados: any[] = [];
    
    (data || []).forEach((item: any) => {
      // Criar um registro para cada natureza
      registrosAgregados.push({
        id: `bpma-${item.ano}-${item.mes}-${item.natureza}`,
        data: new Date(item.ano, item.mes - 1, 1).toISOString().split('T')[0],
        quantidade: item.natureza === 'Resgate de Fauna Silvestre' ? item.quantidade : 0,
        quantidade_total: item.natureza === 'Resgate de Fauna Silvestre' ? item.quantidade : 0,
        quantidade_solturas: item.natureza === 'Solturas' ? item.quantidade : 0,
        quantidade_obitos: item.natureza === 'Óbitos' ? item.quantidade : 0,
        quantidade_feridos: item.natureza === 'Feridos' ? item.quantidade : 0,
        quantidade_filhotes: item.natureza === 'Filhotes' ? item.quantidade : 0,
        quantidade_adulto: 0,
        quantidade_filhote: item.natureza === 'Filhotes' ? item.quantidade : 0,
        atropelamento: item.natureza === 'Atropelamento' ? 'Sim' : null,
        regiao_administrativa: null,
        origem: { nome: 'Resgate de Fauna' },
        destinacao: null,
        estado_saude: null,
        estagio_vida: null,
        desfecho: null,
        especie: null,
        tipo_registro: 'agregado',
        natureza: item.natureza,
        mes: item.mes,
        ano: item.ano
      });
    });
    
    // Agrupar por mês para consolidar os dados
    const consolidadoPorMes = new Map<string, any>();
    
    registrosAgregados.forEach((reg: any) => {
      const chave = `${reg.ano}-${reg.mes}`;
      if (!consolidadoPorMes.has(chave)) {
        consolidadoPorMes.set(chave, {
          id: `bpma-${chave}`,
          data: reg.data,
          quantidade: 0,
          quantidade_total: 0,
          quantidade_solturas: 0,
          quantidade_obitos: 0,
          quantidade_feridos: 0,
          quantidade_filhotes: 0,
          quantidade_filhote: 0,
          quantidade_adulto: 0,
          atropelamento: null,
          regiao_administrativa: null,
          origem: { nome: 'Resgate de Fauna' },
          destinacao: null,
          estado_saude: null,
          estagio_vida: null,
          desfecho: null,
          especie: null,
          tipo_registro: 'agregado',
          mes: reg.mes,
          ano: reg.ano
        });
      }
      
      const consolidado = consolidadoPorMes.get(chave)!;
      consolidado.quantidade += reg.quantidade;
      consolidado.quantidade_total += reg.quantidade_total;
      consolidado.quantidade_solturas += reg.quantidade_solturas;
      consolidado.quantidade_obitos += reg.quantidade_obitos;
      consolidado.quantidade_feridos += reg.quantidade_feridos;
      consolidado.quantidade_filhotes += reg.quantidade_filhotes;
      consolidado.quantidade_filhote += reg.quantidade_filhote;
      if (reg.atropelamento === 'Sim') {
        consolidado.atropelamento = 'Sim';
      }
    });
    
    return Array.from(consolidadoPorMes.values());
  } catch (err: any) {
    console.warn('⚠️ [Dashboard] Erro ao buscar dados agregados:', err);
    return [];
  }
};

/**
 * Busca dados por espécie das tabelas fat_resgates_diarios_* (2021-2024)
 * Mantém dados detalhados por espécie
 */
const fetchBpmaPorEspecie = async (
  filters: FilterState
): Promise<any[]> => {
  try {
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    if (ano < 2021 || ano > 2024) {
      return [];
    }
    
    const tabela = `fat_resgates_diarios_${ano}`;
    const { data, error } = await fetchDataWithoutJoins(tabela, filters);
    
    if (error) {
      console.warn(`⚠️ [Dashboard] Erro ao buscar ${tabela}:`, error);
      return [];
    }
    
    // Normalizar dados por espécie
    return (data || []).map((h: any) => ({
      id: h.id || `hist-${Math.random().toString(36).substring(7)}`,
      data: h.data_ocorrencia || (h.mes ? 
        new Date(ano, 
          ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].indexOf(h.mes), 
          1).toISOString().split('T')[0] : null),
      quantidade: h.quantidade_resgates || 0,
      quantidade_total: h.quantidade_resgates || 0,
      quantidade_adulto: 0,
      quantidade_filhote: h.quantidade_filhotes || 0,
      quantidade_soltura: h.quantidade_solturas || 0,
      quantidade_obito: h.quantidade_obitos || 0,
      quantidade_ferido: h.quantidade_feridos || 0,
      atropelamento: null,
      regiao_administrativa: null,
      origem: { nome: 'Resgate de Fauna' },
      destinacao: null,
      estado_saude: null,
      estagio_vida: null,
      desfecho: null,
      especie: {
        nome_popular: h.nome_popular || '',
        nome_cientifico: h.nome_cientifico || '',
        classe_taxonomica: h.classe_taxonomica || '',
        ordem_taxonomica: h.ordem_taxonomica || '',
        estado_de_conservacao: h.estado_de_conservacao || '',
        tipo_de_fauna: h.tipo_de_fauna || ''
      },
      tipo_registro: 'historico'
    }));
  } catch (err: any) {
    console.warn('⚠️ [Dashboard] Erro ao buscar dados por espécie:', err);
    return [];
  }
};

export const fetchRegistryData = async (filters: FilterState): Promise<any[]> => {
  try {
    console.log("🔍 [Dashboard] Iniciando busca de dados com filtros:", filters);
    console.log("🔍 [Dashboard] Ano do filtro:", filters.year, "Tipo:", typeof filters.year);
    
    // Normalizar o ano para número (pode vir como string)
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    let todosRegistros: any[] = [];
    
    // Para 2020, usar apenas tabela de espécies
    if (ano === 2020) {
      console.log(`📊 [Dashboard] Buscando dados de 2020 (por espécie)...`);
      const { data, error } = await fetchDataWithoutJoins('fat_resgates_diarios_2020', filters);
      if (!error && data) {
        todosRegistros = data.map((h: any) => ({
          id: h.id || `hist-${Math.random().toString(36).substring(7)}`,
          data: h.data_ocorrencia || null,
          quantidade: h.quantidade_resgates || 0,
          quantidade_total: h.quantidade_resgates || 0,
          quantidade_adulto: 0,
          quantidade_filhote: h.quantidade_filhotes || 0,
          quantidade_soltura: h.quantidade_solturas || 0,
          quantidade_obito: h.quantidade_obitos || 0,
          quantidade_ferido: h.quantidade_feridos || 0,
          atropelamento: null,
          regiao_administrativa: null,
          origem: { nome: 'Resgate de Fauna' },
          destinacao: null,
          estado_saude: null,
          estagio_vida: null,
          desfecho: null,
          especie: {
            nome_popular: h.nome_popular || '',
            nome_cientifico: h.nome_cientifico || '',
            classe_taxonomica: h.classe_taxonomica || '',
            ordem_taxonomica: h.ordem_taxonomica || '',
            estado_de_conservacao: h.estado_de_conservacao || '',
            tipo_de_fauna: h.tipo_de_fauna || ''
          },
          tipo_registro: 'historico'
        }));
        console.log(`✅ [Dashboard] Dados de 2020 carregados:`, todosRegistros.length, 'registros');
      }
    }
    // Para 2021-2024, usar NOVAS tabelas: bpma_fato_mensal (agregado) + fat_resgates_diarios_* (por espécie)
    else if (ano >= 2021 && ano <= 2024) {
      console.log(`📊 [Dashboard] Buscando dados de ${ano} usando novas tabelas...`);
      
      // Buscar dados agregados (para estatísticas gerais)
      const dadosAgregados = await fetchBpmaAgregados(filters);
      console.log(`✅ [Dashboard] Dados agregados (bpma_fato_mensal):`, dadosAgregados.length, 'registros');
      
      // Buscar dados por espécie (importantes para análises detalhadas)
      const dadosPorEspecie = await fetchBpmaPorEspecie(filters);
      console.log(`✅ [Dashboard] Dados por espécie (fat_resgates_diarios_${ano}):`, dadosPorEspecie.length, 'registros');
      
      // Priorizar dados por espécie (mais detalhados), usar agregados como fallback
      todosRegistros = dadosPorEspecie.length > 0 ? dadosPorEspecie : dadosAgregados;
      console.log(`✅ [Dashboard] Total de registros para ${ano}:`, todosRegistros.length);
    }
    // Para 2025, usar fat_resgates_diarios_2025_especies (dados históricos) e fat_registros_de_resgate (novos registros)
    else if (ano === 2025) {
      console.log(`📊 [Dashboard] Buscando dados de 2025...`);
      
      // Buscar dados por espécie (importados da planilha)
      const { data: dataEspecies, error: errorEspecies } = await fetchDataWithoutJoins('fat_resgates_diarios_2025_especies', filters);
      
      if (!errorEspecies && dataEspecies) {
        const especiesNormalizadas = dataEspecies.map((h: any) => ({
          id: h.id,
          data: h.data_ocorrencia,
          quantidade: h.quantidade_resgates || 0,
          quantidade_total: h.quantidade_resgates || 0,
          quantidade_adulto: 0,
          quantidade_filhote: h.quantidade_filhotes || 0,
          quantidade_soltura: h.quantidade_solturas || 0,
          quantidade_obito: h.quantidade_obitos || 0,
          quantidade_ferido: h.quantidade_feridos || 0,
          atropelamento: null,
          regiao_administrativa: null,
          origem: { nome: 'Resgate de Fauna' },
          destinacao: null,
          estado_saude: null,
          estagio_vida: null,
          desfecho: null,
          especie: {
            nome_popular: h.nome_popular || '',
            nome_cientifico: h.nome_cientifico || '',
            classe_taxonomica: h.classe_taxonomica || '',
            tipo_de_fauna: h.tipo_de_fauna || ''
          },
          tipo_registro: 'historico'
        }));
        todosRegistros = [...todosRegistros, ...especiesNormalizadas];
      }
      
      // Também buscar novos registros cadastrados
      const { data: dataRegistros, error: errorRegistros } = await fetchDataWithoutJoins('fat_registros_de_resgate', filters);
      if (!errorRegistros && dataRegistros) {
        todosRegistros = [...todosRegistros, ...dataRegistros];
      }
      
      console.log(`✅ [Dashboard] Dados carregados para 2025:`, todosRegistros.length, 'registros');
    }
    // Para 2026+, usar fat_registros_de_resgate
    else {
      console.log(`📊 [Dashboard] Buscando dados de ${ano} (2026+)...`);
      const { data, error } = await fetchDataWithoutJoins('fat_registros_de_resgate', filters);
      if (!error && data) {
        todosRegistros = data || [];
        console.log(`✅ [Dashboard] Dados carregados de fat_registros_de_resgate:`, todosRegistros.length, 'registros');
      } else {
        console.warn(`⚠️ [Dashboard] Erro ao buscar de fat_registros_de_resgate:`, error);
      }
    }
    
    // Aplicar filtros avançados nos dados já enriquecidos
    let registrosFiltrados = todosRegistros || [];
    
    // Filtrar por classe taxonômica (se não foi aplicado na query)
    if (filters.classeTaxonomica) {
      registrosFiltrados = registrosFiltrados.filter((r: any) => 
        r.especie?.classe_taxonomica === filters.classeTaxonomica ||
        r.classe_taxonomica === filters.classeTaxonomica
      );
    }
    
    // Filtrar por exótica
    if (filters.exotica !== null) {
      registrosFiltrados = registrosFiltrados.filter((r: any) => 
        r.especie?.exotica === filters.exotica ||
        (filters.exotica === false && (r.especie?.exotica === null || r.especie?.exotica === false))
      );
    }
    
    // Filtrar por ameaçada
    if (filters.ameacada !== null) {
      registrosFiltrados = registrosFiltrados.filter((r: any) => 
        r.especie?.ameacada === filters.ameacada ||
        (filters.ameacada === false && (r.especie?.ameacada === null || r.especie?.ameacada === false))
      );
    }
    
    // SEMPRE retornar array (mesmo que vazio) - nunca lançar erro
    return registrosFiltrados;
  } catch (error: any) {
    // Log detalhado do erro mas NUNCA lançar - sempre retornar array vazio
    console.warn('⚠️ [Dashboard] Erro ao buscar dados (retornando array vazio):', error?.message || error);
    console.warn('⚠️ [Dashboard] Stack:', error?.stack);
    // Retornar array vazio ao invés de lançar erro - isso evita que o React Query marque como erro
    return [];
  }
};
