
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import DestinacaoTiposPieChart from './charts/DestinacaoTiposPieChart';
import DestinacaoTiposBarChart from './charts/DestinacaoTiposBarChart';
import MotivosEntregaCEAPAChart from './charts/MotivosEntregaCEAPAChart';
import DestinacaoMensalStackedChart from './charts/DestinacaoMensalStackedChart';
import TaxaSolturaMensalChart from './charts/TaxaSolturaMensalChart';
import { useDashboardData } from '@/hooks/useDashboardData';

interface DashboardGraficosDestinacaoProps {
  data: DashboardData;
  year?: number;
}

const DashboardGraficosDestinacao = ({ data, year }: DashboardGraficosDestinacaoProps) => {
  const { filters } = useDashboardData();
  const currentYear = year || filters.year || 2025;
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
      <DestinacaoTiposPieChart data={data.destinacaoTipos || []} />
      <DestinacaoTiposBarChart data={data.destinacaoTipos || []} />
      <MotivosEntregaCEAPAChart data={data.motivosEntregaCEAPA || []} />
      
      {/* Novos gráficos adicionados */}
      <DestinacaoMensalStackedChart data={data} year={currentYear} />
      <TaxaSolturaMensalChart data={data} year={currentYear} />
    </div>
  );
};

export default DashboardGraficosDestinacao;
