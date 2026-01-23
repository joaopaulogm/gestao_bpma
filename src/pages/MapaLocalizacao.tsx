import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Navigation, RefreshCw, Shield, TreePine, Mountain, Leaf, AlertTriangle, CheckCircle2, XCircle, Copy, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import KmlLayerControls, { KML_LAYERS, KmlLayer } from '@/components/mapa/KmlLayerControls';

interface Coordenadas {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface AreaProtegida {
  id: string;
  nome: string;
  tipo: 'app' | 'uc_federal' | 'uc_distrital' | 'reserva_legal' | 'area_especial';
  dentro: boolean;
}

const tipoAreaConfig = {
  app: { label: 'APP', icon: TreePine, color: 'bg-green-500' },
  uc_federal: { label: 'UC Federal', icon: Mountain, color: 'bg-blue-500' },
  uc_distrital: { label: 'UC Distrital', icon: Shield, color: 'bg-purple-500' },
  reserva_legal: { label: 'Reserva Legal', icon: Leaf, color: 'bg-emerald-500' },
  area_especial: { label: 'Área Especial', icon: AlertTriangle, color: 'bg-amber-500' },
};

const MapaLocalizacao: React.FC = () => {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areasProtegidas, setAreasProtegidas] = useState<AreaProtegida[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  // KML Layers state
  const [layers, setLayers] = useState<KmlLayer[]>(KML_LAYERS);
  const [loadingLayers, setLoadingLayers] = useState<string[]>([]);
  const kmlLayersRef = useRef<Map<string, google.maps.KmlLayer>>(new Map());

  // Carregar Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const response = await supabase.functions.invoke('get-google-maps-token');
        if (response.error) throw response.error;
        
        const apiKey = response.data?.token;
        if (!apiKey) throw new Error('Token não encontrado');

        // Verificar se já está carregado
        if (window.google?.maps) {
          setMapLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = () => setError('Erro ao carregar o mapa');
        document.head.appendChild(script);
      } catch (err) {
        console.error('Erro ao carregar Google Maps:', err);
        setError('Erro ao carregar o mapa');
      }
    };

    loadGoogleMaps();
  }, []);

  // Inicializar mapa quando carregado
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      // Centro do DF
      const dfCenter = { lat: -15.7942, lng: -47.8822 };
      
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: dfCenter,
        zoom: 11,
        mapId: 'mapa-localizacao',
        mapTypeId: 'hybrid',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }
  }, [mapLoaded]);

  // Cleanup KML layers on unmount
  useEffect(() => {
    return () => {
      kmlLayersRef.current.forEach((layer) => {
        layer.setMap(null);
      });
      kmlLayersRef.current.clear();
    };
  }, []);

  // Toggle KML layer
  const toggleLayer = useCallback(async (layerId: string) => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) {
      toast.error('Mapa não está pronto');
      return;
    }

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    // Se a camada já está visível, remover
    if (layer.visible) {
      const existingLayer = kmlLayersRef.current.get(layerId);
      if (existingLayer) {
        existingLayer.setMap(null);
        kmlLayersRef.current.delete(layerId);
      }
      
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: false } : l
      ));
      return;
    }

    // Carregar a camada KML
    setLoadingLayers(prev => [...prev, layerId]);

    try {
      // URL pública necessária para Google Maps KML
      // Em produção, usar URL do site publicado
      const baseUrl = window.location.origin;
      const kmlUrl = `${baseUrl}${layer.file}`;

      console.log('Carregando KML:', kmlUrl);

      const kmlLayer = new google.maps.KmlLayer({
        url: kmlUrl,
        map: map,
        preserveViewport: true,
        suppressInfoWindows: false,
      });

      // Listener para quando o KML é carregado
      kmlLayer.addListener('status_changed', () => {
        const status = kmlLayer.getStatus();
        console.log(`KML ${layer.name} status:`, status);
        
        if (status === 'OK') {
          kmlLayersRef.current.set(layerId, kmlLayer);
          setLayers(prev => prev.map(l => 
            l.id === layerId ? { ...l, visible: true } : l
          ));
          toast.success(`Camada "${layer.name}" carregada`);
        } else {
          console.error(`Erro ao carregar KML ${layer.name}:`, status);
          kmlLayer.setMap(null);
          
          if (status === 'FETCH_ERROR') {
            toast.error(
              `Camada "${layer.name}" requer URL pública. Publique o app para usar.`,
              { duration: 5000 }
            );
          } else {
            toast.error(`Erro ao carregar: ${status}`);
          }
        }
        
        setLoadingLayers(prev => prev.filter(id => id !== layerId));
      });

    } catch (error) {
      console.error(`Erro ao carregar camada ${layer.name}:`, error);
      toast.error(`Erro ao carregar "${layer.name}"`);
      setLoadingLayers(prev => prev.filter(id => id !== layerId));
    }
  }, [mapLoaded, layers]);

  // Atualizar marcador quando coordenadas mudarem
  useEffect(() => {
    if (coordenadas && mapInstanceRef.current && mapLoaded) {
      const position = { lat: coordenadas.latitude, lng: coordenadas.longitude };
      
      // Remover marcador anterior
      if (markerRef.current) {
        markerRef.current.map = null;
      }

      // Criar novo marcador
      const pinElement = document.createElement('div');
      pinElement.innerHTML = `
        <div class="relative">
          <div class="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="relative w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      `;

      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position,
        content: pinElement,
        title: 'Sua localização',
      });

      // Centralizar mapa
      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(16);

      // Adicionar círculo de precisão
      new google.maps.Circle({
        map: mapInstanceRef.current,
        center: position,
        radius: coordenadas.accuracy,
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.4,
        strokeWeight: 2,
      });
    }
  }, [coordenadas, mapLoaded]);

  const obterLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const novasCoordenadas: Coordenadas = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };
        
        setCoordenadas(novasCoordenadas);
        setLoading(false);
        toast.success('Localização obtida com sucesso!');

        // Verificar áreas protegidas
        await verificarAreasProtegidas(novasCoordenadas);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permissão de localização negada. Ative nas configurações do navegador.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Localização indisponível. Verifique seu GPS.');
            break;
          case err.TIMEOUT:
            setError('Tempo esgotado ao obter localização.');
            break;
          default:
            setError('Erro ao obter localização.');
        }
        toast.error('Erro ao obter localização');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  const verificarAreasProtegidas = async (coords: Coordenadas) => {
    setLoadingAreas(true);
    try {
      // Por enquanto, simular verificação até dados PostGIS serem integrados
      const areasSimuladas: AreaProtegida[] = [
        { id: '1', nome: 'Verificação via camadas KML', tipo: 'app', dentro: false },
        { id: '2', nome: 'Ative camadas no painel', tipo: 'uc_federal', dentro: false },
        { id: '3', nome: 'Para visualizar áreas', tipo: 'uc_distrital', dentro: false },
        { id: '4', nome: 'Protegidas no mapa', tipo: 'reserva_legal', dentro: false },
      ];

      setAreasProtegidas(areasSimuladas);
    } catch (err) {
      console.error('Erro ao verificar áreas:', err);
    } finally {
      setLoadingAreas(false);
    }
  };

  const copiarCoordenadas = () => {
    if (coordenadas) {
      const texto = `${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(texto);
      toast.success('Coordenadas copiadas!');
    }
  };

  const formatarPrecisao = (metros: number) => {
    if (metros < 1) return '< 1m';
    if (metros < 10) return `± ${metros.toFixed(1)}m`;
    return `± ${Math.round(metros)}m`;
  };

  const visibleLayersCount = layers.filter(l => l.visible).length;

  return (
    <Layout title="Mapa e Localização" showBackButton>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Painel de Controle */}
        <div className="lg:col-span-1 space-y-4">
          {/* Card de Localização */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-primary" />
                Sua Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={obterLocalizacao}
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Obtendo localização...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    {coordenadas ? 'Atualizar Localização' : 'Obter Minha Localização'}
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {coordenadas && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Latitude</span>
                    <span className="font-mono text-sm">{coordenadas.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Longitude</span>
                    <span className="font-mono text-sm">{coordenadas.longitude.toFixed(6)}°</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Precisão</span>
                    <Badge variant="secondary">{formatarPrecisao(coordenadas.accuracy)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Atualizado</span>
                    <span className="text-xs text-muted-foreground">
                      {coordenadas.timestamp.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarCoordenadas}
                    className="w-full gap-2 mt-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Coordenadas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Camadas KML */}
          <KmlLayerControls
            layers={layers}
            onToggleLayer={toggleLayer}
            loadingLayers={loadingLayers}
          />

          {/* Card de Áreas Protegidas */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                Verificação de Áreas
                {visibleLayersCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {visibleLayersCount} camadas ativas
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!coordenadas ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Obtenha sua localização para verificar áreas protegidas
                </p>
              ) : loadingAreas ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {areasProtegidas.map((area) => {
                    const config = tipoAreaConfig[area.tipo];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={area.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors",
                          area.dentro 
                            ? "bg-red-500/10 border-red-500/30" 
                            : "bg-muted/30 border-border/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", config.color)}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{area.nome}</p>
                          </div>
                        </div>
                        {area.dentro ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Dentro
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            Fora
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  
                  <Alert className="mt-4">
                    <Layers className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Ative as camadas KML acima para visualizar áreas protegidas diretamente no mapa.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div 
              ref={mapRef} 
              className="w-full h-[500px] lg:h-[calc(100vh-200px)] min-h-[400px]"
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full bg-muted/20">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MapaLocalizacao;
