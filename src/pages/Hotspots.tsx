
import React, { useEffect, useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from 'sonner';

// Temporary mapbox token input for development
const MapboxTokenInput = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };
  
  return (
    <div className="mb-4 p-4 border border-yellow-400 bg-yellow-50 rounded-md">
      <p className="text-sm mb-2">Para visualizar o mapa, insira seu token público do Mapbox:</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm"
          placeholder="pk.eyJ1IjoieW91..."
        />
        <button type="submit" className="bg-fauna-blue text-white px-3 py-2 rounded-md text-sm">
          Aplicar
        </button>
      </form>
      <p className="text-xs mt-2 text-gray-500">
        Obtenha seu token em <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-fauna-blue">mapbox.com</a>
      </p>
    </div>
  );
};

interface RegistroLocation {
  id: string;
  regiao_administrativa: string;
  latitude: string;
  longitude: string;
  count: number;
}

interface HotspotRegion {
  regiao: string;
  contagem: number;
}

const Hotspots = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<RegistroLocation[]>([]);
  const [hotspotRegions, setHotspotRegions] = useState<HotspotRegion[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all registros with valid coordinates
        const { data: registrosData, error } = await supabase
          .from('registros')
          .select('id, regiao_administrativa, latitude_origem, longitude_origem')
          .not('latitude_origem', 'is', null)
          .not('longitude_origem', 'is', null);
          
        if (error) throw error;
        
        // Process locations and count registros by region
        const validLocations: RegistroLocation[] = [];
        const regionCounts: Record<string, number> = {};
        
        registrosData.forEach(registro => {
          // Skip records with invalid coordinates
          if (!registro.latitude_origem || !registro.longitude_origem ||
              isNaN(parseFloat(registro.latitude_origem)) || 
              isNaN(parseFloat(registro.longitude_origem))) {
            return;
          }
          
          validLocations.push({
            id: registro.id,
            regiao_administrativa: registro.regiao_administrativa,
            latitude: registro.latitude_origem,
            longitude: registro.longitude_origem,
            count: 1
          });
          
          // Count occurrences by region
          if (regionCounts[registro.regiao_administrativa]) {
            regionCounts[registro.regiao_administrativa]++;
          } else {
            regionCounts[registro.regiao_administrativa] = 1;
          }
        });
        
        // Sort regions by count and get top 3
        const sortedRegions = Object.entries(regionCounts)
          .map(([regiao, contagem]) => ({ regiao, contagem }))
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 3);
        
        setLocations(validLocations);
        setHotspotRegions(sortedRegions);
      } catch (error) {
        console.error('Erro ao buscar dados de hotspots:', error);
        toast.error('Erro ao carregar dados dos hotspots');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Initialize map when container is available and token is provided
    if (!mapContainer.current || !mapboxToken || !locations.length) return;
    
    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    try {
      if (map.current) return; // Avoid reinitializing
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-47.929, -15.779], // Brasília coordinates as default
        zoom: 8
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add markers when map is loaded
      map.current.on('load', () => {
        locations.forEach(location => {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${location.regiao_administrativa}</strong>`);
              
            new mapboxgl.Marker({ color: '#E03131' })
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map.current);
          }
        });
        
        // Fit map to markers if we have any
        if (locations.length) {
          const bounds = new mapboxgl.LngLatBounds();
          
          locations.forEach(location => {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend([lng, lat]);
            }
          });
          
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 12
          });
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      toast.error('Erro ao inicializar o mapa');
    }
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, locations]);
  
  const handleTokenSubmit = (token: string) => {
    setMapboxToken(token);
  };
  
  return (
    <Layout title="Hotspots" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            {!mapboxToken && (
              <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />
            )}
            
            <div className="bg-gray-100 rounded-lg relative min-h-[500px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 text-fauna-blue animate-spin" />
                  <p className="text-sm text-gray-500">Carregando dados do mapa...</p>
                </div>
              ) : !mapboxToken ? (
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-fauna-blue mx-auto" />
                  <h3 className="text-lg font-medium">Mapa de Hotspots</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Insira seu token do Mapbox acima para visualizar o mapa de hotspots 
                    com base nos registros cadastrados.
                  </p>
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-fauna-blue mx-auto" />
                  <h3 className="text-lg font-medium">Sem dados de localização</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Não foram encontrados registros com dados de latitude e longitude válidos.
                    Cadastre registros com informações de localização para visualizar os hotspots.
                  </p>
                </div>
              ) : (
                <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))
          ) : hotspotRegions.length > 0 ? (
            hotspotRegions.map((region, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-fauna-blue mb-2">
                    {index === 0 ? 'Área de Maior Incidência' : 
                     index === 1 ? 'Segundo Hotspot' : 'Terceiro Hotspot'}
                  </h3>
                  <p className="text-sm text-gray-700">{region.regiao}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {region.contagem} {region.contagem === 1 ? 'ocorrência registrada' : 'ocorrências registradas'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            Array(3).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-fauna-blue mb-2">
                    {index === 0 ? 'Área de Maior Incidência' : 
                     index === 1 ? 'Segundo Hotspot' : 'Terceiro Hotspot'}
                  </h3>
                  <p className="text-sm text-gray-700">Sem dados suficientes</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Cadastre registros com localização
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Hotspots;
