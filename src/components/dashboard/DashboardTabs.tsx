
import React from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { LineChart, PieChart, BarChart4, MapPin } from 'lucide-react';
import DashboardGraficosGerais from './DashboardGraficosGerais';
import DashboardGraficosEspecies from './DashboardGraficosEspecies';
import DashboardGraficosDestinacao from './DashboardGraficosDestinacao';
import DashboardMapas from './DashboardMapas';
import { DashboardData } from '@/types/hotspots';

interface DashboardTabsProps {
  data: DashboardData;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  data, 
  activeTab,
  onTabChange 
}) => {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto bg-slate-50 p-1 rounded-xl">
        <TabsTrigger 
          value="geral" 
          className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
        >
          <LineChart className="h-4 w-4 mr-2" />
          Dados Gerais
        </TabsTrigger>
        <TabsTrigger 
          value="especies" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600"
        >
          <PieChart className="h-4 w-4 mr-2" />
          Espécies
        </TabsTrigger>
        <TabsTrigger 
          value="destinacao" 
          className="data-[state=active]:bg-white data-[state=active]:text-purple-600"
        >
          <BarChart4 className="h-4 w-4 mr-2" />
          Destinação
        </TabsTrigger>
        <TabsTrigger 
          value="mapas" 
          className="data-[state=active]:bg-white data-[state=active]:text-amber-600"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Mapas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="geral" className="mt-6">
        <DashboardGraficosGerais data={data} />
      </TabsContent>
      
      <TabsContent value="especies" className="mt-6">
        <DashboardGraficosEspecies data={data} />
      </TabsContent>
      
      <TabsContent value="destinacao" className="mt-6">
        <DashboardGraficosDestinacao data={data} />
      </TabsContent>
      
      <TabsContent value="mapas" className="mt-6">
        <DashboardMapas 
          dataOrigem={data?.mapDataOrigem || []} 
          dataSoltura={data?.mapDataSoltura || []} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
