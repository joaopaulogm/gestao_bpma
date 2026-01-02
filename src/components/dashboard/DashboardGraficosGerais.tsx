
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import SummaryChartsSection from './sections/SummaryChartsSection';
import RegionalDistributionSection from './sections/RegionalDistributionSection';
import TaxonomicDataSection from './sections/TaxonomicDataSection';
import HealthApprehensionSection from './sections/HealthApprehensionSection';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
}

const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data }) => {
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
      <SummaryChartsSection data={data} />
      <RegionalDistributionSection data={data} />
      <TaxonomicDataSection data={data} />
      <HealthApprehensionSection data={data} />
    </div>
  );
};

export default DashboardGraficosGerais;
