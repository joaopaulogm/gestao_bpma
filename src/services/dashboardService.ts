
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';
import { format, endOfMonth } from 'date-fns';

/**
 * Fetches registry data from Supabase based on filters
 * Inclui dados atuais (fat_registros_de_resgate) e históricos (fat_resgates_diarios_2020a2024)
 */
/**
 * Tenta buscar dados de uma tabela específica, com fallback para tabela padrão
 */
/**
 * Busca dados sem usar joins (para tabelas sem foreign keys configuradas)
 */
const fetchDataWithoutJoins = async (
  tableName: string,
  filters: FilterState
): Promise<{ data: any[]; error: any }> => {
  try {
    let query = supabase.from(tableName).select('*');
    
    // Aplicar filtros de data
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('data', startDate).lte('data', endDate);
    
    // Aplicar filtro de mês se especificado
    if (filters.month !== null) {
      const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      const monthEnd = format(
        endOfMonth(new Date(filters.year, filters.month, 1)),
        'yyyy-MM-dd'
      );
      query = query.gte('data', monthStart).lte('data', monthEnd);
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
    
    const { data, error } = await query;
    
    if (error) {
      return { data: [], error };
    }
    
    // Buscar dados relacionados manualmente
    const enrichedData = await enrichDataWithRelations(data || []);
    
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
    supabase.from('dim_desfecho').select('id, nome, tipo'),
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

const fetchFromTableWithFallback = async (
  tableName: string,
  fallbackTable: string,
  selectQuery: string,
  filters: FilterState
): Promise<{ data: any[]; error: any }> => {
  // Tentar tabela principal primeiro com joins
  try {
    let query = supabase.from(tableName).select(selectQuery);
    
    // Aplicar filtros de data
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('data', startDate).lte('data', endDate);
    
    // Aplicar filtro de mês se especificado
    if (filters.month !== null) {
      const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
      const monthEnd = format(
        endOfMonth(new Date(filters.year, filters.month, 1)),
        'yyyy-MM-dd'
      );
      query = query.gte('data', monthStart).lte('data', monthEnd);
    }
    
    // Aplicar filtro de classe taxonômica se especificado
    if (filters.classeTaxonomica) {
      query = query.eq('especie.classe_taxonomica', filters.classeTaxonomica);
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
    
    const { data, error } = await query;
    
    // Se não houver erro, retornar dados
    if (!error) {
      console.log(`✅ Dados carregados de ${tableName} com joins:`, data?.length || 0, 'registros');
      return { data: data || [], error: null };
    }
    
    // Se erro é de relacionamento (PGRST200), tentar sem joins
    if (error.code === 'PGRST200' || error.message?.includes('relationship') || error.message?.includes('foreign key')) {
      console.warn(`⚠️ Erro de relacionamento em ${tableName}, tentando sem joins...`);
      return fetchDataWithoutJoins(tableName, filters);
    }
    
    // Se erro indica que tabela não existe, tentar fallback
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('permission')) {
      console.warn(`⚠️ Tabela ${tableName} não acessível (${error.message}), tentando fallback ${fallbackTable}`);
      
      // Tentar fallback apenas se não for a mesma tabela
      if (tableName !== fallbackTable) {
        return fetchFromTableWithFallback(fallbackTable, fallbackTable, selectQuery, filters);
      }
    }
    
    // Para outros erros, tentar sem joins
    console.warn(`⚠️ Erro ao buscar de ${tableName}, tentando sem joins:`, error.message || error);
    return fetchDataWithoutJoins(tableName, filters);
  } catch (err: any) {
    console.warn(`⚠️ Exceção ao buscar de ${tableName}, tentando sem joins:`, err?.message || err);
    
    // Tentar sem joins primeiro
    const resultWithoutJoins = await fetchDataWithoutJoins(tableName, filters);
    if (!resultWithoutJoins.error) {
      return resultWithoutJoins;
    }
    
    // Se não for a tabela de fallback, tentar fallback
    if (tableName !== fallbackTable) {
      console.log(`🔄 Tentando fallback para ${fallbackTable}`);
      return fetchFromTableWithFallback(fallbackTable, fallbackTable, selectQuery, filters);
    }
    
    // Se já estamos no fallback, retornar vazio sem erro
    return { data: [], error: null };
  }
};

export const fetchRegistryData = async (filters: FilterState): Promise<any[]> => {
  try {
    console.log("🔍 [Dashboard] Iniciando busca de dados com filtros:", filters);
    
    // Determinar qual tabela usar baseado no ano
    // Para 2025, usar fat_resgates_diarios_2025 (nome correto da tabela)
    // Para outros anos, usar fat_registros_de_resgate
    const tabelaResgates = filters.year === 2025 
      ? 'fat_resgates_diarios_2025' 
      : 'fat_registros_de_resgate';
    
    let registrosAtuais: any[] = [];
    
    // Para 2025, sabemos que a tabela pode não ter foreign keys, então usar busca sem joins diretamente
    // Para outros anos, tentar com joins primeiro
    if (filters.year === 2025) {
      console.log(`📊 [Dashboard] Buscando de ${tabelaResgates} sem joins (2025 - sem foreign keys)...`);
      const { data, error } = await fetchDataWithoutJoins(tabelaResgates, filters);
      if (!error) {
        registrosAtuais = data || [];
        console.log(`✅ [Dashboard] Dados carregados de ${tabelaResgates}:`, registrosAtuais.length, 'registros');
      } else {
        console.warn(`⚠️ [Dashboard] Erro ao buscar de ${tabelaResgates}, tentando fallback...`);
        // Tentar fallback para tabela padrão
        const { data: fallbackData, error: fallbackError } = await fetchDataWithoutJoins('fat_registros_de_resgate', filters);
        if (!fallbackError) {
          registrosAtuais = fallbackData || [];
          console.log(`✅ [Dashboard] Dados carregados do fallback:`, registrosAtuais.length, 'registros');
        } else {
          console.warn(`⚠️ [Dashboard] Erro no fallback também:`, fallbackError);
        }
      }
    } else {
      // Para outros anos, tentar com joins primeiro
      console.log(`📊 [Dashboard] Tentando buscar de ${tabelaResgates} com joins...`);
      try {
        const selectQuery = `
          *,
          regiao_administrativa:dim_regiao_administrativa(nome),
          origem:dim_origem(nome),
          destinacao:dim_destinacao(nome),
          estado_saude:dim_estado_saude(nome),
          estagio_vida:dim_estagio_vida(nome),
          desfecho:dim_desfecho(nome, tipo),
          especie:dim_especies_fauna(*)
        `;
        
        let query = supabase.from(tabelaResgates).select(selectQuery);
        
        // Aplicar filtros de data
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte('data', startDate).lte('data', endDate);
        
        // Aplicar filtro de mês se especificado
        if (filters.month !== null) {
          const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
          const monthEnd = format(
            endOfMonth(new Date(filters.year, filters.month, 1)),
            'yyyy-MM-dd'
          );
          query = query.gte('data', monthStart).lte('data', monthEnd);
        }
        
        // Aplicar filtro de classe taxonômica se especificado
        if (filters.classeTaxonomica) {
          query = query.eq('especie.classe_taxonomica', filters.classeTaxonomica);
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
        
        const { data, error } = await query;
        
        if (!error) {
          console.log(`✅ [Dashboard] Dados carregados de ${tabelaResgates} com joins:`, data?.length || 0, 'registros');
          registrosAtuais = data || [];
        } else {
          // Se erro é de relacionamento (PGRST200), tentar sem joins
          if (error.code === 'PGRST200' || error.message?.includes('relationship') || error.message?.includes('foreign key')) {
            console.warn(`⚠️ [Dashboard] Erro de relacionamento (PGRST200) em ${tabelaResgates}, buscando sem joins...`);
            const { data: dataSemJoins, error: errorSemJoins } = await fetchDataWithoutJoins(tabelaResgates, filters);
            if (!errorSemJoins) {
              registrosAtuais = dataSemJoins || [];
              console.log(`✅ [Dashboard] Dados carregados de ${tabelaResgates} sem joins:`, registrosAtuais.length, 'registros');
            }
          } else {
            console.warn(`⚠️ [Dashboard] Erro ao buscar de ${tabelaResgates}:`, error.message || error);
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ [Dashboard] Exceção ao buscar de ${tabelaResgates}, tentando sem joins:`, err?.message || err);
        const { data: dataSemJoins, error: errorSemJoins } = await fetchDataWithoutJoins(tabelaResgates, filters);
        if (!errorSemJoins) {
          registrosAtuais = dataSemJoins || [];
          console.log(`✅ [Dashboard] Dados carregados de ${tabelaResgates} sem joins (após exceção):`, registrosAtuais.length, 'registros');
        }
      }
    }
    
    console.log(`✅ [Dashboard] Registros atuais carregados:`, registrosAtuais?.length || 0);
  
    
    // Buscar dados históricos (2020-2024) se o filtro de ano for entre 2020-2024
    let registrosHistoricos: any[] = [];
    
    if (filters.year >= 2020 && filters.year <= 2024) {
      try {
        let queryHistoricos = supabase
          .from('fat_resgates_diarios_2020a2024')
          .select('*');
        
        // Aplicar filtro de ano
        queryHistoricos = queryHistoricos.eq('Ano', filters.year);
        
        // Aplicar filtro de mês se especificado
        if (filters.month !== null) {
          const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
          const mesNome = meses[filters.month];
          queryHistoricos = queryHistoricos.eq('Mês', mesNome);
        }
        
        // Aplicar filtro de classe taxonômica se especificado
        if (filters.classeTaxonomica) {
          queryHistoricos = queryHistoricos.eq('classe_taxonomica', filters.classeTaxonomica);
        }
        
        const { data: historicos, error: errorHistoricos } = await queryHistoricos;
        
        if (errorHistoricos) {
          console.warn('Erro ao buscar dados históricos do dashboard:', errorHistoricos);
          // Continuar sem dados históricos
        } else {
          registrosHistoricos = historicos || [];
        }
      } catch (err) {
        console.warn('Exceção ao buscar dados históricos:', err);
        // Continuar sem dados históricos
      }
    }
    
    // Combinar e normalizar dados históricos para o formato esperado
    const historicosNormalizados = registrosHistoricos.map((h: any) => ({
      id: h.id || `hist-${Math.random().toString(36).substring(7)}`,
      data: h.data_ocorrencia || (h.Ano && h.Mês ? 
        new Date(h.Ano, 
          ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].indexOf(h.Mês), 
          1).toISOString().split('T')[0] : null),
      quantidade: h.quantidade_resgates || 0,
      quantidade_total: h.quantidade_resgates || 0,
      quantidade_adulto: 0,
      quantidade_filhote: h.quantidade_filhotes || 0,
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
    
    // Combinar dados atuais e históricos
    const todosRegistros = [
      ...(registrosAtuais || []),
      ...historicosNormalizados
    ];
    
    console.log(`✅ [Dashboard] Total de registros combinados: ${todosRegistros.length} (${registrosAtuais?.length || 0} atuais + ${historicosNormalizados.length} históricos)`);
    
    // SEMPRE retornar array (mesmo que vazio) - nunca lançar erro
    return todosRegistros || [];
  } catch (error: any) {
    // Log detalhado do erro mas NUNCA lançar - sempre retornar array vazio
    console.warn('⚠️ [Dashboard] Erro ao buscar dados (retornando array vazio):', error?.message || error);
    console.warn('⚠️ [Dashboard] Stack:', error?.stack);
    // Retornar array vazio ao invés de lançar erro - isso evita que o React Query marque como erro
    return [];
  }
};
