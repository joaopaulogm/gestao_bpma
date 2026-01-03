
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.metricas.map((metric, index) => {
        const isHighlighted = index === 0;
        
        return (
          <div 
            key={index} 
            className={`
              relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group
              ${isHighlighted 
                ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl' 
                : 'bg-card border border-border/50 hover:border-border hover:shadow-md'
              }
            `}
          >
            {/* Arrow icon top right */}
            <div className={`
              absolute top-4 right-4 p-2 rounded-full transition-colors duration-200
              ${isHighlighted 
                ? 'bg-primary-foreground/10 group-hover:bg-primary-foreground/20' 
                : 'bg-muted group-hover:bg-muted/80'
              }
            `}>
              <ArrowUpRight className={`h-4 w-4 ${isHighlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            </div>
            
            {/* Title */}
            <p className={`text-sm font-medium mb-3 pr-10 ${isHighlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {metric.title}
            </p>
            
            {/* Value */}
            <p className={`text-4xl font-bold mb-3 ${isHighlighted ? 'text-primary-foreground' : 'text-foreground'}`}>
              {metric.value.toLocaleString('pt-BR')}
            </p>
            
            {/* Change indicator */}
            {metric.change !== undefined && (
              <div className={`
                flex items-center gap-1.5 text-xs font-medium
                ${isHighlighted 
                  ? 'text-primary-foreground/80' 
                  : metric.change >= 0 
                    ? 'text-success' 
                    : 'text-destructive'
                }
              `}>
                <span className={`
                  inline-flex items-center justify-center w-4 h-4 rounded-full
                  ${isHighlighted 
                    ? 'bg-primary-foreground/20' 
                    : metric.change >= 0 
                      ? 'bg-success/10' 
                      : 'bg-destructive/10'
                  }
                `}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                </span>
                <span>
                  {metric.change >= 0 ? '+' : ''}{Math.abs(metric.change)}% vs. mês anterior
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
