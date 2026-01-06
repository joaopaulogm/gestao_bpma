
import { ChartDataItem, EspecieQuantidade, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into most rescued species chart data
 */
export const transformMostRescuedSpeciesData = (resgates: Registro[]): EspecieQuantidade[] => {
  if (!Array.isArray(resgates)) return [];
  
  const especiesResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    // Para dados históricos, pode ter nome_popular diretamente no registro
    const nomePopular = reg?.especie?.nome_popular || (reg as any).nome_popular || 'Espécie não identificada';
    const nomeCientifico = reg?.especie?.nome_cientifico || (reg as any).nome_cientifico || '';
    
    if (nomePopular && nomePopular !== 'Espécie não identificada') {
      const chave = nomeCientifico ? `${nomePopular} (${nomeCientifico})` : nomePopular;
      
      // Para dados históricos, usar quantidade_resgates; para atuais, usar quantidade_total
      const isHistorical = (reg as any).tipo_registro === 'historico' || 
                          (reg as any).quantidade_resgates !== undefined;
      
      const quantidade = isHistorical 
        ? ((reg as any).quantidade_resgates ?? (reg as any).quantidade ?? (reg as any).quantidade_total ?? 1)
        : (reg.quantidade_total ?? reg.quantidade ?? 1);
      
      const qtdNum = typeof quantidade === 'number' && !isNaN(quantidade) ? quantidade : 1;
      especiesResgateMap.set(chave, (especiesResgateMap.get(chave) || 0) + qtdNum);
    }
  });
  
  return Array.from(especiesResgateMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade: quantidade || 0 }))
    .filter(item => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into most seized species chart data
 */
export const transformMostSeizedSpeciesData = (apreensoes: Registro[]): EspecieQuantidade[] => {
  if (!Array.isArray(apreensoes)) return [];
  
  const especiesApreensaoMap = new Map<string, number>();
  apreensoes.forEach(reg => {
    if (reg?.especie?.nome_popular) {
      const nomePopular = reg.especie.nome_popular || 'Espécie não identificada';
      const nomeCientifico = reg.especie.nome_cientifico || '';
      const chave = nomeCientifico ? `${nomePopular} (${nomeCientifico})` : nomePopular;
      const quantidade = reg.quantidade_total ?? reg.quantidade ?? 1;
      const qtdNum = typeof quantidade === 'number' && !isNaN(quantidade) ? quantidade : 1;
      especiesApreensaoMap.set(chave, (especiesApreensaoMap.get(chave) || 0) + qtdNum);
    }
  });
  
  return Array.from(especiesApreensaoMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade: quantidade || 0 }))
    .filter(item => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into roadkill species chart data
 */
export const transformRoadkillSpeciesData = (animaisAtropelados: Registro[]): EspecieQuantidade[] => {
  if (!Array.isArray(animaisAtropelados)) return [];
  
  const especiesAtropeladasMap = new Map<string, number>();
  animaisAtropelados.forEach(reg => {
    if (reg?.especie?.nome_popular) {
      const nomePopular = reg.especie.nome_popular || 'Espécie não identificada';
      const nomeCientifico = reg.especie.nome_cientifico || '';
      const chave = nomeCientifico ? `${nomePopular} (${nomeCientifico})` : nomePopular;
      const quantidade = reg.quantidade_total ?? reg.quantidade ?? 1;
      const qtdNum = typeof quantidade === 'number' && !isNaN(quantidade) ? quantidade : 1;
      especiesAtropeladasMap.set(chave, (especiesAtropeladasMap.get(chave) || 0) + qtdNum);
    }
  });
  
  return Array.from(especiesAtropeladasMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade: quantidade || 0 }))
    .filter(item => item.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into roadkill distribution chart data
 */
export const transformRoadkillData = (registros: Registro[], animaisAtropelados: Registro[]): ChartDataItem[] => {
  const validRegistros = Array.isArray(registros) ? registros.filter(r => r) : [];
  const validAtropelados = Array.isArray(animaisAtropelados) ? animaisAtropelados.filter(r => r) : [];
  const outros = Math.max(0, validRegistros.length - validAtropelados.length);
  
  return [
    { name: 'Atropelamento', value: validAtropelados.length },
    { name: 'Outros', value: outros }
  ];
};
