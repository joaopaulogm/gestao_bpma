
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardAppreensoesRecordes from './DashboardAppreensoesRecordes';
import RegioesAdministrativasChart from './charts/RegioesAdministrativasChart';
import OrigemDistribuicaoChart from './charts/OrigemDistribuicaoChart';
import ClasseTaxonomicaChart from './charts/ClasseTaxonomicaChart';
import EstagioVidaChart from './charts/EstagioVidaChart';
import EstadoSaudeChart from './charts/EstadoSaudeChart';

interface DashboardGraficosGeraisProps {
  data: DashboardData;
}

const DashboardGraficosGerais: React.FC<DashboardGraficosGeraisProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <DashboardCharts data={data} />
      
      <RegioesAdministrativasChart data={data.regiaoAdministrativa} />
      <OrigemDistribuicaoChart data={data.origemDistribuicao} />
      <ClasseTaxonomicaChart data={data.classeTaxonomica} />
      <EstagioVidaChart data={data.estagioVidaDistribuicao} />
      
      <div className="grid grid-cols-1 gap-8">
        <DashboardAppreensoesRecordes registros={data.rawData || []} />
        <EstadoSaudeChart data={data.estadoSaude} />
      </div>
    </div>
  );
};

export default DashboardGraficosGerais;
