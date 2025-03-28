
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import RegioesAdministrativasChart from '../charts/RegioesAdministrativasChart';
import OrigemDistribuicaoChart from '../charts/OrigemDistribuicaoChart';

interface RegionalDistributionSectionProps {
  data: DashboardData;
}

const RegionalDistributionSection: React.FC<RegionalDistributionSectionProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <RegioesAdministrativasChart data={data.regiaoAdministrativa} />
      <OrigemDistribuicaoChart data={data.origemDistribuicao} />
    </div>
  );
};

export default RegionalDistributionSection;
