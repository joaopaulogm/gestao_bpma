
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import HotspotMap from '@/components/hotspots/HotspotMap';
import HotspotCard from '@/components/hotspots/HotspotCard';
import type { RegistroLocation, HotspotRegion } from '@/types/hotspots';

const Hotspots = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<RegistroLocation[]>([]);
  const [hotspotRegions, setHotspotRegions] = useState<HotspotRegion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: registrosData, error } = await supabase
          .from('registros')
          .select('id, regiao_administrativa, latitude_origem, longitude_origem, origem')
          .not('latitude_origem', 'is', null)
          .not('longitude_origem', 'is', null);
          
        if (error) throw error;
        
        const validLocations: RegistroLocation[] = [];
        const regionCountsResgate: Record<string, number> = {};
        const regionCountsApreensao: Record<string, number> = {};
        
        registrosData.forEach(registro => {
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
            count: 1,
            origem: registro.origem
          });
          
          if (registro.origem === 'Resgate') {
            if (regionCountsResgate[registro.regiao_administrativa]) {
              regionCountsResgate[registro.regiao_administrativa]++;
            } else {
              regionCountsResgate[registro.regiao_administrativa] = 1;
            }
          } else if (registro.origem === 'Apreensão') {
            if (regionCountsApreensao[registro.regiao_administrativa]) {
              regionCountsApreensao[registro.regiao_administrativa]++;
            } else {
              regionCountsApreensao[registro.regiao_administrativa] = 1;
            }
          }
        });
        
        const sortedResgates = Object.entries(regionCountsResgate)
          .map(([regiao, contagem]) => ({ regiao, contagem, tipo: 'Resgate' }))
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 2);
          
        const sortedApreensoes = Object.entries(regionCountsApreensao)
          .map(([regiao, contagem]) => ({ regiao, contagem, tipo: 'Apreensão' }))
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 2);
        
        // Combine top regions from both types
        const combinedRegions = [...sortedResgates, ...sortedApreensoes]
          .sort((a, b) => b.contagem - a.contagem)
          .slice(0, 4);
        
        setLocations(validLocations);
        setHotspotRegions(combinedRegions);
      } catch (error) {
        console.error('Erro ao buscar dados de hotspots:', error);
        toast.error('Erro ao carregar dados dos hotspots');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <Layout title="Hotspots" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-100 rounded-lg relative min-h-[500px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 text-fauna-blue animate-spin" />
                  <p className="text-sm text-gray-500">Carregando dados do mapa...</p>
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
                <HotspotMap locations={locations} />
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
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
              <HotspotCard key={index} region={region} index={index} />
            ))
          ) : (
            Array(4).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-fauna-blue mb-2">
                    {index < 2 ? `Hotspot Resgate ${index + 1}` : `Hotspot Apreensão ${index - 1}`}
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
