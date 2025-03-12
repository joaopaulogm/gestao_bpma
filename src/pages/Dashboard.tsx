
import React from 'react';
import Layout from '@/components/Layout';
import { Activity, ArrowDownCircle, Database } from 'lucide-react';
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
      <Layout title="Painel de Dados" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-lg text-slate-600">Carregando dados...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <div className="text-lg text-red-500 font-medium">Erro ao carregar dados do painel</div>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Ocorreu um problema ao buscar os dados. Por favor, tente novamente mais tarde ou contacte o suporte.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const hasRAnalysis = data.analysis && data.analysis.r_data;

  return (
    <Layout title="Painel de Dados" showBackButton>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <DashboardExport 
              data={data} 
              year={filters.year} 
              month={filters.month} 
            />
            {hasRAnalysis && (
              <div className="flex items-center px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
                <Activity size={14} className="mr-1.5 text-green-500" />
                <span className="text-xs font-medium text-green-600">Análise R ativa</span>
              </div>
            )}
          </div>
          <DateFilter
            year={filters.year}
            month={filters.month}
            onFilterChange={updateFilters}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white/0 pointer-events-none -top-8 h-16 z-10"></div>
          <DashboardSummaryCards data={data} />
        </div>
        
        <div className="relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-50/80 before:to-white/0 before:pointer-events-none before:-left-8 before:w-16 before:z-10">
          <DashboardCharts data={data} />
        </div>

        {hasRAnalysis && (
          <div className="space-y-6">
            <ChartCard title="Análise Estatística (R)">
              <div className="p-2">
                <h3 className="text-base font-medium mb-3 text-slate-700 flex items-center">
                  <Database size={16} className="mr-2 text-purple-500" />
                  Sumário Estatístico
                </h3>
                <div className="overflow-auto max-h-[300px] bg-slate-50 rounded-md">
                  <pre className="text-xs p-4 text-slate-700">
                    {JSON.stringify(data.analysis.r_data.summary, null, 2)}
                  </pre>
                </div>
              </div>
            </ChartCard>
            
            {data.analysis.r_data.plots && data.analysis.r_data.plots.length > 0 && (
              <ChartCard title="Visualizações Avançadas (R)">
                <div className="p-2">
                  {data.analysis.r_data.plots.map((plot: string, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="bg-slate-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-slate-700">Visualização R {index + 1}</h4>
                          <a 
                            href={`data:image/png;base64,${plot}`} 
                            download={`r-plot-${index + 1}.png`}
                            className="flex items-center text-xs text-blue-500 hover:text-blue-600"
                          >
                            <ArrowDownCircle size={14} className="mr-1" />
                            Baixar
                          </a>
                        </div>
                        <img 
                          src={`data:image/png;base64,${plot}`} 
                          alt={`R Plot ${index + 1}`} 
                          className="mx-auto max-w-full rounded-md border border-slate-200 shadow-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
