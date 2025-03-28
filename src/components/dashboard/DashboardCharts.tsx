
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import ChartCard from './ChartCard';
import { 
  BarChart, 
  PieChart, 
  Cell, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Pie, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardChartsProps {
  data: DashboardData;
}

// New enhanced color palette
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium" style={{ color: payload[0].color }}>
            {payload[0].name}: 
          </span>{' '}
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <ChartCard title="Distribuição por Classe">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
            <Pie
              data={data.distribuicaoPorClasse}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="80%"
              innerRadius="40%"
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.distribuicaoPorClasse.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Destinos">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.destinos} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={25}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Bar 
              dataKey="value" 
              name="Quantidade" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            >
              <LabelList dataKey="value" position="top" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Desfechos de Apreensão">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.desfechos} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={25}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Bar 
              dataKey="value" 
              name="Quantidade" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]} 
            >
              <LabelList dataKey="value" position="top" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Espécies Mais Resgatadas">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.especiesMaisResgatadas} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={25}
            layout="vertical"
          >
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Bar 
              dataKey="quantidade" 
              name="Quantidade" 
              fill="#f97316" 
              radius={[0, 4, 4, 0]} 
            >
              <LabelList dataKey="quantidade" position="right" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Espécies Mais Apreendidas">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.especiesMaisApreendidas} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={25}
            layout="vertical"
          >
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Bar 
              dataKey="quantidade" 
              name="Quantidade" 
              fill="#10b981" 
              radius={[0, 4, 4, 0]} 
            >
              <LabelList dataKey="quantidade" position="right" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Animais Atropelados por Espécie">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data.atropelamentos} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={25}
            layout="vertical"
          >
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '10px' }}
            />
            <Bar 
              dataKey="quantidade" 
              name="Quantidade" 
              fill="#ec4899" 
              radius={[0, 4, 4, 0]} 
            >
              <LabelList dataKey="quantidade" position="right" style={{ fontSize: '11px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default DashboardCharts;
