import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DistribuicaoClasse } from '@/hooks/useHistoricalData';
import { PieChart } from 'lucide-react';

interface ClassDistributionChartProps {
  data: DistribuicaoClasse[];
  isLoading?: boolean;
}

export const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribuição por Classe Taxonômica
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

  // Transform data for stacked bar chart by year
  const years = [...new Set(data.map(d => d.ano))].sort();
  const classes = [...new Set(data.map(d => d.classe_taxonomica))];
  
  const chartData = years.map(year => {
    const yearData: any = { ano: year };
    classes.forEach(classe => {
      const found = data.find(d => d.ano === year && d.classe_taxonomica === classe);
      yearData[classe] = found?.total_resgates || 0;
    });
    return yearData;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">Ano {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} resgates
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
          <PieChart className="h-5 w-5 text-primary" />
          Distribuição por Classe Taxonômica por Ano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 20, right: 20 }}>
              <XAxis dataKey="ano" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="AVES" stackId="a" fill="hsl(var(--chart-1))" name="Aves" />
              <Bar dataKey="MAMÍFEROS" stackId="a" fill="hsl(var(--chart-2))" name="Mamíferos" />
              <Bar dataKey="RÉPTEIS" stackId="a" fill="hsl(var(--chart-3))" name="Répteis" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
