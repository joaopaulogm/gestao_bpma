
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

interface SummaryChartsSectionProps {
  data: DashboardData;
}

const SummaryChartsSection: React.FC<SummaryChartsSectionProps> = ({ data }) => {
  return <DashboardCharts data={data} />;
};

export default SummaryChartsSection;
