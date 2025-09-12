
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BrazilHeatmap from '@/components/hotspots/BrazilHeatmap';
import HeatmapLegend from '@/components/hotspots/HeatmapLegend';
import type { OcorrenciaData } from '@/types/hotspots';

const Hotspots = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OcorrenciaData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load demo data from JSON file
        const response = await fetch('/data/ocorrencias.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const jsonData: OcorrenciaData[] = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Erro ao buscar dados de hotspots:', error);
        toast.error('Erro ao carregar dados dos hotspots');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter data to show only rescue operations
  const resgateData = data.filter(item => item.tipo === 'resgate');
  
  return (
    <Layout title="Hotspots de Resgates – Brasil" showBackButton>
      <div className="space-y-4" lang="pt-BR">
        {/* Layout com mapa e legenda lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[70vh] animate-fade-in">
          {/* Mapa */}
          <div className="lg:col-span-3 h-full">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="relative h-full rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Carregando dados do mapa...</p>
                    </div>
                  ) : resgateData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <MapPin className="h-12 w-12 text-primary" />
                      <h3 className="text-lg font-medium">Sem dados de resgate</h3>
                      <p className="text-sm text-muted-foreground max-w-xs text-center">
                        Não foram encontrados registros de resgate com dados de localização válidos.
                      </p>
                    </div>
                  ) : (
                    <BrazilHeatmap data={resgateData} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legenda lateral */}
          <div className="lg:col-span-1 h-full">
            <HeatmapLegend 
              dataCount={resgateData.length}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hotspots;
