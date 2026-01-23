
import React from 'react';
import { LineChart, PieChart, BarChart4, MapPin } from 'lucide-react';
import DashboardGraficosGerais from './DashboardGraficosGerais';
import DashboardGraficosEspecies from './DashboardGraficosEspecies';
import DashboardGraficosDestinacao from './DashboardGraficosDestinacao';
import DashboardMapas from './DashboardMapas';
import { DashboardData } from '@/types/hotspots';
import { cn } from '@/lib/utils';

interface DashboardTabsProps {
  data: DashboardData;
  activeTab: string;
  onTabChange: (value: string) => void;
  year?: number;
}

const tabs = [
  { id: 'geral', label: 'Dados Gerais', icon: LineChart },
  { id: 'especies', label: 'Espécies', icon: PieChart },
  { id: 'destinacao', label: 'Destinação', icon: BarChart4 },
  { id: 'mapas', label: 'Mapas', icon: MapPin },
];

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  data, 
  activeTab,
  onTabChange,
  year = 2025
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                "border touch-target",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border/50 hover:border-border hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'geral' && <DashboardGraficosGerais data={data} year={year} />}
        {activeTab === 'especies' && <DashboardGraficosEspecies data={data} />}
        {activeTab === 'destinacao' && <DashboardGraficosDestinacao data={data} />}
        {activeTab === 'mapas' && (
          <DashboardMapas 
            dataOrigem={data?.mapDataOrigem || []} 
            dataSoltura={data?.mapDataSoltura || []} 
          />
        )}
      </div>
    </div>
  );
};

export default DashboardTabs;
