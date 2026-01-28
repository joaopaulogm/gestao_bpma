import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Navigation, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import KmlLayerControls, { KML_LAYERS, KmlLayer } from '@/components/mapa/KmlLayerControls';
import AreaVerificationGrid from '@/components/mapa/AreaVerificationGrid';
import { kml as kmlToGeoJSON } from '@tmcw/togeojson';

interface Coordenadas {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

const MapaLocalizacao: React.FC = () => {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  // KML Layers state — usamos Data em vez de KmlLayer para funcionar em localhost e produção
  // (KmlLayer faz o fetch nos servidores do Google, que não alcançam localhost)
  const [layers, setLayers] = useState<KmlLayer[]>(KML_LAYERS);
  const [loadingLayers, setLoadingLayers] = useState<string[]>([]);
  const kmlLayersRef = useRef<Map<string, google.maps.Data>>(new Map());

  // Função para carregar Google Maps (extraída para poder ser chamada novamente)
  const loadGoogleMaps = async () => {
      try {
        const response = await supabase.functions.invoke('get-google-maps-token');
        
        if (response.error) {
          console.error('Erro ao obter token Google Maps:', response.error);
          const errorMsg = response.error.message || 'Erro desconhecido';
          
          if (errorMsg.includes('not configured') || errorMsg.includes('not set')) {
            setError('GOOGLE_MAPS_API_KEY não configurado. Configure no Supabase Dashboard → Edge Functions → Secrets.');
          } else if (response.error.status === 500) {
            setError('Erro no servidor ao obter chave da API. Verifique os logs da Edge Function.');
          } else {
            setError(`Erro ao obter chave da API: ${errorMsg}`);
          }
          return;
        }
        
        const apiKey = response.data?.token;
        if (!apiKey) {
          console.error('Token Google Maps não encontrado na resposta:', response.data);
          setError('Chave da API não retornada pela Edge Function. Verifique se GOOGLE_MAPS_API_KEY está configurado no Supabase.');
          return;
        }

        // Verificar se já está carregado
        if (window.google?.maps) {
          setMapLoaded(true);
          return;
        }

        // Verificar se o script já existe
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('Script Google Maps já existe, removendo...');
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google Maps carregado com sucesso');
          // Aguardar um pouco para garantir que tudo está inicializado
          setTimeout(() => {
            if (window.google?.maps) {
              setMapLoaded(true);
              setError(null);
            } else {
              setError('Google Maps carregado mas não inicializado corretamente.');
            }
          }, 100);
        };
        script.onerror = (err) => {
          console.error('Erro ao carregar script Google Maps:', err);
          setError('Erro ao carregar o Google Maps. Verifique a chave da API, domínios autorizados e a conexão.');
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error('Erro ao carregar Google Maps:', err);
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro ao carregar o mapa: ${errorMsg}`);
      }
    };

  // Carregar Google Maps ao montar componente
  useEffect(() => {
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
      kmlLayersRef.current.forEach((data) => {
        data.setMap(null);
      });
      kmlLayersRef.current.clear();
    };
  }, []);

  // Toggle KML layer — fetch no browser + Data (funciona em localhost e produção)
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
      const existing = kmlLayersRef.current.get(layerId);
      if (existing) {
        existing.setMap(null);
        kmlLayersRef.current.delete(layerId);
      }
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: false } : l
      ));
      return;
    }

    setLoadingLayers(prev => [...prev, layerId]);

    try {
      const url = `${window.location.origin}${layer.file}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      const geojson = kmlToGeoJSON(doc, { skipNullGeometry: true });

      if (!geojson?.features?.length) {
        toast.error(`"${layer.name}" sem geometrias válidas`);
        return;
      }

      const dataLayer = new google.maps.Data();
      dataLayer.setStyle(() => ({
        fillColor: layer.color,
        fillOpacity: 0.25,
        strokeColor: layer.color,
        strokeWeight: 2,
        strokeOpacity: 0.9,
      }));
      dataLayer.addGeoJson(geojson);
      dataLayer.setMap(map);

      kmlLayersRef.current.set(layerId, dataLayer);
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: true } : l
      ));
      toast.success(`"${layer.name}" carregada`);
    } catch (err) {
      console.error(`Erro ao carregar camada ${layer.name}:`, err);
      toast.error(`Erro ao carregar "${layer.name}"`);
    } finally {
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

      mapInstanceRef.current.panTo(position);
      mapInstanceRef.current.setZoom(16);

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
      (position) => {
        const novasCoordenadas: Coordenadas = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };
        
        setCoordenadas(novasCoordenadas);
        setLoading(false);
        toast.success('Localização obtida!');
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permissão negada. Ative nas configurações.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Localização indisponível. Verifique GPS.');
            break;
          case err.TIMEOUT:
            setError('Tempo esgotado.');
            break;
          default:
            setError('Erro ao obter localização.');
        }
        toast.error('Erro ao obter localização');
      },
      {
        enableHighAccuracy: false, // Usar false para funcionar mesmo sem GPS (usa WiFi/rede)
        timeout: 10000,
        maximumAge: 60000, // Aceitar localização com até 1 minuto de idade
      }
    );
  }, []);

  const copiarCoordenadas = () => {
    if (coordenadas) {
      const texto = `${coordenadas.latitude.toFixed(6)}, ${coordenadas.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(texto);
      toast.success('Coordenadas copiadas!');
    }
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
                Obter Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={obterLocalizacao}
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Obtendo...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    {coordenadas ? 'Atualizar' : 'Obter Localização'}
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {coordenadas && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copiarCoordenadas}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Coordenadas
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Grid de Verificação de Áreas */}
          <AreaVerificationGrid
            coordenadas={coordenadas}
            visibleLayersCount={visibleLayersCount}
          />

          {/* Card de Camadas KML */}
          <KmlLayerControls
            layers={layers}
            onToggleLayer={toggleLayer}
            loadingLayers={loadingLayers}
          />
        </div>

        {/* Mapa */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div 
              ref={mapRef} 
              className="w-full h-[500px] lg:h-[calc(100vh-200px)] min-h-[400px] relative"
            >
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
                  <div className="text-center">
                    {error ? (
                      <>
                        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-medium text-destructive mb-1">Erro ao carregar mapa</p>
                        <p className="text-xs text-muted-foreground max-w-md px-4 mb-3">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setError(null);
                            setMapLoaded(false);
                            loadGoogleMaps();
                          }}
                        >
                          Tentar Novamente
                        </Button>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Carregando mapa...</p>
                      </>
                    )}
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
