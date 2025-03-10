
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
  
  console.log(`Buscando espécies para classe: ${classeTaxonomica}`);
  
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
    console.log(`Buscando dados da tabela: ${tabela}`);
    
    // Adicionando log detalhado da consulta
    console.log(`SELECT nome_popular FROM ${tabela} ORDER BY nome_popular`);
    
    const { data, error } = await supabase
      .from(tabela)
      .select('nome_popular')
      .order('nome_popular');
      
    if (error) {
      console.error(`Erro ao buscar espécies da tabela ${tabela}:`, error);
      return { data: [], error: error.message };
    }
    
    console.log(`Dados recebidos da tabela ${tabela}:`, data);
    
    if (!data || !Array.isArray(data)) {
      console.log(`Nenhum dado encontrado na tabela ${tabela} ou formato inválido`);
      return { data: [], error: null };
    }
    
    const listaFiltrada = data
      .filter(item => item && typeof item === 'object' && 'nome_popular' in item)
      .map(item => ({ nome_popular: item.nome_popular || 'Nome não disponível' }));
      
    console.log(`Lista filtrada de ${tabela}:`, listaFiltrada);
    return { data: listaFiltrada, error: null };
  } catch (err) {
    console.error(`Exceção ao buscar espécies da tabela ${tabela}:`, err);
    return { data: [], error: 'Ocorreu um erro ao carregar a lista de espécies' };
  }
};
