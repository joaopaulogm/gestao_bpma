
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RescueStatistics } from '@/utils/dashboard/rescueStatisticsTransformations';
import { Users, Heart, Baby, Skull, Trophy } from 'lucide-react';

interface RescueStatisticsCardsProps {
  statistics: RescueStatistics;
}

const RescueStatisticsCards: React.FC<RescueStatisticsCardsProps> = ({ statistics }) => {
  const cards = [
    {
      title: 'Total de Resgates',
      value: statistics.totalResgates,
      icon: Users,
      color: 'text-[hsl(var(--chart-1))]',
      bgColor: 'bg-[hsl(var(--chart-1))]/10'
    },
    {
      title: 'Solturas',
      value: statistics.totalSolturas,
      icon: Heart,
      color: 'text-[hsl(var(--chart-2))]',
      bgColor: 'bg-[hsl(var(--chart-2))]/10'
    },
    {
      title: 'Filhotes',
      value: statistics.totalFilhotes,
      icon: Baby,
      color: 'text-[hsl(var(--chart-3))]',
      bgColor: 'bg-[hsl(var(--chart-3))]/10'
    },
    {
      title: 'Óbitos',
      value: statistics.totalObitos,
      icon: Skull,
      color: 'text-[hsl(var(--chart-4))]',
      bgColor: 'bg-[hsl(var(--chart-4))]/10'
    },
    {
      title: 'Recorde Diário',
      value: statistics.recordeDiario,
      subtitle: statistics.recordeDiarioData 
        ? new Date(statistics.recordeDiarioData).toLocaleDateString('pt-BR') 
        : '',
      icon: Trophy,
      color: 'text-[hsl(var(--chart-5))]',
      bgColor: 'bg-[hsl(var(--chart-5))]/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                  <p className="text-xl font-bold text-foreground">
                    {card.value.toLocaleString('pt-BR')}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RescueStatisticsCards;
