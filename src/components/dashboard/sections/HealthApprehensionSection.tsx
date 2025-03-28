
import React from 'react';
import { DashboardData, Registro } from '@/types/hotspots';
import DashboardAppreensoesRecordes from '../DashboardAppreensoesRecordes';
import EstadoSaudeChart from '../charts/EstadoSaudeChart';

interface HealthApprehensionSectionProps {
  data: DashboardData;
}

const HealthApprehensionSection: React.FC<HealthApprehensionSectionProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <DashboardAppreensoesRecordes registros={data.rawData || []} />
      <EstadoSaudeChart data={data.estadoSaude} />
    </div>
  );
};

export default HealthApprehensionSection;
