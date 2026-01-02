
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const Dashboard = () => {
  const { 
    data, 
    isLoading, 
    error, 
    filters, 
    updateFilters,
    refetch
  } = useDashboardData();
  
  // Initialize year filter to 2025 when component mounts
  useEffect(() => {
    // Apenas definir filtros iniciais se ainda não foram definidos
    if (!filters.year) {
      updateFilters({ year: 2025, month: null });
    }
  }, []);
  
  const [activeTab, setActiveTab] = useState("geral");
  
  const handleRefresh = () => {
    console.log("Refreshing dashboard data");
    refetch();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <DashboardLoading />
      </Layout>
    );
  }

  // NUNCA mostrar tela de erro - sempre mostrar dados (mesmo que vazios)
  // Se não há dados ainda, mostrar loading
  if (!data && isLoading) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <DashboardLoading />
      </Layout>
    );
  }

  // Se não há dados mas não está carregando, criar estrutura vazia
  if (!data) {
    console.warn("⚠️ [Dashboard] Sem dados disponíveis, criando estrutura vazia");
    // Retornar estrutura vazia processada
    const emptyData = {
      totalRegistros: 0,
      totalResgates: 0,
      totalApreensoes: 0,
      totalAtropelamentos: 0,
      timeSeriesData: [],
      regiaoAdministrativa: [],
      origemDistribuicao: [],
      classeTaxonomica: [],
      desfechoResgate: [],
      desfechoApreensao: [],
      estadoSaude: [],
      destinacaoTipos: [],
      atropelamentoDistribuicao: [],
      estagioVidaDistribuicao: [],
      especiesMaisResgatadas: [],
      especiesMaisApreendidas: [],
      especiesAtropeladas: [],
      motivosEntregaCEAPA: [],
      mapDataOrigem: [],
      mapDataSoltura: [],
      quantidadePorOcorrencia: { min: 0, max: 0, avg: 0, median: 0 },
      metricas: [],
      ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
      distribuicaoPorClasse: [],
      destinos: [],
      desfechos: [],
      atropelamentos: [],
      rawData: []
    };
    
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <DashboardHeader 
              year={filters.year}
              month={filters.month}
              origem={filters.origem}
              classeTaxonomica={filters.classeTaxonomica}
              classesDisponiveis={[]}
              ultimaAtualizacao={emptyData.ultimaAtualizacao}
              onFilterChange={updateFilters}
              onRefresh={handleRefresh}
              data={emptyData}
              isLoading={isLoading}
            />
          </div>

          <DashboardSummaryCards data={emptyData} />
          
          <DashboardTabs 
            data={emptyData} 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Painel de Dados" showBackButton>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <DashboardHeader 
            year={filters.year}
            month={filters.month}
            origem={filters.origem}
            classeTaxonomica={filters.classeTaxonomica}
            classesDisponiveis={data?.classeTaxonomica?.map(c => c.name) || []}
            ultimaAtualizacao={data.ultimaAtualizacao}
            onFilterChange={updateFilters}
            onRefresh={handleRefresh}
            data={data}
            isLoading={isLoading}
          />
        </div>

        <DashboardSummaryCards data={data} />
        
        <DashboardTabs 
          data={data} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
