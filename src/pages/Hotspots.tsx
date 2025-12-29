
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BrazilHeatmap from '@/components/hotspots/BrazilHeatmap';
import HeatmapLegend from '@/components/hotspots/HeatmapLegend';
import type { OcorrenciaData } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';

const Hotspots = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OcorrenciaData[]>([]);

  useEffect(() => {
    const fetchRegistros = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching registros for heatmap...');
        
        // Buscar registros do Supabase com joins
        const { data: registros, error } = await supabase
          .from('fat_registros_de_resgate')
          .select(`
            id,
            latitude_origem,
            longitude_origem,
            data,
            regiao_administrativa:dim_regiao_administrativa(nome),
            origem:dim_origem(nome),
            especie:dim_especies_fauna(nome_popular)
          `)
          .not('latitude_origem', 'is', null)
          .not('longitude_origem', 'is', null);

        if (error) throw error;

        console.log('Fetched registros:', registros?.length || 0, 'total items');

        // Transformar dados do formato do Supabase para OcorrenciaData
        const transformedData: OcorrenciaData[] = (registros || []).map(reg => ({
          id: reg.id,
          tipo: 'resgate',
          lat: parseFloat(reg.latitude_origem),
          lng: parseFloat(reg.longitude_origem),
          municipio: reg.regiao_administrativa?.nome || 'Não informado',
          uf: 'DF', // Todos os dados são do Distrito Federal
          data_iso: reg.data || new Date().toISOString(),
          fonte: 'IBRAM'
        }));

        console.log('Transformed data:', transformedData.length, 'items');
        console.log('Sample transformed item:', transformedData[0]);

        setData(transformedData);
      } catch (error) {
        console.error('Erro ao buscar registros para o heatmap:', error);
        toast.error('Erro ao carregar dados dos registros');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistros();
  }, []);

  console.log('Hotspots page - Total data loaded:', data.length);
  console.log('Sample data:', data.slice(0, 2));
  
  return (
    <Layout title="Hotspots de Resgates" showBackButton>
      <div className="space-y-4" lang="pt-BR">
        {/* Layout com mapa e legenda - responsivo */}
        <div className="flex flex-col lg:flex-row gap-4 min-h-[60vh] lg:h-[70vh] animate-fade-in">
          {/* Mapa */}
          <div className="flex-1 h-[50vh] lg:h-full">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="relative h-full rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Carregando dados do mapa...</p>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4 p-4">
                      <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                      <h3 className="text-base sm:text-lg font-medium text-center">Sem dados de resgate</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-xs text-center">
                        Não foram encontrados registros de resgate com dados de localização válidos.
                      </p>
                    </div>
                  ) : (
                    <BrazilHeatmap data={data} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legenda lateral - responsivo */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <HeatmapLegend 
              dataCount={data.length}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hotspots;
