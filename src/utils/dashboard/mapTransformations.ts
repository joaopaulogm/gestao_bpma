
import { MapDataPoint, Registro } from '@/types/hotspots';

/**
 * Transforms raw registro data into origin map data
 */
export const transformOriginMapData = (registros: Registro[]): MapDataPoint[] => {
  if (!Array.isArray(registros)) return [];
  
  return registros
    .filter(reg => reg && reg.latitude_origem && reg.longitude_origem)
    .map(reg => ({
      id: reg.id || `map-${Math.random().toString(36).substring(7)}`,
      latitude: String(reg.latitude_origem || '').trim(),
      longitude: String(reg.longitude_origem || '').trim(),
      tipo: reg.origem?.nome || 'Resgate de Fauna',
      nome_popular: reg.especie?.nome_popular || 'Espécie não identificada',
      quantidade: (typeof reg.quantidade_total === 'number' ? reg.quantidade_total : reg.quantidade) || 1
    }))
    .filter(point => point.latitude && point.longitude);
};

/**
 * Transforms raw registro data into release map data
 */
export const transformReleaseMapData = (registros: Registro[]): MapDataPoint[] => {
  if (!Array.isArray(registros)) return [];
  
  return registros
    .filter(reg => reg && reg.latitude_soltura && reg.longitude_soltura)
    .map(reg => ({
      id: reg.id || `map-${Math.random().toString(36).substring(7)}`,
      latitude: String(reg.latitude_soltura || '').trim(),
      longitude: String(reg.longitude_soltura || '').trim(),
      tipo: 'Soltura',
      nome_popular: reg.especie?.nome_popular || 'Espécie não identificada',
      quantidade: (typeof reg.quantidade_total === 'number' ? reg.quantidade_total : reg.quantidade) || 1
    }))
    .filter(point => point.latitude && point.longitude);
};
