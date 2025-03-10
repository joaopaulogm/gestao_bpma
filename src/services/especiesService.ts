
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
    
    // Adicionando logs detalhados da consulta e verificação de conexão
    console.log(`SELECT nome_popular FROM ${tabela} ORDER BY nome_popular`);
    console.log('Verificando objeto supabase:', supabase ? 'Inicializado' : 'Não inicializado');
    
    // Consulta de teste para ver se o tabela existe
    const { data: tableExists, error: tableError } = await supabase
      .from(tabela)
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error(`Erro ao verificar se a tabela ${tabela} existe:`, tableError);
      return { 
        data: [], 
        error: `Erro ao verificar a tabela ${tabela}: ${tableError.message}` 
      };
    }
    
    console.log(`Tabela ${tabela} existe:`, tableExists !== null);
    
    // Vamos testar dados mockados caso a tabela esteja vazia
    if (!tableExists || tableExists.length === 0) {
      console.log(`Tabela ${tabela} vazia ou não encontrada, usando dados mockados`);
      
      // Dados mockados para teste
      const mockData: Especie[] = [
        { nome_popular: "Espécie de teste 1" },
        { nome_popular: "Espécie de teste 2" },
        { nome_popular: "Espécie de teste 3" }
      ];
      
      return { data: mockData, error: null };
    }
    
    // Continuamos com a consulta normal
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
