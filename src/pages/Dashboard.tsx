
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, ResponsiveContainer } from 'recharts';

// Mock data for the charts
const resgatesData = [
  { mes: 'Jan', quantidade: 10 },
  { mes: 'Fev', quantidade: 15 },
  { mes: 'Mar', quantidade: 8 },
  { mes: 'Abr', quantidade: 12 },
  { mes: 'Mai', quantidade: 20 },
  { mes: 'Jun', quantidade: 18 },
];

const gruposData = [
  { name: 'Mamíferos', value: 45 },
  { name: 'Aves', value: 30 },
  { name: 'Répteis', value: 15 },
  { name: 'Anfíbios', value: 5 },
  { name: 'Peixes', value: 5 },
];

const COLORS = ['#071d49', '#0A2472', '#0E6BA8', '#A6E1FA', '#DAFDBA'];

const Dashboard = () => {
  return (
    <Layout title="Dashboard" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Total de Espécies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">78</div>
              <p className="text-sm text-gray-500 mt-1">Espécies catalogadas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Resgates/Apreensões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">125</div>
              <p className="text-sm text-gray-500 mt-1">Total de ocorrências</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-fauna-blue">Espécies Ameaçadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-fauna-blue">23</div>
              <p className="text-sm text-gray-500 mt-1">Em risco de extinção</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-fauna-blue">Resgates por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resgatesData}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantidade" name="Quantidade" fill="#071d49" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-medium text-fauna-blue">Distribuição por Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gruposData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gruposData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
