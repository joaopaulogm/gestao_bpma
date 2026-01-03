
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import SummaryChartsSection from './sections/SummaryChartsSection';
import TaxonomicDataSection from './sections/TaxonomicDataSection';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
  year?: number;
}

const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data, year = 2025 }) => {
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
    </div>
  );
};

export default DashboardGraficosGerais;
