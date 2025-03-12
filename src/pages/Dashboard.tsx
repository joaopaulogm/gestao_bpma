
import React from 'react';
import Layout from '@/components/Layout';
import { Activity } from 'lucide-react';
import DateFilter from '@/components/dashboard/DateFilter';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardExport from '@/components/dashboard/DashboardExport';
import ChartCard from '@/components/dashboard/ChartCard';

const Dashboard = () => {
  const { data, isLoading, error, filters, updateFilters } = useDashboardData();

  if (isLoading) {
    return (
      <Layout title="Dashboard" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-500">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="Dashboard" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500">Erro ao carregar dados do dashboard</div>
        </div>
      </Layout>
    );
  }

  const hasRAnalysis = data.analysis && data.analysis.r_data;

  return (
    <Layout title="Dashboard" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <DashboardExport 
              data={data} 
              year={filters.year} 
              month={filters.month} 
            />
            {hasRAnalysis && (
              <div className="flex items-center text-green-500">
                <Activity size={16} className="mr-1" />
                <span className="text-xs font-medium">Análise R ativa</span>
              </div>
            )}
          </div>
          <DateFilter
            year={filters.year}
            month={filters.month}
            onFilterChange={updateFilters}
          />
        </div>

        <DashboardSummaryCards data={data} />
        <DashboardCharts data={data} />

        {hasRAnalysis && (
          <>
            <ChartCard title="Análise Estatística (R)">
              <div className="p-4">
                <h3 className="text-lg font-medium mb-4">Sumário Estatístico</h3>
                <div className="overflow-auto max-h-[300px]">
                  <pre className="text-xs bg-gray-50 p-4 rounded">
                    {JSON.stringify(data.analysis.r_data.summary, null, 2)}
                  </pre>
                </div>
              </div>
            </ChartCard>
            
            {data.analysis.r_data.plots && data.analysis.r_data.plots.length > 0 && (
              <ChartCard title="Visualizações Avançadas (R)">
                <div className="p-4">
                  {data.analysis.r_data.plots.map((plot: string, index: number) => (
                    <div key={index} className="mb-4">
                      <img 
                        src={`data:image/png;base64,${plot}`} 
                        alt={`R Plot ${index + 1}`} 
                        className="mx-auto max-w-full"
                      />
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
