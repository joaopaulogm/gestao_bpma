import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, ResponsiveContainer } from 'recharts';
import DateFilter from '@/components/dashboard/DateFilter';
import ChartCard from '@/components/dashboard/ChartCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Download, Activity } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

const COLORS = ['#071d49', '#0A2472', '#0E6BA8', '#A6E1FA', '#DAFDBA'];

const Dashboard = () => {
  const { data, isLoading, error, filters, updateFilters } = useDashboardData();

  const handleExportExcel = () => {
    if (!data) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    try {
      exportToExcel(data, `dashboard-${filters.year}-${filters.month !== null ? filters.month + 1 : 'todos'}`);
      toast.success("Dados exportados com sucesso para XLSX");
    } catch (err) {
      console.error("Erro ao exportar para Excel:", err);
      toast.error("Erro ao exportar dados para XLSX");
    }
  };

  const handleExportPDF = () => {
    if (!data) {
      toast.error("Não há dados para exportar");
      return;
    }
    
    try {
      exportToPDF(data, `dashboard-${filters.year}-${filters.month !== null ? filters.month + 1 : 'todos'}`);
      toast.success("Dados exportados com sucesso para PDF");
    } catch (err) {
      console.error("Erro ao exportar para PDF:", err);
      toast.error("Erro ao exportar dados para PDF");
    }
  };

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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Exportar XLSX
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Exportar PDF
            </Button>
            {hasRAnalysis && (
              <div className="flex items-center text-green-500 ml-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Total de Resgates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">{data.totalResgates}</div>
              <p className="text-sm text-gray-500 mt-1">Resgates registrados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Total de Apreensões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">{data.totalApreensoes}</div>
              <p className="text-sm text-gray-500 mt-1">Apreensões registradas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Atropelamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">
                {data.atropelamentos.reduce((acc, curr) => acc + curr.quantidade, 0)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Animais atropelados</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribuição por Classe">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribuicaoPorClasse}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.distribuicaoPorClasse.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Destinos">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.destinos}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantidade" fill="#071d49" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Desfechos de Apreensão">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.desfechos}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantidade" fill="#0E6BA8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Espécies Mais Resgatadas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.especiesMaisResgatadas}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" name="Quantidade" fill="#0A2472" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Espécies Mais Apreendidas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.especiesMaisApreendidas}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" name="Quantidade" fill="#A6E1FA" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Animais Atropelados por Espécie">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.atropelamentos}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" name="Quantidade" fill="#DAFDBA" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

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
      </div>
    </Layout>
  );
};

export default Dashboard;
