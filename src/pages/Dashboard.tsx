
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { processDashboardData } from '@/utils/dashboardDataProcessor';

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

  // Criar dados vazios usando useMemo para evitar recriação (hooks devem ser chamados sempre)
  const emptyData = useMemo(() => {
    return processDashboardData([]);
  }, []);

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

  // Se não há dados mas não está carregando, usar estrutura vazia processada
  const displayData = data || emptyData;
  
  if (!data) {
    console.warn("⚠️ [Dashboard] Sem dados disponíveis, usando estrutura vazia");
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
            classesDisponiveis={displayData?.classeTaxonomica?.map(c => c.name) || []}
            ultimaAtualizacao={displayData.ultimaAtualizacao}
            onFilterChange={updateFilters}
            onRefresh={handleRefresh}
            data={displayData}
            isLoading={isLoading}
          />
        </div>

        <DashboardSummaryCards data={displayData} />
        
        <DashboardTabs 
          data={displayData} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
