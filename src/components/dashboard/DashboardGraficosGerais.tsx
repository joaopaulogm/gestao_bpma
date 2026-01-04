
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import SummaryChartsSection from './sections/SummaryChartsSection';
import TaxonomicDataSection from './sections/TaxonomicDataSection';
import SerieTemporalMensalChart from './charts/SerieTemporalMensalChart';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
  year?: number;
}

<<<<<<< HEAD
const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data }) => {
  const { filters } = useDashboardData();
  
=======
const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data, year = 2025 }) => {
>>>>>>> 8cd9eea008d022067f01316c737467ef9a9093f6
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
      <SerieTemporalMensalChart data={data} year={filters.year} />
    </div>
  );
};

export default DashboardGraficosGerais;
