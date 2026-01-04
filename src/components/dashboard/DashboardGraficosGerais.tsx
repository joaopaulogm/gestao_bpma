
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import SummaryChartsSection from './sections/SummaryChartsSection';
import TaxonomicDataSection from './sections/TaxonomicDataSection';
import SerieTemporalMensalChart from './charts/SerieTemporalMensalChart';
import HeatmapDiaSemanaMesChart from './charts/HeatmapDiaSemanaMesChart';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
  year?: number;
}

const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data, year = 2025 }) => {
  const { filters } = useDashboardData();
  // Validar dados
  if (!data) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Dados não disponíveis
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <SummaryChartsSection data={data} year={year} />
      <TaxonomicDataSection data={data} />
      
      {/* Novos gráficos adicionados */}
      <SerieTemporalMensalChart data={data} year={filters.year || year} />
      <HeatmapDiaSemanaMesChart data={data} year={filters.year || year} />
    </div>
  );
};

export default DashboardGraficosGerais;
