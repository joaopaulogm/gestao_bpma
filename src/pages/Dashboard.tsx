
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

  if (error) {
    console.error("Dashboard error:", error);
    return (
      <Layout title="Painel de Dados" showBackButton>
        <DashboardLoading isError onRefresh={handleRefresh} />
      </Layout>
    );
  }

  // Se não há dados mas não há erro, mostrar dados vazios ao invés de erro
  if (!data) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <DashboardLoading />
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
