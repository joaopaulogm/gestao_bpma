
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.metricas.map((metric, index) => (
        <Card key={index} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-500">
                {metric.title}
              </span>
              <div className="bg-slate-100 p-1.5 rounded-full">
                {renderIcon(metric.iconType, metric.iconColor)}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {metric.value.toLocaleString('pt-BR')}
            </div>
            {metric.change !== undefined && (
              <div className={`flex items-center mt-2 text-xs font-medium ${
                metric.change >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {metric.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(metric.change)}% vs. período anterior
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
