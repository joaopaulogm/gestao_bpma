
import React from 'react';
import { DashboardData } from '@/types/hotspots';
import { TrendingUp, TrendingDown, Layers, Target, Car, Bird, Users, ArrowUpRight } from 'lucide-react';

interface DashboardSummaryCardsProps {
  data: DashboardData;
}

const DashboardSummaryCards = ({ data }: DashboardSummaryCardsProps) => {
  // Validar dados
  if (!data || !data.metricas || !Array.isArray(data.metricas)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-muted/50 p-6 text-center text-muted-foreground">
          Dados não disponíveis
        </div>
      </div>
    );
  }
  
  // Função para renderizar o ícone correto
  const renderIcon = (iconType: string) => {
    const iconProps = { className: 'h-4 w-4' };
    
    switch (iconType) {
      case 'Layers':
        return <Layers {...iconProps} />;
      case 'Paw':
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

  // First card is highlighted (primary style), others are secondary
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {data.metricas.map((metric, index) => {
        const isHighlighted = index === 0;
        
        return (
          <div 
            key={index} 
            className={`
              relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 group
              ${isHighlighted 
                ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl col-span-2 lg:col-span-1' 
                : 'bg-card border border-border/50 hover:border-border hover:shadow-md'
              }
            `}
          >
            {/* Arrow icon top right - hidden on mobile for non-highlighted cards */}
            <div className={`
              absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full transition-colors duration-200
              ${isHighlighted 
                ? 'bg-primary-foreground/10 group-hover:bg-primary-foreground/20' 
                : 'bg-muted group-hover:bg-muted/80 hidden sm:block'
              }
            `}>
              <ArrowUpRight className={`h-3 w-3 sm:h-4 sm:w-4 ${isHighlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            
            {/* Title */}
            <p className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-3 pr-6 sm:pr-10 line-clamp-1 ${isHighlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {metric.title}
            </p>
            
            {/* Value */}
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-3 ${isHighlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
              {metric.value.toLocaleString('pt-BR')}
            </p>
            
            {/* Change indicator */}
            {metric.change !== undefined && (
              <div className={`
                flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium
                ${isHighlighted 
                  ? 'text-primary-foreground/80' 
                  : metric.change >= 0 
                    ? 'text-success' 
                    : 'text-destructive'
                }
              `}>
                <span className={`
                  inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0
                  ${isHighlighted 
                    ? 'bg-primary-foreground/20' 
                    : metric.change >= 0 
                      ? 'bg-success/10' 
                      : 'bg-destructive/10'
                  }
                `}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  ) : (
                    <TrendingDown className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                  )}
                </span>
                <span className="truncate">
                  {metric.change >= 0 ? '+' : ''}{Math.abs(metric.change)}%
                  <span className="hidden sm:inline"> vs. mês anterior</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardSummaryCards;
