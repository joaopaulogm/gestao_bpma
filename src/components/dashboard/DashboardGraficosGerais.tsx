import React from 'react';
import { DashboardData } from '@/types/hotspots';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ChartCard from './ChartCard';

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Violet
];

interface DashboardGraficosGeraisProps {
  data: DashboardData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-gray-700">
            <span className="font-medium" style={{ color: item.color }}>
              {item.name}: 
            </span>{' '}
            {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardGraficosGerais = ({ data }: DashboardGraficosGeraisProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Evolução Temporal (2025)" subtitle="Ocorrências por mês ao longo do ano">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.timeSeriesData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                textAnchor="end"
                height={70}
                angle={-25}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="resgates"
                name="Resgates"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="apreensoes"
                name="Apreensões"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Distribuição por Região Administrativa" subtitle="Top 10 regiões com mais ocorrências">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.regiaoAdministrativa.slice(0, 10)}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Ocorrências" 
                fill="#3b82f6" 
                background={{ fill: "#f8fafc" }}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Origem dos Registros" subtitle="Distribuição por tipo de ocorrência">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.origemDistribuicao}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius="80%"
                innerRadius="55%"
                paddingAngle={5}
                dataKey="value"
              >
                {data.origemDistribuicao.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por Classe Taxonômica" subtitle="Animais por classificação">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.classeTaxonomica}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius="80%"
                innerRadius="55%"
                paddingAngle={5}
                dataKey="value"
              >
                {data.classeTaxonomica.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[(index + 2) % COLORS.length]} 
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estado de Saúde dos Animais" subtitle="Condições encontradas nos resgates">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.estadoSaude}
                cx="50%"
                cy="50%"
                labelLine={false}
                nameKey="estado"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius="80%"
                innerRadius="55%"
                paddingAngle={5}
                dataKey="quantidade"
              >
                {data.estadoSaude.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[(index + 4) % COLORS.length]} 
                    stroke="#fff"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Desfecho dos Resgates" subtitle="Resultados dos resgates realizados">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.desfechoResgate}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Ocorrências" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Desfecho das Apreensões" subtitle="Resultados das operações de apreensão">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.desfechoApreensao}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Ocorrências" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardGraficosGerais;
