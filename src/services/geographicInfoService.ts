/**
 * Serviço para obter informações geográficas baseadas em coordenadas
 * Verifica RA, classes de solo, riscos ambientais usando arquivos KML
 */

import { kml as kmlToGeoJSON } from '@tmcw/togeojson';
import { supabase } from '@/integrations/supabase/client';

export interface GeographicInfo {
  regiaoAdministrativa: {
    id: string | null;
    nome: string | null;
  };
  classeSolo: string | null;
  riscoRecargaAquifero: boolean;
  riscoErosaoSolo: boolean;
  riscoPerdaCerrado: boolean;
  app: boolean;
  ucFederal: boolean;
  ucDistrital: boolean;
  reservaLegal: boolean;
}

/**
 * Verifica se um ponto está dentro de um polígono GeoJSON
 */
function pointInPolygon(point: [number, number], polygon: any): boolean {
  if (!polygon || !polygon.coordinates) return false;
  
  const [longitude, latitude] = point;
  const coordinates = polygon.coordinates;
  
  // Para MultiPolygon, verificar cada polígono
  if (polygon.type === 'MultiPolygon') {
    return coordinates.some((poly: any[][]) => 
      pointInPolygonCoordinates([longitude, latitude], poly[0])
    );
  }
  
  // Para Polygon, verificar o primeiro anel (exterior)
  if (polygon.type === 'Polygon') {
    return pointInPolygonCoordinates([longitude, latitude], coordinates[0]);
  }
  
  return false;
}

/**
 * Algoritmo ray casting para verificar se ponto está dentro do polígono
 */
function pointInPolygonCoordinates(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > y) !== (yj > y)) && 
                     (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Carrega e parseia um arquivo KML
 */
/** Resultado do togeojson: objeto com features opcional para pointInPolygon */
interface KmlGeoJSONLike {
  features?: Array<{ geometry?: unknown }>;
}
const kmlCache = new Map<string, KmlGeoJSONLike>();

async function loadKMLFile(filePath: string): Promise<KmlGeoJSONLike | null> {
  try {
    if (kmlCache.has(filePath)) {
      return kmlCache.get(filePath);
    }
    const url = `${window.location.origin}${filePath}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const geojson = kmlToGeoJSON(doc, { skipNullGeometry: true });
    
    kmlCache.set(filePath, geojson);
    return geojson;
  } catch (error) {
    console.error(`Erro ao carregar KML ${filePath}:`, error);
    return null;
  }
}

async function isInAnyKml(latitude: number, longitude: number, filePaths: string[]): Promise<boolean> {
  const point: [number, number] = [longitude, latitude];
  for (const filePath of filePaths) {
    const geojson = await loadKMLFile(filePath);
    if (!geojson?.features) continue;
    const inside = geojson.features.some((feature) => {
      return feature.geometry && pointInPolygon(point, feature.geometry);
    });
    if (inside) return true;
  }
  return false;
}

/**
 * Verifica em qual polígono de classe de solo o ponto está
 */
async function getClasseSolo(latitude: number, longitude: number): Promise<string | null> {
  try {
    const geojson = await loadKMLFile('/data/kml/Classes_Solos_DF.kml');
    if (!geojson?.features) return null;
    
    const point: [number, number] = [longitude, latitude];
    
    for (const feature of geojson.features) {
      if (feature.geometry && pointInPolygon(point, feature.geometry)) {
        // Tentar extrair nome da classe de solo do KML
        const name = feature.properties?.name || 
                    feature.properties?.Name || 
                    feature.properties?.description ||
                    feature.properties?.Description ||
                    'Classe de Solo';
        return name;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao verificar classe de solo:', error);
    return null;
  }
}

/**
 * Verifica se está em área de risco de recarga de aquífero
 */
async function isRiscoRecargaAquifero(latitude: number, longitude: number): Promise<boolean> {
  try {
    const geojson = await loadKMLFile('/data/kml/Risco_Recarga_Aquifero.kml');
    if (!geojson?.features) return false;
    
    const point: [number, number] = [longitude, latitude];
    
    return geojson.features.some(feature => 
      feature.geometry && pointInPolygon(point, feature.geometry)
    );
  } catch (error) {
    console.error('Erro ao verificar risco de recarga de aquífero:', error);
    return false;
  }
}

/**
 * Verifica se está em área de risco de erosão do solo
 */
async function isRiscoErosaoSolo(latitude: number, longitude: number): Promise<boolean> {
  try {
    const geojson = await loadKMLFile('/data/kml/Risco_Erosao_Solo.kml');
    if (!geojson?.features) return false;
    
    const point: [number, number] = [longitude, latitude];
    
    return geojson.features.some(feature => 
      feature.geometry && pointInPolygon(point, feature.geometry)
    );
  } catch (error) {
    console.error('Erro ao verificar risco de erosão do solo:', error);
    return false;
  }
}

/**
 * Verifica se está em área de risco de perda de cerrado nativo
 */
async function isRiscoPerdaCerrado(latitude: number, longitude: number): Promise<boolean> {
  try {
    const geojson = await loadKMLFile('/data/kml/Risco_Perda_Cerrado_Nativo.kml');
    if (!geojson?.features) return false;
    
    const point: [number, number] = [longitude, latitude];
    
    return geojson.features.some(feature => 
      feature.geometry && pointInPolygon(point, feature.geometry)
    );
  } catch (error) {
    console.error('Erro ao verificar risco de perda de cerrado:', error);
    return false;
  }
}

/**
 * Determina a Região Administrativa baseado nas coordenadas
 * Usa geocodificação reversa do Google Maps ou aproximação por distância
 */
async function getRegiaoAdministrativa(latitude: number, longitude: number): Promise<{ id: string | null; nome: string | null }> {
  try {
    // Primeiro, tentar usar geocodificação reversa do Google Maps
    if (window.google?.maps) {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: latitude, lng: longitude };
      
      return new Promise((resolve) => {
        geocoder.geocode({ location: latlng }, (results, status) => {
          void (async () => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              const addressComponents = result.address_components || [];
              let raNome: string | null = null;
              for (const component of addressComponents) {
                if (component.types.includes('administrative_area_level_2') ||
                    component.types.includes('locality') ||
                    component.types.includes('sublocality')) {
                  raNome = component.long_name;
                  break;
                }
              }
              if (!raNome && result.formatted_address) {
                const parts = result.formatted_address.split(',');
                if (parts.length > 0) {
                  raNome = parts[parts.length - 2]?.trim() || null;
                }
              }
              if (raNome) {
                const { data } = await supabase
                  .from('dim_regiao_administrativa')
                  .select('id, nome')
                  .ilike('nome', `%${raNome}%`)
                  .limit(1)
                  .single();
                if (data) {
                  resolve({ id: data.id, nome: data.nome });
                  return;
                }
              }
            }
            resolve(await getRegiaoAdministrativaByProximity(latitude, longitude));
          })();
        });
      });
    }
    
    // Fallback: usar aproximação por proximidade
    return getRegiaoAdministrativaByProximity(latitude, longitude);
  } catch (error) {
    console.error('Erro ao obter região administrativa:', error);
    return getRegiaoAdministrativaByProximity(latitude, longitude);
  }
}

/**
 * Determina RA por proximidade usando coordenadas conhecidas
 */
async function getRegiaoAdministrativaByProximity(latitude: number, longitude: number): Promise<{ id: string | null; nome: string | null }> {
  // Coordenadas aproximadas das RAs principais do DF
  const raCoords: Array<{ nome: string; lat: number; lng: number }> = [
    { nome: 'Plano Piloto (RA I) - Asa Sul', lat: -15.7942, lng: -47.8822 },
    { nome: 'Plano Piloto (RA I) - Asa Norte', lat: -15.7942, lng: -47.8822 },
    { nome: 'Gama', lat: -16.0103, lng: -48.0615 },
    { nome: 'Taguatinga', lat: -15.8365, lng: -48.0536 },
    { nome: 'Brazlândia', lat: -15.6806, lng: -48.1969 },
    { nome: 'Sobradinho', lat: -15.6517, lng: -47.7897 },
    { nome: 'Planaltina', lat: -15.6214, lng: -47.6486 },
    { nome: 'Paranoá', lat: -15.7744, lng: -47.7803 },
    { nome: 'Núcleo Bandeirante', lat: -15.8711, lng: -47.9683 },
    { nome: 'Ceilândia', lat: -15.8206, lng: -48.1117 },
    { nome: 'Guará', lat: -15.8350, lng: -47.9817 },
    { nome: 'Cruzeiro', lat: -15.7922, lng: -47.9328 },
    { nome: 'Samambaia', lat: -15.8789, lng: -48.0828 },
    { nome: 'Santa Maria', lat: -16.0197, lng: -48.0117 },
    { nome: 'São Sebastião', lat: -15.9028, lng: -47.7669 },
    { nome: 'Recanto das Emas', lat: -15.9147, lng: -48.0608 },
    { nome: 'Lago Sul', lat: -15.8350, lng: -47.8294 },
    { nome: 'Riacho Fundo', lat: -15.8761, lng: -48.0200 },
    { nome: 'Lago Norte', lat: -15.7350, lng: -47.8364 },
    { nome: 'Candangolândia', lat: -15.8528, lng: -47.9511 },
    { nome: 'Águas Claras', lat: -15.8394, lng: -48.0275 },
    { nome: 'Riacho Fundo II', lat: -15.8917, lng: -48.0472 },
    { nome: 'Sudoeste/Octogonal', lat: -15.8014, lng: -47.9286 },
    { nome: 'Varjão', lat: -15.7111, lng: -47.8692 },
    { nome: 'Park Way', lat: -15.8989, lng: -47.9586 },
    { nome: 'SCIA/Estrutural', lat: -15.7844, lng: -47.9969 },
    { nome: 'Sobradinho II', lat: -15.6442, lng: -47.8239 },
    { nome: 'Jardim Botânico', lat: -15.8697, lng: -47.8036 },
    { nome: 'Itapoã', lat: -15.7567, lng: -47.7711 },
    { nome: 'SIA', lat: -15.8083, lng: -47.9550 },
    { nome: 'Vicente Pires', lat: -15.8017, lng: -48.0258 },
    { nome: 'Fercal', lat: -15.6019, lng: -47.8867 },
    { nome: 'Sol Nascente/Pôr do Sol', lat: -15.8108, lng: -48.1189 },
    { nome: 'Arniqueira', lat: -15.8367, lng: -48.0061 },
  ];
  
  // Calcular distância para cada RA e encontrar a mais próxima
  let minDistance = Infinity;
  let closestRA: { nome: string; lat: number; lng: number } | null = null;
  
  for (const ra of raCoords) {
    const distance = Math.sqrt(
      Math.pow(latitude - ra.lat, 2) + Math.pow(longitude - ra.lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRA = ra;
    }
  }
  
  if (closestRA) {
    // Buscar no banco de dados
    const { data } = await supabase
      .from('dim_regiao_administrativa')
      .select('id, nome')
      .ilike('nome', `%${closestRA.nome.split(' ')[0]}%`)
      .limit(1)
      .single();
    
    if (data) {
      return { id: data.id, nome: data.nome };
    }
    
    return { id: null, nome: closestRA.nome };
  }
  
  return { id: null, nome: null };
}

/**
 * Obtém todas as informações geográficas para uma coordenada
 */
export async function getGeographicInfo(
  latitude: number,
  longitude: number
): Promise<GeographicInfo> {
  const [
    regiaoAdministrativa,
    classeSolo,
    riscoRecargaAquifero,
    riscoErosaoSolo,
    riscoPerdaCerrado,
    app,
    ucFederal,
    ucDistrital,
    reservaLegal,
  ] = await Promise.all([
    getRegiaoAdministrativa(latitude, longitude),
    getClasseSolo(latitude, longitude),
    isRiscoRecargaAquifero(latitude, longitude),
    isRiscoErosaoSolo(latitude, longitude),
    isRiscoPerdaCerrado(latitude, longitude),
    isInAnyKml(latitude, longitude, [
      '/data/kml/Corpos_dagua_do_Distrito_Federal.kml',
      '/data/kml/Drenagem_do_Distrito_Federal.kml',
    ]),
    isInAnyKml(latitude, longitude, [
      '/data/kml/Parque_Nacional_de_Brasilia.kml',
      '/data/kml/Reserva_da_Biosfera_do_Cerrado_RESBIO.kml',
    ]),
    isInAnyKml(latitude, longitude, [
      '/data/kml/Estacoes_Ecologicas_do_Distrito_Federal.kml',
      '/data/kml/Reservas_Biologicas_do_Distrito_Federal.kml',
      '/data/kml/Parques_do_Distrito_Federal.kml',
      '/data/kml/Parques_de_Brasilia.kml',
      '/data/kml/ARIE_Distrito_Federal.kml',
    ]),
    isInAnyKml(latitude, longitude, [
      '/data/kml/RPPN_Distrito_Federal.kml',
    ]),
  ]);
  
  return {
    regiaoAdministrativa,
    classeSolo,
    riscoRecargaAquifero,
    riscoErosaoSolo,
    riscoPerdaCerrado,
    app,
    ucFederal,
    ucDistrital,
    reservaLegal,
  };
}
