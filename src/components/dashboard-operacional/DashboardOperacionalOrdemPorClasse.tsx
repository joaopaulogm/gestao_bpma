import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export interface OrdemDistribuicao {
  ordem: string;
  quantidade: number;
  percentual: number;
}

export interface ClasseOrdemData {
  classe: string;
  ordens: OrdemDistribuicao[];
  total: number;
}

interface DashboardOperacionalOrdemPorClasseProps {
  data: ClasseOrdemData[];
  year: number;
}

const CLASSE_COLORS: Record<string, string[]> = {
  'AVES': [
    'hsl(221, 83%, 53%)', // blue
    'hsl(221, 83%, 63%)',
    'hsl(221, 83%, 43%)',
    'hsl(199, 89%, 48%)', // sky
    'hsl(199, 89%, 58%)',
    'hsl(199, 89%, 38%)',
    'hsl(186, 67%, 45%)', // cyan
    'hsl(186, 67%, 55%)',
    'hsl(186, 67%, 35%)',
    'hsl(210, 40%, 60%)',
    'hsl(210, 40%, 50%)',
    'hsl(210, 40%, 40%)',
  ],
  'MAMÍFEROS': [
    'hsl(142, 76%, 36%)', // green
    'hsl(142, 76%, 46%)',
    'hsl(142, 76%, 26%)',
    'hsl(160, 84%, 39%)', // emerald
    'hsl(160, 84%, 49%)',
    'hsl(160, 84%, 29%)',
    'hsl(158, 64%, 52%)', // teal
    'hsl(158, 64%, 42%)',
    'hsl(158, 64%, 32%)',
    'hsl(120, 40%, 50%)',
    'hsl(120, 40%, 40%)',
    'hsl(120, 40%, 30%)',
  ],
  'RÉPTEIS': [
    'hsl(38, 92%, 50%)', // amber
    'hsl(38, 92%, 60%)',
    'hsl(38, 92%, 40%)',
    'hsl(32, 95%, 44%)', // orange
    'hsl(32, 95%, 54%)',
    'hsl(32, 95%, 34%)',
    'hsl(45, 93%, 47%)', // yellow
    'hsl(45, 93%, 57%)',
    'hsl(45, 93%, 37%)',
    'hsl(25, 80%, 50%)',
    'hsl(25, 80%, 40%)',
    'hsl(25, 80%, 30%)',
  ],
  'PEIXES': [
    'hsl(280, 65%, 60%)', // purple
    'hsl(280, 65%, 70%)',
    'hsl(280, 65%, 50%)',
    'hsl(270, 65%, 55%)',
    'hsl(270, 65%, 45%)',
    'hsl(290, 55%, 50%)',
  ],
  'ANFÍBIOS': [
    'hsl(0, 84%, 60%)', // red
    'hsl(0, 84%, 50%)',
    'hsl(0, 84%, 70%)',
    'hsl(350, 80%, 55%)',
    'hsl(10, 80%, 55%)',
  ],
};

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(221, 83%, 53%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 84%, 60%)',
  'hsl(180, 70%, 45%)',
  'hsl(320, 70%, 50%)',
];

const DashboardOperacionalOrdemPorClasse: React.FC<DashboardOperacionalOrdemPorClasseProps> = ({
  data,
  year
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  const getColorsForClasse = (classe: string) => {
    return CLASSE_COLORS[classe] || DEFAULT_COLORS;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Distribuição por Ordem Taxonômica - {year}</h3>
        <Badge variant="outline" className="text-xs">
          Por Classe
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((classeData) => {
          const colors = getColorsForClasse(classeData.classe);
          const topOrdens = classeData.ordens.slice(0, 8);
          const outrasOrdens = classeData.ordens.slice(8);
          
          // Agrupar ordens menores em "Outras"
          const chartData = [...topOrdens];
          if (outrasOrdens.length > 0) {
            const outrasTotal = outrasOrdens.reduce((sum, o) => sum + o.quantidade, 0);
            const outrasPercentual = outrasOrdens.reduce((sum, o) => sum + o.percentual, 0);
            chartData.push({
              ordem: 'Outras',
              quantidade: outrasTotal,
              percentual: outrasPercentual
            });
          }

          return (
            <Card key={classeData.classe}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    {classeData.classe}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {classeData.total.toLocaleString('pt-BR')} animais
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="quantidade"
                        nameKey="ordem"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={70}
                        paddingAngle={2}
                        label={({ percentual }) => 
                          percentual >= 5 ? `${percentual.toFixed(0)}%` : ''
                        }
                        labelLine={false}
                      >
                        {chartData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={colors[index % colors.length]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString('pt-BR')} (${((value / classeData.total) * 100).toFixed(1)}%)`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legenda compacta */}
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs max-h-28 overflow-y-auto">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 truncate">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <span className="text-muted-foreground truncate" title={item.ordem}>
                        {item.ordem}
                      </span>
                      <span className="text-foreground font-medium ml-auto">
                        {item.percentual.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOperacionalOrdemPorClasse;
