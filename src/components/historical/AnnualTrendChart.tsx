import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DistribuicaoClasse } from '@/hooks/useHistoricalData';
import { TrendingUp } from 'lucide-react';

interface AnnualTrendChartProps {
  data: DistribuicaoClasse[];
  isLoading?: boolean;
}

export const AnnualTrendChart: React.FC<AnnualTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução Anual de Resgates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Aggregate by year
  const years = [...new Set(data.map(d => d.ano))].sort();
  const chartData = years.map(year => {
    const yearData = data.filter(d => d.ano === year);
    return {
      ano: year,
      resgates: yearData.reduce((sum, d) => sum + d.total_resgates, 0),
      registros: yearData.reduce((sum, d) => sum + d.registros, 0),
      obitos: yearData.reduce((sum, d) => sum + d.total_obitos, 0),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">Ano {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolução Anual de Resgates (2020-2024)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="resgates" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={3}
                name="Animais Resgatados"
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="registros" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Ocorrências"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="obitos" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Óbitos"
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
