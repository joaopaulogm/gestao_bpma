
import { supabase } from './supabaseClient';

export interface Especie {
  nome_popular: string;
}

/**
 * Busca as espécies com base na classe taxonômica selecionada
 */
export const buscarEspeciesPorClasse = async (classeTaxonomica: string): Promise<{ 
  data: Especie[], 
  error: string | null 
}> => {
  if (!classeTaxonomica) {
    return { data: [], error: null };
  }
  
  console.log(`Buscando espécies para: ${classeTaxonomica}`);
  
  let tabela = '';
  switch (classeTaxonomica) {
    case 'Ave':
      tabela = 'lista_ave';
      break;
    case 'Mamífero':
      tabela = 'lista_mamifero';
      break;
    case 'Réptil':
      tabela = 'lista_reptil';
      break;
    case 'Peixe':
      tabela = 'lista_peixe';
      break;
    default:
      return { data: [], error: null };
  }
  
  try {
    const { data, error } = await supabase
      .from(tabela)
      .select('nome_popular')
      .order('nome_popular');
      
    if (error) {
      console.error('Erro ao buscar espécies:', error);
      return { data: [], error: error.message };
    } else {
      console.log('Espécies carregadas:', data?.length || 0);
      console.log('Exemplo de espécie:', data?.[0]);
      
      // Garantir que os dados têm a estrutura correta
      if (data && Array.isArray(data)) {
        // Verificar se cada item tem a propriedade nome_popular
        const listaFiltrada = data.filter(item => item && typeof item === 'object' && 'nome_popular' in item && item.nome_popular);
        return { data: listaFiltrada, error: null };
      } else {
        console.log('Dados não estão no formato esperado:', data);
        return { data: [], error: 'Dados de espécies em formato inválido' };
      }
    }
  } catch (err) {
    console.error('Exceção ao buscar espécies:', err);
    return { data: [], error: 'Ocorreu um erro ao carregar a lista de espécies' };
  }
};
