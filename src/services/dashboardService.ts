
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/hooks/useFilterState';
import { format, endOfMonth } from 'date-fns';

/**
 * Fetches registry data from Supabase based on filters
 */
export const fetchRegistryData = async (filters: FilterState) => {
  console.log("Fetching dashboard data with filters:", filters);
  
  // Construir query de data base
  let query = supabase
    .from('registros')
    .select('*');
  
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
    query = query.eq('classe_taxonomica', filters.classeTaxonomica);
  }
  
  // Aplicar filtro de origem se especificado
  if (filters.origem) {
    query = query.eq('origem', filters.origem);
  }
  
  const { data: registros, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
  
  return registros;
};
