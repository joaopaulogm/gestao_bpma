
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';
import { format, endOfMonth } from 'date-fns';

/**
 * Fetches registry data from Supabase based on filters
 */
export const fetchRegistryData = async (filters: FilterState) => {
  console.log("Fetching dashboard data with filters:", filters);
  
  // Construir query de data base com joins para as tabelas de dimensão
  let query = supabase
    .from('registros')
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
  
  // Aplicar filtro de origem se especificado (usando ID da dimensão)
  if (filters.origem) {
    // Buscar o ID da origem pelo nome
    const { data: origemData } = await supabase
      .from('dim_origem')
      .select('id')
      .ilike('nome', filters.origem)
      .maybeSingle();
    
    if (origemData) {
      query = query.eq('origem_id', origemData.id);
    }
  }
  
  const { data: registros, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
  
  return registros;
};
