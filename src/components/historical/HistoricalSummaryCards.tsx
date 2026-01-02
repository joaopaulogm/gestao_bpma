import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DistribuicaoClasse, EspecieResumo } from '@/hooks/useHistoricalData';
import { Bird, Skull, Baby, Activity } from 'lucide-react';

interface HistoricalSummaryCardsProps {
  classDistribution: DistribuicaoClasse[];
  topSpecies: EspecieResumo[];
  isLoading?: boolean;
}

export const HistoricalSummaryCards: React.FC<HistoricalSummaryCardsProps> = ({ 
  classDistribution, 
  topSpecies,
  isLoading 
}) => {
  const totalResgates = classDistribution.reduce((sum, d) => sum + d.total_resgates, 0);
  const totalOcorrencias = classDistribution.reduce((sum, d) => sum + d.registros, 0);
  const totalObitos = classDistribution.reduce((sum, d) => sum + d.total_obitos, 0);
  const totalFilhotes = topSpecies.reduce((sum, s) => sum + s.total_filhotes, 0);

  const cards = [
    {
      title: 'Total de Animais Resgatados',
      value: totalResgates.toLocaleString(),
      icon: Bird,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total de Ocorrências',
      value: totalOcorrencias.toLocaleString(),
      icon: Activity,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    {
      title: 'Filhotes Resgatados',
      value: totalFilhotes.toLocaleString(),
      icon: Baby,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10'
    },
    {
      title: 'Óbitos Registrados',
      value: totalObitos.toLocaleString(),
      icon: Skull,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-20 animate-pulse bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
