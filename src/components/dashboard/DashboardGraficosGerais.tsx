
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import ChartCard from '@/components/dashboard/ChartCard';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardAppreensoesRecordes from './DashboardAppreensoesRecordes';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
}

const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <DashboardCharts data={data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Regiões Administrativas" 
          data={data.regiaoAdministrativa.slice(0, 10)} 
          type="bar" 
          dataKey="value" 
          nameKey="name"
          showLegend={false}
        />
        
        <ChartCard 
          title="Origem" 
          data={data.origemDistribuicao} 
          type="pie" 
          dataKey="value" 
          nameKey="name"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Classe Taxonômica" 
          data={data.classeTaxonomica.slice(0, 8)} 
          type="bar" 
          dataKey="value" 
          nameKey="name"
          showLegend={false}
        />
        
        <ChartCard 
          title="Estágio de Vida" 
          data={data.estagioVidaDistribuicao} 
          type="pie" 
          dataKey="value" 
          nameKey="name"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardAppreensoesRecordes registros={data.rawData || []} />
        
        <ChartCard 
          title="Estado de Saúde" 
          data={data.estadoSaude.map(item => ({ 
            name: item.estado, 
            value: item.quantidade 
          }))} 
          type="pie" 
          dataKey="value" 
          nameKey="name"
        />
      </div>
    </div>
  );
};

export default DashboardGraficosGerais;
