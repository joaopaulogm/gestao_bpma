
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSummaryCards from '@/components/dashboard/DashboardSummaryCards';
import DashboardAdvancedKPIs from '@/components/dashboard/DashboardAdvancedKPIs';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import DashboardYearTabs from '@/components/dashboard/DashboardYearTabs';
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

  const handleYearChange = (year: number) => {
    updateFilters({ year, month: null });
  };

  // Criar dados vazios usando useMemo para evitar recriação (hooks devem ser chamados sempre)
  const emptyData = useMemo(() => {
    return processDashboardData([]);
  }, []);

  if (isLoading) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="space-y-6">
          <DashboardYearTabs 
            selectedYear={filters.year} 
            onYearChange={handleYearChange} 
          />
          <DashboardLoading />
        </div>
      </Layout>
    );
  }

  // NUNCA mostrar tela de erro - sempre mostrar dados (mesmo que vazios)
  if (!data && isLoading) {
    return (
      <Layout title="Painel de Dados" showBackButton>
        <div className="space-y-6">
          <DashboardYearTabs 
            selectedYear={filters.year} 
            onYearChange={handleYearChange} 
          />
          <DashboardLoading />
        </div>
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
      <div className="space-y-6 animate-fade-in">
        {/* Header with title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe e analise os dados de fauna com facilidade.
            </p>
          </div>
          <DashboardHeader 
            year={filters.year}
            month={filters.month}
            origem={filters.origem}
            classeTaxonomica={filters.classeTaxonomica}
            classesDisponiveis={displayData?.classeTaxonomica?.map(c => c.name) || []}
            ultimaAtualizacao={displayData.ultimaAtualizacao}
            filters={filters}
            onFilterChange={updateFilters}
            onRefresh={handleRefresh}
            data={displayData}
            isLoading={isLoading}
          />
        </div>

        {/* Year tabs */}
        <DashboardYearTabs 
          selectedYear={filters.year} 
          onYearChange={handleYearChange} 
        />

        {/* Summary cards */}
        <DashboardSummaryCards data={displayData} />
        
        {/* Advanced KPIs */}
        <DashboardAdvancedKPIs 
          data={displayData} 
          year={filters.year} 
          month={filters.month}
        />
        
        {/* Content tabs */}
        <DashboardTabs 
          data={displayData} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          year={filters.year}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
