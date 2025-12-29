
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Layers, Target, Car, Bird, Users } from 'lucide-react';

interface DashboardSummaryCardsProps {
  data: DashboardData;
}

const DashboardSummaryCards = ({ data }: DashboardSummaryCardsProps) => {
  // Função para renderizar o ícone correto
  const renderIcon = (iconType: string, iconColor: string) => {
    const iconProps = { className: `h-5 w-5 ${iconColor}` };
    
    switch (iconType) {
      case 'Layers':
        return <Layers {...iconProps} />;
      case 'Paw':
        // Como não existe o ícone Paw, vamos usar o Bird como substituto
        return <Bird {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Car':
        return <Car {...iconProps} />;
      case 'Bird':
        return <Bird {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      default:
        return <Layers {...iconProps} />;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      {data.metricas.map((metric, index) => (
        <Card key={index} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
                {metric.title}
              </span>
              <div className="bg-muted p-1 sm:p-1.5 rounded-full flex-shrink-0">
                {renderIcon(metric.iconType, metric.iconColor)}
              </div>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {metric.value.toLocaleString('pt-BR')}
            </div>
            {metric.change !== undefined && (
              <div className={`flex items-center mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium ${
                metric.change >= 0 ? "text-success" : "text-destructive"
              }`}>
                {metric.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                <span className="hidden sm:inline">{Math.abs(metric.change)}% vs. período anterior</span>
                <span className="sm:hidden">{Math.abs(metric.change)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
