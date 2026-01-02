
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
const fetchFromTableWithFallback = async (
  tableName: string,
  fallbackTable: string,
  selectQuery: string,
  filters: FilterState
) => {
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
      const { data: origemData } = await supabase
        .from('dim_origem')
        .select('id')
        .ilike('nome', filters.origem)
        .maybeSingle();
      
      if (origemData) {
        query = query.eq('origem_id', origemData.id);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      // Se erro indica que tabela não existe, tentar fallback
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn(`Tabela ${tableName} não encontrada, usando fallback ${fallbackTable}`);
        return fetchFromTableWithFallback(fallbackTable, fallbackTable, selectQuery, filters);
      }
      throw error;
    }
    
    return { data: data || [], error: null };
  } catch (err: any) {
    // Se ainda houver erro e não for a tabela de fallback, tentar fallback
    if (tableName !== fallbackTable && (err.code === '42P01' || err.message?.includes('does not exist'))) {
      console.warn(`Erro ao acessar ${tableName}, usando fallback ${fallbackTable}`);
      return fetchFromTableWithFallback(fallbackTable, fallbackTable, selectQuery, filters);
    }
    throw err;
  }
};

export const fetchRegistryData = async (filters: FilterState): Promise<any[]> => {
  try {
    console.log("Fetching dashboard data with filters:", filters);
    
    // Determinar qual tabela usar baseado no ano
    const tabelaResgates = filters.year === 2025 
      ? 'fat_registros_de_resgate_2025' 
      : 'fat_registros_de_resgate';
    const tabelaFallback = 'fat_registros_de_resgate';
    
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
    
    // Buscar dados atuais de resgates com fallback
    const { data: registrosAtuais, error: errorAtuais } = await fetchFromTableWithFallback(
      tabelaResgates,
      tabelaFallback,
      selectQuery,
      filters
    );
    
    if (errorAtuais) {
      console.error('Erro ao buscar dados atuais do dashboard:', errorAtuais);
      // Retornar array vazio ao invés de lançar erro para não quebrar o dashboard
      return [];
    }
  
    
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
    
    console.log(`Total de registros: ${todosRegistros.length} (${registrosAtuais?.length || 0} atuais + ${historicosNormalizados.length} históricos)`);
    
    return todosRegistros;
  } catch (error) {
    console.error('Erro crítico ao buscar dados do dashboard:', error);
    // Retornar array vazio ao invés de lançar erro
    return [];
  }
};
