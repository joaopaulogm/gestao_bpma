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
  Cell,
  AreaChart,
  Area
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
    <div className="space-y-6">
      {/* Grid com os dois gráficos de série temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Resgates */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                Resgates por Mês - {year}
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-primary/10">
                Total: {monthlyData.reduce((s, m) => s + m.resgates, 0).toLocaleString('pt-BR')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorResgates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Resgates']}
                  />
                  <Area
                    type="monotone"
                    dataKey="resgates"
                    name="Resgates"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorResgates)"
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Solturas, Óbitos e Feridos */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                Desfechos por Mês - {year}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                  Solturas: {monthlyData.reduce((s, m) => s + m.solturas, 0).toLocaleString('pt-BR')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    formatter={(value: number, name: string) => [value.toLocaleString('pt-BR'), name]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="solturas"
                    name="Solturas"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="obitos"
                    name="Óbitos"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="feridos"
                    name="Feridos"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda com totais */}
            <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  Solturas: <span className="font-medium text-foreground">{monthlyData.reduce((s, m) => s + m.solturas, 0).toLocaleString('pt-BR')}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  Óbitos: <span className="font-medium text-foreground">{monthlyData.reduce((s, m) => s + m.obitos, 0).toLocaleString('pt-BR')}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">
                  Feridos: <span className="font-medium text-foreground">{monthlyData.reduce((s, m) => s + m.feridos, 0).toLocaleString('pt-BR')}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Classe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

export default DashboardOperacionalCharts;
