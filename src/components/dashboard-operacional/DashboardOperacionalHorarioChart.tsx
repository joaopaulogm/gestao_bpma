import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { Clock } from 'lucide-react';

interface HorarioData {
  periodo: string;
  faixa: string;
  quantidade: number;
  cor: string;
}

interface DashboardOperacionalHorarioChartProps {
  data: HorarioData[];
  year: number;
}

const DashboardOperacionalHorarioChart: React.FC<DashboardOperacionalHorarioChartProps> = ({
  data,
  year
}) => {
  const total = data.reduce((sum, item) => sum + item.quantidade, 0);
  const maiorFaixa = data.reduce((max, item) => item.quantidade > max.quantidade ? item : max, data[0]);

  if (total === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              Distribuição por Horário de Acionamento - {year}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/10">
            Total: {total.toLocaleString('pt-BR')}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          Maior concentração: <span className="font-semibold text-primary">{maiorFaixa?.periodo}</span> ({maiorFaixa?.faixa})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 10 }}
                angle={-25}
                textAnchor="end"
                height={60}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString('pt-BR')} ocorrências`,
                  props.payload.faixa
                ]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Bar 
                dataKey="quantidade" 
                name="Quantidade"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda dos períodos */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.cor }}
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{item.periodo}</div>
                <div className="text-muted-foreground">{item.faixa}</div>
                <div className="font-semibold">{item.quantidade.toLocaleString('pt-BR')}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardOperacionalHorarioChart;
