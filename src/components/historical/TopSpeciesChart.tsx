import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EspecieResumo } from '@/hooks/useHistoricalData';
import { Trophy } from 'lucide-react';

interface TopSpeciesChartProps {
  data: EspecieResumo[];
  isLoading?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(142, 76%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(339, 90%, 51%)',
];

export const TopSpeciesChart: React.FC<TopSpeciesChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top 10 Espécies Mais Resgatadas (2020-2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.nome_popular,
    cientifico: item.nome_cientifico,
    resgates: item.total_resgates,
    ocorrencias: item.num_ocorrencias,
    filhotes: item.total_filhotes,
    obitos: item.total_obitos,
    classe: item.classe_taxonomica,
    fill: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-xs text-muted-foreground italic">{data.cientifico}</p>
          <p className="text-sm text-muted-foreground">Classe: {data.classe}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-primary font-medium">Total Resgates: {data.resgates.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Ocorrências: {data.ocorrencias}</p>
            <p className="text-sm text-muted-foreground">Filhotes: {data.filhotes}</p>
            <p className="text-sm text-destructive">Óbitos: {data.obitos}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Top 10 Espécies Mais Resgatadas (2020-2024)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="resgates" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
