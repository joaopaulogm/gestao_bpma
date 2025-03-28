
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import ClasseTaxonomicaChart from '../charts/ClasseTaxonomicaChart';
import EstagioVidaChart from '../charts/EstagioVidaChart';

interface TaxonomicDataSectionProps {
  data: DashboardData;
}

const TaxonomicDataSection: React.FC<TaxonomicDataSectionProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <ClasseTaxonomicaChart data={data.classeTaxonomica} />
      <EstagioVidaChart data={data.estagioVidaDistribuicao} />
    </div>
  );
};

export default TaxonomicDataSection;
