import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Flame, Filter, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PontoMapa {
  id: string;
  latitude: number;
  longitude: number;
  tipo: 'resgate' | 'apreensao' | 'soltura' | 'atropelamento';
  nomePopular?: string;
  data?: string;
  regiao?: string;
  quantidade?: number;
}

interface DashboardMapaCalorProps {
  pontos: PontoMapa[];
  isPublico?: boolean;
  ano?: number;
}

// Componente para ajustar o centro do mapa
const FitBounds: React.FC<{ pontos: PontoMapa[] }> = ({ pontos }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (pontos.length > 0) {
      const validPontos = pontos.filter(p => 
        !isNaN(p.latitude) && !isNaN(p.longitude) &&
        p.latitude >= -90 && p.latitude <= 90 &&
        p.longitude >= -180 && p.longitude <= 180
      );
      
      if (validPontos.length > 0) {
        const bounds = L.latLngBounds(
          validPontos.map(p => [p.latitude, p.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [pontos, map]);
  
  return null;
};

const DashboardMapaCalor: React.FC<DashboardMapaCalorProps> = ({
  pontos,
  isPublico = false,
  ano
}) => {
  const [filtros, setFiltros] = useState({
    resgates: true,
    apreensoes: true,
    solturas: true,
    atropelamentos: true
  });

  // Filtrar pontos válidos e aplicar filtros
  const pontosValidos = useMemo(() => {
    return pontos.filter(p => {
      // Validar coordenadas
      if (isNaN(p.latitude) || isNaN(p.longitude)) return false;
      if (p.latitude < -90 || p.latitude > 90) return false;
      if (p.longitude < -180 || p.longitude > 180) return false;
      
      // Aplicar filtros por tipo
      if (p.tipo === 'resgate' && !filtros.resgates) return false;
      if (p.tipo === 'apreensao' && !filtros.apreensoes) return false;
      if (p.tipo === 'soltura' && !filtros.solturas) return false;
      if (p.tipo === 'atropelamento' && !filtros.atropelamentos) return false;
      
      return true;
    });
  }, [pontos, filtros]);

  // Agrupar pontos próximos para criar "clusters" visuais
  const pontosAgrupados = useMemo(() => {
    const grupos = new Map<string, { pontos: PontoMapa[]; lat: number; lng: number }>();
    const precisao = 3; // Número de casas decimais para agrupamento
    
    pontosValidos.forEach(p => {
      const key = `${p.latitude.toFixed(precisao)}-${p.longitude.toFixed(precisao)}`;
      if (!grupos.has(key)) {
        grupos.set(key, { pontos: [], lat: p.latitude, lng: p.longitude });
      }
      grupos.get(key)!.pontos.push(p);
    });
    
    return Array.from(grupos.values());
  }, [pontosValidos]);

  // Estatísticas por tipo
  const estatisticas = useMemo(() => {
    return {
      resgates: pontosValidos.filter(p => p.tipo === 'resgate').length,
      apreensoes: pontosValidos.filter(p => p.tipo === 'apreensao').length,
      solturas: pontosValidos.filter(p => p.tipo === 'soltura').length,
      atropelamentos: pontosValidos.filter(p => p.tipo === 'atropelamento').length
    };
  }, [pontosValidos]);

  // Cores por tipo
  const getCor = (tipo: string) => {
    switch (tipo) {
      case 'resgate': return '#22c55e';
      case 'apreensao': return '#8b5cf6';
      case 'soltura': return '#3b82f6';
      case 'atropelamento': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Tamanho do marcador baseado na quantidade
  const getTamanho = (quantidade: number) => {
    if (quantidade <= 1) return 8;
    if (quantidade <= 5) return 12;
    if (quantidade <= 10) return 16;
    if (quantidade <= 20) return 20;
    return 24;
  };

  // Centro padrão (Brasília)
  const centro: [number, number] = [-15.7801, -47.9292];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardHeader className={`py-3 ${isPublico ? 'bg-[#071d49]/5' : 'bg-green-50/50'}`}>
          <CardTitle className={`text-sm font-medium flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <Filter className="h-4 w-4" />
            Filtrar Ocorrências
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="resgates"
                checked={filtros.resgates}
                onCheckedChange={(checked) => setFiltros(f => ({ ...f, resgates: checked }))}
              />
              <Label htmlFor="resgates" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Resgates ({estatisticas.resgates})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="apreensoes"
                checked={filtros.apreensoes}
                onCheckedChange={(checked) => setFiltros(f => ({ ...f, apreensoes: checked }))}
              />
              <Label htmlFor="apreensoes" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                Apreensões ({estatisticas.apreensoes})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="solturas"
                checked={filtros.solturas}
                onCheckedChange={(checked) => setFiltros(f => ({ ...f, solturas: checked }))}
              />
              <Label htmlFor="solturas" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Solturas ({estatisticas.solturas})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="atropelamentos"
                checked={filtros.atropelamentos}
                onCheckedChange={(checked) => setFiltros(f => ({ ...f, atropelamentos: checked }))}
              />
              <Label htmlFor="atropelamentos" className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Atropelamentos ({estatisticas.atropelamentos})
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <Flame className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-orange-500'}`} />
            Mapa de Calor de Ocorrências {ano ? `- ${ano}` : ''}
            <Badge variant="outline" className="ml-2">
              {pontosValidos.length} pontos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pontosValidos.length === 0 ? (
            <div className="h-[500px] flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <Info className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Nenhum ponto com coordenadas válidas encontrado.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Os dados de localização podem não estar disponíveis para este período.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[500px] rounded-b-lg overflow-hidden">
              <MapContainer
                center={centro}
                zoom={10}
                className="h-full w-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <FitBounds pontos={pontosValidos} />
                
                {pontosAgrupados.map((grupo, index) => {
                  const quantidade = grupo.pontos.length;
                  const tipoPrincipal = grupo.pontos[0].tipo;
                  const cor = getCor(tipoPrincipal);
                  
                  return (
                    <CircleMarker
                      key={index}
                      center={[grupo.lat, grupo.lng]}
                      radius={getTamanho(quantidade)}
                      pathOptions={{
                        color: cor,
                        fillColor: cor,
                        fillOpacity: 0.6,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h4 className="font-semibold text-sm mb-2">
                            {quantidade} ocorrência{quantidade > 1 ? 's' : ''}
                          </h4>
                          <div className="space-y-1 text-xs">
                            {grupo.pontos.slice(0, 5).map((p, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: getCor(p.tipo) }}
                                />
                                <span className="capitalize">{p.tipo}</span>
                                {p.nomePopular && (
                                  <span className="text-muted-foreground">- {p.nomePopular}</span>
                                )}
                              </div>
                            ))}
                            {grupo.pontos.length > 5 && (
                              <p className="text-muted-foreground italic">
                                + {grupo.pontos.length - 5} mais...
                              </p>
                            )}
                          </div>
                          {grupo.pontos[0].regiao && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {grupo.pontos[0].regiao}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 opacity-60" />
              <span>Resgate de Fauna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-violet-500 opacity-60" />
              <span>Apreensão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 opacity-60" />
              <span>Soltura</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-60" />
              <span>Atropelamento</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            O tamanho do marcador indica a concentração de ocorrências na região.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMapaCalor;
