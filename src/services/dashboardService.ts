
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
 */
const fetchDataWithoutJoins = async (
  tableName: string,
  filters: FilterState
): Promise<{ data: any[]; error: any }> => {
  try {
    let query = supabaseAny.from(tableName).select('*');
    
    // Normalizar o ano para número
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    // Aplicar filtros de data
    // Para tabelas fat_resgates_diarios_*, verificar qual campo de data usar
    const campoData = tableName.includes('fat_resgates_diarios_2025') ? 'data' : 
                      tableName.includes('fat_resgates_diarios_') ? 'data_ocorrencia' : 'data';
    
    const startDate = `${ano}-01-01`;
    const endDate = `${ano}-12-31`;
    
    // Tentar usar o campo 'data' primeiro, se falhar, usar 'data_ocorrencia'
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

export const fetchRegistryData = async (filters: FilterState): Promise<any[]> => {
  try {
    console.log("🔍 [Dashboard] Iniciando busca de dados com filtros:", filters);
    console.log("🔍 [Dashboard] Ano do filtro:", filters.year, "Tipo:", typeof filters.year);
    
    // Normalizar o ano para número (pode vir como string)
    const ano = typeof filters.year === 'string' ? parseInt(filters.year, 10) : filters.year;
    
    // Determinar qual tabela usar baseado no ano
    // Para 2025, usar fat_resgates_diarios_2025 (nome correto da tabela)
    const tabelaResgates = (ano === 2025) 
      ? 'fat_resgates_diarios_2025' 
      : 'fat_resgates_diarios_2025'; // Fallback para 2025 também
    
    console.log(`📊 [Dashboard] Tabela selecionada: ${tabelaResgates} (ano: ${ano}, original: ${filters.year})`);
    
    let registrosAtuais: any[] = [];
    
    // Usar busca sem joins diretamente para evitar erros
    console.log(`📊 [Dashboard] Buscando de ${tabelaResgates} sem joins...`);
    const { data, error } = await fetchDataWithoutJoins(tabelaResgates, filters);
    if (!error) {
      registrosAtuais = data || [];
      console.log(`✅ [Dashboard] Dados carregados de ${tabelaResgates}:`, registrosAtuais.length, 'registros');
    } else {
      console.warn(`⚠️ [Dashboard] Erro ao buscar de ${tabelaResgates}:`, error);
    }
    
    console.log(`✅ [Dashboard] Registros atuais carregados:`, registrosAtuais?.length || 0);
    
    // Buscar dados históricos (2020-2024) se o filtro de ano for entre 2020-2024
    let registrosHistoricos: any[] = [];
    
    if (ano >= 2020 && ano <= 2024) {
      try {
        let queryHistoricos = supabaseAny
          .from('fat_resgates_diarios_2020a2024')
          .select('*');
        
        // Aplicar filtro de ano
        queryHistoricos = queryHistoricos.eq('Ano', ano);
        
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
