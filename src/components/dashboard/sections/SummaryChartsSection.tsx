
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

interface SummaryChartsSectionProps {
  data: DashboardData;
  year?: number;
}

const SummaryChartsSection: React.FC<SummaryChartsSectionProps> = ({ data, year = 2025 }) => {
  return <DashboardCharts data={data} year={year} />;
};

export default SummaryChartsSection;
