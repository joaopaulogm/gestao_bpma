
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Activity, 
  Calendar, 
  Filter, 
  BarChart4, 
  PieChart, 
  LineChart, 
  MapPin, 
  RefreshCw
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import DashboardExport from '@/components/dashboard/DashboardExport';
import DashboardDateFilter from '@/components/dashboard/DashboardDateFilter';
import DashboardTypeFilter from '@/components/dashboard/DashboardTypeFilter';
import DashboardGraficosGerais from '@/components/dashboard/DashboardGraficosGerais';
import DashboardGraficosEspecies from '@/components/dashboard/DashboardGraficosEspecies';
import DashboardGraficosDestinacao from '@/components/dashboard/DashboardGraficosDestinacao';
import DashboardMapas from '@/components/dashboard/DashboardMapas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { 
    data, 
    isLoading, 
    error, 
    filters, 
    updateFilters,
    refetch
  } = useDashboardData();
  
  const [activeTab, setActiveTab] = useState("geral");
  
  const handleRefresh = () => {
    refetch();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-lg text-slate-600">Carregando dados...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <div className="text-lg text-red-500 font-medium">Erro ao carregar dados do painel</div>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Ocorreu um problema ao buscar os dados. Por favor, tente novamente mais tarde ou contacte o suporte.
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Painel de Dados" showBackButton>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart4 className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-semibold text-slate-800">
                  Dashboard de Fauna
                </h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {filters.year}
                  {filters.month !== null ? 
                    ` - ${new Date(filters.year, filters.month).toLocaleString('pt-BR', { month: 'long' })}` : 
                    ' - Ano todo'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <DashboardExport 
                  data={data} 
                  year={filters.year} 
                  month={filters.month}
                  isLoading={isLoading}
                />
                <Button 
                  variant="ghost" 
                  onClick={handleRefresh}
                  className="h-9 w-9 p-0"
                  title="Atualizar dados"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <DashboardDateFilter
                  year={filters.year}
                  month={filters.month}
                  onFilterChange={(year, month) => 
                    updateFilters({ year, month })
                  }
                />
                
                <DashboardTypeFilter
                  origem={filters.origem}
                  classeTaxonomica={filters.classeTaxonomica}
                  onFilterChange={(filters) => updateFilters(filters)}
                  classesDisponiveis={data.classeTaxonomica.map(c => c.name)}
                />
              </div>
              
              <div className="text-xs text-slate-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1 inline" />
                Última atualização: {data.ultimaAtualizacao}
              </div>
            </div>
          </div>
        </div>

        <DashboardSummaryCards data={data} />
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
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
              dataOrigem={data.mapDataOrigem} 
              dataSoltura={data.mapDataSoltura} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
