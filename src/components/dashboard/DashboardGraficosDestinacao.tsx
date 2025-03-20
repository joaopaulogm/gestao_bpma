
import React from 'react';
import { DashboardData } from '@/hooks/useDashboardData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
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

interface DashboardGraficosDestinacaoProps {
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

const DashboardGraficosDestinacao = ({ data }: DashboardGraficosDestinacaoProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Destinação dos Animais" subtitle="Para onde os animais foram encaminhados">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.destinacaoTipos}
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
                outerRadius="70%"
                innerRadius="40%"
                paddingAngle={5}
                dataKey="value"
              >
                {data.destinacaoTipos.map((entry, index) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Detalhamento por Tipo de Destinação" subtitle="Visualização detalhada por tipo">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.destinacaoTipos}
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
                name="Quantidade" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  fill="#666" 
                  fontSize={11} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {data.motivosEntregaCEAPA.length > 0 && (
          <ChartCard title="Motivos de Entrega no CEAPA" subtitle="Principais causas de entrega">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.motivosEntregaCEAPA}
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
                  name="Quantidade" 
                  fill="#8b5cf6" 
                  background={{ fill: "#f8fafc" }}
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    fill="#666" 
                    fontSize={11} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default DashboardGraficosDestinacao;
