
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, ResponsiveContainer } from 'recharts';
import DateFilter from '@/components/dashboard/DateFilter';
import ChartCard from '@/components/dashboard/ChartCard';
import { useDashboardData } from '@/hooks/useDashboardData';

const COLORS = ['#071d49', '#0A2472', '#0E6BA8', '#A6E1FA', '#DAFDBA'];

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

  return (
    <Layout title="Dashboard" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-end mb-6">
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
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
