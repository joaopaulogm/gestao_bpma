
import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BrazilHeatmap from '@/components/hotspots/BrazilHeatmap';
import HeatmapFilterPanel from '@/components/hotspots/HeatmapFilterPanel';
import HeatmapLegend from '@/components/hotspots/HeatmapLegend';
import { useIsMobile } from '@/hooks/use-mobile'; // Fixed import
import type { OcorrenciaData, HeatmapFilters } from '@/types/hotspots';

const Hotspots = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<OcorrenciaData[]>([]);
  const [filters, setFilters] = useState<HeatmapFilters>({
    resgates: true,
    apreensoes: true,
    solturas: true
  });
  
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

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

  // Filter data based on current filters
  const filteredData = data.filter(item => {
    const typeMatch = 
      (item.tipo === 'resgate' && filters.resgates) ||
      (item.tipo === 'apreensao' && filters.apreensoes) ||
      (item.tipo === 'soltura' && filters.solturas);

    let dateMatch = true;
    
    // Se algum filtro de data foi especificado, usa os filtros
    if (filters.dataInicio || filters.dataFim) {
      const itemDate = new Date(item.data_iso);
      if (filters.dataInicio) {
        dateMatch = dateMatch && itemDate >= new Date(filters.dataInicio);
      }
      if (filters.dataFim) {
        dateMatch = dateMatch && itemDate <= new Date(filters.dataFim);
      }
    } else {
      // Se nenhum período foi especificado, filtra pelo ano vigente
      const itemDate = new Date(item.data_iso);
      const itemYear = itemDate.getFullYear();
      dateMatch = itemYear === currentYear;
    }

    return typeMatch && dateMatch;
  });

  const handleFiltersChange = useCallback((newFilters: HeatmapFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      resgates: true,
      apreensoes: true,
      solturas: true
    });
  }, []);

  const handleExportData = useCallback(() => {
    if (filteredData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const csvContent = [
      'ID,Tipo,Latitude,Longitude,Data,Município,UF,Fonte',
      ...filteredData.map(item => 
        `${item.id},${item.tipo},${item.lat},${item.lng},${item.data_iso},${item.municipio},${item.uf},${item.fonte}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'hotspots_dados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso');
  }, [filteredData]);
  
  return (
    <Layout title="Hotspots de Ocorrências – Brasil" showBackButton>
      <div className="space-y-4" lang="pt-BR">
        {/* Barra de filtros integrada */}
        <div className="w-full">
          <HeatmapFilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            onExportData={handleExportData}
            filteredData={filteredData}
            isMobile={isMobile}
          />
        </div>
        
        {/* Mapa */}
        <div className="w-full h-[70vh] animate-fade-in">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="relative h-full rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Carregando dados do mapa...</p>
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <MapPin className="h-12 w-12 text-primary" />
                    <h3 className="text-lg font-medium">Sem dados de localização</h3>
                    <p className="text-sm text-muted-foreground max-w-xs text-center">
                      Não foram encontrados registros com dados de latitude e longitude válidos.
                    </p>
                  </div>
                ) : (
                  <>
                    <BrazilHeatmap data={filteredData} filters={filters} />
                    <HeatmapLegend 
                      filteredDataCount={filteredData.length}
                      totalDataCount={data.length}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Hotspots;
