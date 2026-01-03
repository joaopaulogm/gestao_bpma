
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { WeekdayDistribution, getTopWeekdays } from '@/utils/dashboard/rescueStatisticsTransformations';
import { CHART_COLORS, CustomTooltip } from './ChartUtils';
import { Calendar } from 'lucide-react';

interface WeekdayScatterChartProps {
  data: WeekdayDistribution[];
}

const WeekdayScatterChart: React.FC<WeekdayScatterChartProps> = ({ data }) => {
  const top3 = getTopWeekdays(data);
  
  // Marcar os top 3 nos dados
  const chartData = data.map(item => ({
    ...item,
    isTop3: top3.some(t => t.name === item.name),
    rank: top3.findIndex(t => t.name === item.name) + 1
  }));

  const getBarColor = (index: number, isTop3: boolean) => {
    if (!isTop3) return CHART_COLORS.muted;
    return [CHART_COLORS.yellow, CHART_COLORS.green, CHART_COLORS.navy][index] || CHART_COLORS.navy;
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold text-foreground">
            Resgates por Dia da Semana
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Top 3 dias destacados
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isTop3 
                      ? getBarColor(entry.rank - 1, true) 
                      : CHART_COLORS.muted
                    }
                    opacity={entry.isTop3 ? 1 : 0.5}
                  />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="hsl(var(--foreground))"
                  fontSize={11}
                  formatter={(value: number) => value.toLocaleString('pt-BR')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top 3 Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {top3.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getBarColor(index, true) }}
              />
              <span className="text-sm text-muted-foreground">
                {index + 1}º {item.fullName}: <span className="font-medium text-foreground">{item.value.toLocaleString('pt-BR')}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekdayScatterChart;
