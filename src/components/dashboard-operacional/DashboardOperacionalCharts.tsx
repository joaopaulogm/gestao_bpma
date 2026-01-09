import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MonthlyData, ClasseDistribuicao } from './DashboardOperacionalContent';

interface DashboardOperacionalChartsProps {
  monthlyData: MonthlyData[];
  classeData: ClasseDistribuicao[];
  year: number;
  isHistorico: boolean;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)', // green
  'hsl(221, 83%, 53%)', // blue
  'hsl(38, 92%, 50%)',  // amber
  'hsl(280, 65%, 60%)', // purple
  'hsl(0, 84%, 60%)',   // red
  'hsl(180, 70%, 45%)'  // cyan
];

const DashboardOperacionalCharts: React.FC<DashboardOperacionalChartsProps> = ({
  monthlyData,
  classeData,
  year,
  isHistorico
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Série Temporal Mensal */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              Evolução Mensal - {year}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Resgates por mês
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="mesNome" 
                  tick={{ fontSize: 11 }}
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
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="resgates"
                  name="Resgates"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                {isHistorico && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="solturas"
                      name="Solturas"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="obitos"
                      name="Óbitos"
                      stroke="hsl(0, 84%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Classe */}
      {classeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Distribuição por Classe Taxonômica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classeData}
                    dataKey="quantidade"
                    nameKey="classe"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ classe, percentual }) => 
                      percentual > 5 ? `${classe}: ${percentual.toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {classeData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toLocaleString('pt-BR'),
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda */}
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {classeData.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.classe}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder para gráfico adicional */}
      {!isHistorico && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">
              Ocorrências por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-sm">
              Gráfico disponível quando houver dados de crimes e prevenção
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardOperacionalCharts;
