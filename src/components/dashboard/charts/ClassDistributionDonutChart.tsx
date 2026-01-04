import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartCard from '../ChartCard';

interface ClassDistributionDonutChartProps {
  data: DashboardData;
}

const COLORS = [
  '#10b981', '#059669', '#047857', '#065f46', '#34d399', '#6ee7b7',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#60a5fa', '#93c5fd'
];

const ClassDistributionDonutChart: React.FC<ClassDistributionDonutChartProps> = ({ data }) => {
  const registros = data.rawData || [];
  
  const distribuicao = useMemo(() => {
    const classesMap = new Map<string, number>();
    
    registros.forEach((r: any) => {
      const classe = r.especie?.classe_taxonomica || r.classe_taxonomica;
      if (!classe) return;
      
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      classesMap.set(classe, (classesMap.get(classe) || 0) + quantidade);
    });
    
    const total = Array.from(classesMap.values()).reduce((a, b) => a + b, 0);
    
    return Array.from(classesMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentual: total > 0 ? (value / total) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [registros]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
          <p className="font-semibold text-sm mb-2 text-green-700">{data.name}</p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Quantidade:</span>{' '}
            <span className="font-bold text-green-700">{data.value?.toLocaleString('pt-BR') || 0}</span>
          </p>
          <p className="text-sm text-green-600">
            <span className="font-medium">Percentual:</span>{' '}
            <span className="font-bold text-green-700">{data.payload.percentual?.toFixed(1) || 0}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <ChartCard 
      title="Distribuição por Classe Taxonômica" 
      subtitle="Distribuição de resgates por classe"
    >
      {distribuicao.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={distribuicao}
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
              {distribuicao.map((entry, index) => (
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
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          Nenhum dado disponível
        </div>
      )}
    </ChartCard>
  );
};

export default ClassDistributionDonutChart;

