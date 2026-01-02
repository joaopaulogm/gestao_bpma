
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';
import { format, endOfMonth } from 'date-fns';

/**
 * Fetches registry data from Supabase based on filters
 * Inclui dados atuais (fat_registros_de_resgate) e históricos (fat_resgates_diarios_2020a2024)
 */
export const fetchRegistryData = async (filters: FilterState) => {
  console.log("Fetching dashboard data with filters:", filters);
  
  // Buscar dados atuais de resgates (2025+)
  let queryAtuais = supabase
    .from('fat_registros_de_resgate')
    .select(`
      *,
      regiao_administrativa:dim_regiao_administrativa(nome),
      origem:dim_origem(nome),
      destinacao:dim_destinacao(nome),
      estado_saude:dim_estado_saude(nome),
      estagio_vida:dim_estagio_vida(nome),
      desfecho:dim_desfecho(nome, tipo),
      especie:dim_especies_fauna(*)
    `);
  
  // Aplicar filtro de ano
  const startDate = `${filters.year}-01-01`;
  const endDate = `${filters.year}-12-31`;
  queryAtuais = queryAtuais.gte('data', startDate).lte('data', endDate);
  
  // Aplicar filtro de mês se especificado
  if (filters.month !== null) {
    const monthStart = `${filters.year}-${String(filters.month + 1).padStart(2, '0')}-01`;
    const monthEnd = format(
      endOfMonth(new Date(filters.year, filters.month, 1)),
      'yyyy-MM-dd'
    );
    
    queryAtuais = queryAtuais.gte('data', monthStart).lte('data', monthEnd);
  }
  
  // Aplicar filtro de classe taxonômica se especificado
  if (filters.classeTaxonomica) {
    queryAtuais = queryAtuais.eq('especie.classe_taxonomica', filters.classeTaxonomica);
  }
  
  // Aplicar filtro de origem se especificado (usando ID da dimensão)
  if (filters.origem) {
    // Buscar o ID da origem pelo nome
    const { data: origemData } = await supabase
      .from('dim_origem')
      .select('id')
      .ilike('nome', filters.origem)
      .maybeSingle();
    
    if (origemData) {
      queryAtuais = queryAtuais.eq('origem_id', origemData.id);
    }
  }
  
  const { data: registrosAtuais, error: errorAtuais } = await queryAtuais;
  
  if (errorAtuais) {
    console.error('Erro ao buscar dados atuais do dashboard:', errorAtuais);
    throw errorAtuais;
  }
  
  // Buscar dados históricos (2020-2024) se o filtro de ano for entre 2020-2024
  let registrosHistoricos: any[] = [];
  
  if (filters.year >= 2020 && filters.year <= 2024) {
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
      console.error('Erro ao buscar dados históricos do dashboard:', errorHistoricos);
      // Não lançar erro, apenas logar - continuar com dados atuais
    } else {
      registrosHistoricos = historicos || [];
    }
  }
  
  // Combinar e normalizar dados históricos para o formato esperado
  const historicosNormalizados = registrosHistoricos.map(h => ({
    id: h.id,
    data: h.data_ocorrencia || (h.Ano && h.Mês ? 
      new Date(h.Ano, 
        ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].indexOf(h.Mês), 
        1).toISOString().split('T')[0] : null),
    quantidade: h.quantidade_resgates || 0,
    quantidade_adulto: 0,
    quantidade_filhote: h.quantidade_filhotes || 0,
    atropelamento: null,
    regiao_administrativa: null,
    origem: { nome: 'Resgate de Fauna' }, // Assumir que dados históricos são resgates
    destinacao: null,
    estado_saude: null,
    estagio_vida: null,
    desfecho: null,
    especie: {
      nome_popular: h.nome_popular,
      nome_cientifico: h.nome_cientifico,
      classe_taxonomica: h.classe_taxonomica,
      ordem_taxonomica: h.ordem_taxonomica,
      estado_de_conservacao: h.estado_de_conservacao,
      tipo_de_fauna: h.tipo_de_fauna
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
};
