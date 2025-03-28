
import { ChartDataItem, EspecieQuantidade, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into most rescued species chart data
 */
export const transformMostRescuedSpeciesData = (resgates: Registro[]): EspecieQuantidade[] => {
  const especiesResgateMap = new Map<string, number>();
  resgates.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesResgateMap.set(chave, (especiesResgateMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesResgateMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into most seized species chart data
 */
export const transformMostSeizedSpeciesData = (apreensoes: Registro[]): EspecieQuantidade[] => {
  const especiesApreensaoMap = new Map<string, number>();
  apreensoes.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesApreensaoMap.set(chave, (especiesApreensaoMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesApreensaoMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into roadkill species chart data
 */
export const transformRoadkillSpeciesData = (animaisAtropelados: Registro[]): EspecieQuantidade[] => {
  const especiesAtropeladasMap = new Map<string, number>();
  animaisAtropelados.forEach(reg => {
    const chave = `${reg.nome_popular} (${reg.nome_cientifico})`;
    especiesAtropeladasMap.set(chave, (especiesAtropeladasMap.get(chave) || 0) + (reg.quantidade || 1));
  });
  
  return Array.from(especiesAtropeladasMap.entries())
    .map(([name, quantidade]) => ({ name, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);
};

/**
 * Transforms raw registro data into roadkill distribution chart data
 */
export const transformRoadkillData = (registros: Registro[], animaisAtropelados: Registro[]): ChartDataItem[] => {
  return [
    { name: 'Atropelamento', value: animaisAtropelados.length },
    { name: 'Outros', value: registros.length - animaisAtropelados.length }
  ];
};
