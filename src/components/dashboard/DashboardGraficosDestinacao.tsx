
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import DestinacaoTiposPieChart from './charts/DestinacaoTiposPieChart';
import DestinacaoTiposBarChart from './charts/DestinacaoTiposBarChart';
import MotivosEntregaCEAPAChart from './charts/MotivosEntregaCEAPAChart';

interface DashboardGraficosDestinacaoProps {
  data: DashboardData;
}

const DashboardGraficosDestinacao = ({ data }: DashboardGraficosDestinacaoProps) => {
  return (
    <div className="space-y-8">
      <DestinacaoTiposPieChart data={data.destinacaoTipos} />
      <DestinacaoTiposBarChart data={data.destinacaoTipos} />
      <MotivosEntregaCEAPAChart data={data.motivosEntregaCEAPA} />
    </div>
  );
};

export default DashboardGraficosDestinacao;
