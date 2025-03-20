
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
  '#14b8a6', // Teal
  '#ef4444', // Red
];

interface DashboardGraficosEspeciesProps {
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

const truncateName = (name: string, maxLength: number = 30) => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + '...';
};

const DashboardGraficosEspecies = ({ data }: DashboardGraficosEspeciesProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Espécies Mais Resgatadas" subtitle="Top 10 espécies em resgates">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.especiesMaisResgatadas}
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
                tickFormatter={(value) => truncateName(value, 15)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade" 
                fill="#f97316" 
                background={{ fill: "#f8fafc" }}
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="quantidade" 
                  position="right" 
                  fill="#666" 
                  fontSize={11} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Espécies Mais Apreendidas" subtitle="Top 10 espécies em apreensões">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.especiesMaisApreendidas}
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
                tickFormatter={(value) => truncateName(value, 15)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade" 
                fill="#10b981" 
                background={{ fill: "#f8fafc" }}
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="quantidade" 
                  position="right" 
                  fill="#666" 
                  fontSize={11} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Espécies Atropeladas" subtitle="Animais vítimas de atropelamento por espécie">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.especiesAtropeladas}
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
                tickFormatter={(value) => truncateName(value, 15)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade" 
                fill="#ec4899" 
                background={{ fill: "#f8fafc" }}
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="quantidade" 
                  position="right" 
                  fill="#666" 
                  fontSize={11} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Estágio de Vida" subtitle="Distribuição entre adultos e filhotes">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.estagioVidaDistribuicao}
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
                {data.estagioVidaDistribuicao.map((entry, index) => (
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
        <ChartCard title="Atropelamentos" subtitle="Incidência de atropelamentos">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data.atropelamentoDistribuicao}
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
                <Cell fill="#ec4899" stroke="#fff" />
                <Cell fill="#9ca3af" stroke="#fff" />
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

        <ChartCard title="Estatísticas de Quantidade por Ocorrência" subtitle="Análise quantitativa das ocorrências">
          <div className="flex flex-col justify-center h-full p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-lg">
                <span className="text-sm text-blue-600 font-medium mb-2">Mínimo</span>
                <span className="text-3xl font-bold text-blue-700">
                  {data.quantidadePorOcorrencia.min}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-green-50 p-6 rounded-lg">
                <span className="text-sm text-green-600 font-medium mb-2">Máximo</span>
                <span className="text-3xl font-bold text-green-700">
                  {data.quantidadePorOcorrencia.max}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-purple-50 p-6 rounded-lg">
                <span className="text-sm text-purple-600 font-medium mb-2">Média</span>
                <span className="text-3xl font-bold text-purple-700">
                  {data.quantidadePorOcorrencia.avg.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-amber-50 p-6 rounded-lg">
                <span className="text-sm text-amber-600 font-medium mb-2">Mediana</span>
                <span className="text-3xl font-bold text-amber-700">
                  {data.quantidadePorOcorrencia.median}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardGraficosEspecies;
