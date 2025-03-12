
import React from 'react';
import { DashboardData } from '@/hooks/useDashboardData';
import ChartCard from './ChartCard';
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, Legend, Pie, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
  data: DashboardData;
}

const COLORS = ['#071d49', '#0A2472', '#0E6BA8', '#A6E1FA', '#DAFDBA'];

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  return (
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
  );
};

export default DashboardCharts;
