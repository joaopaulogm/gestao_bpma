import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useHistoricalData, HistoricalFilters } from '@/hooks/useHistoricalData';
import { TopSpeciesChart } from '@/components/historical/TopSpeciesChart';
import { ClassDistributionChart } from '@/components/historical/ClassDistributionChart';
import { AnnualTrendChart } from '@/components/historical/AnnualTrendChart';
import { HistoricalSummaryCards } from '@/components/historical/HistoricalSummaryCards';
import { HistoricalFilters as FiltersComponent } from '@/components/historical/HistoricalFilters';
import { HistoricalExport } from '@/components/historical/HistoricalExport';
import { History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardHistorico = () => {
  const [filters, setFilters] = useState<HistoricalFilters>({
    ano: null,
    classe: null,
    estadoConservacao: null
  });

  const {
    topSpecies,
    classDistribution,
    annualSummary,
    classes,
    conservationStates,
    isLoading,
    error,
    refetch
  } = useHistoricalData(filters);

  if (error) {
    console.error('Dashboard Histórico error:', error);
  }

  return (
    <Layout title="Dashboard Histórico" showBackButton>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Histórico</h1>
              <p className="text-muted-foreground text-sm">Análise de resgates de fauna 2020-2024</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <HistoricalExport
              topSpecies={topSpecies}
              classDistribution={classDistribution}
              annualSummary={annualSummary}
              filters={filters}
              isLoading={isLoading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FiltersComponent
          filters={filters}
          onFilterChange={setFilters}
          classes={classes}
          conservationStates={conservationStates}
        />

        {/* Summary Cards */}
        <HistoricalSummaryCards
          classDistribution={classDistribution}
          topSpecies={topSpecies}
          isLoading={isLoading}
        />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnnualTrendChart data={classDistribution} isLoading={isLoading} />
          <ClassDistributionChart data={classDistribution} isLoading={isLoading} />
        </div>

        {/* Top Species Chart (Full Width) */}
        <TopSpeciesChart data={topSpecies} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default DashboardHistorico;
