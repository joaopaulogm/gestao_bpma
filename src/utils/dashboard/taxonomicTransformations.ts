import { ChartDataItem, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into taxonomic class distribution chart data
 */
export const transformTaxonomicClassData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const classeMap = new Map<string, number>();
  registros.forEach(reg => {
    // Para dados históricos, classe_taxonomica pode estar diretamente no registro
    const classe = reg?.especie?.classe_taxonomica || (reg as any).classe_taxonomica;
    
    if (classe) {
      const classeTrim = classe.trim();
      if (classeTrim) {
        // Para dados históricos, usar quantidade_resgates; para atuais, contar 1
        const isHistorical = (reg as any).tipo_registro === 'historico' || 
                            (reg as any).quantidade_resgates !== undefined;
        const quantidade = isHistorical
          ? (Number((reg as any).quantidade_resgates) || Number((reg as any).quantidade) || 1)
          : 1;
        classeMap.set(classeTrim, (classeMap.get(classeTrim) || 0) + quantidade);
      }
    }
  });
  
  return Array.from(classeMap.entries())
    .map(([name, value]) => ({ name: name || 'Não especificado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Transforms raw registro data into life stage distribution chart data
 */
export const transformLifeStageData = (registros: Registro[]): ChartDataItem[] => {
  if (!Array.isArray(registros)) return [];
  
  const estagioVidaMap = new Map<string, number>();
  registros.forEach(reg => {
    if (reg?.estagio_vida?.nome) {
      const estagio = reg.estagio_vida.nome.trim();
      if (estagio) {
        estagioVidaMap.set(estagio, (estagioVidaMap.get(estagio) || 0) + 1);
      }
    }
  });
  
  return Array.from(estagioVidaMap.entries())
    .map(([name, value]) => ({ name: name || 'Não especificado', value: value || 0 }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};
