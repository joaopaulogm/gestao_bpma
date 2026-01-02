
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Layers, Target, Car, Bird, Users } from 'lucide-react';

interface DashboardSummaryCardsProps {
  data: DashboardData;
}

const DashboardSummaryCards = ({ data }: DashboardSummaryCardsProps) => {
  // Validar dados
  if (!data || !data.metricas || !Array.isArray(data.metricas)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 text-center text-muted-foreground">
          Dados não disponíveis
        </Card>
      </div>
    );
  }
  
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.metricas.map((metric, index) => (
        <Card 
          key={index} 
          className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/30 group"
        >
          <CardContent className="p-6 flex flex-col relative">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-sm font-medium text-muted-foreground line-clamp-2 flex-1">
                {metric.title}
              </span>
              <div className="bg-gradient-to-br from-muted to-muted/50 p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 flex-shrink-0 ml-3">
                {renderIcon(metric.iconType, metric.iconColor)}
              </div>
            </div>
            
            <div className="text-3xl font-bold text-foreground mb-2 relative z-10 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {metric.value.toLocaleString('pt-BR')}
            </div>
            
            {metric.change !== undefined && (
              <div className={`flex items-center mt-auto pt-2 text-xs font-medium relative z-10 ${
                metric.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}>
                <div className={`p-1 rounded-md mr-2 ${
                  metric.change >= 0 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-red-100 dark:bg-red-900/30"
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </div>
                <span>{Math.abs(metric.change)}% vs. período anterior</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
