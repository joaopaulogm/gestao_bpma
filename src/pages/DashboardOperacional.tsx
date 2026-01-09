import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardOperacionalYearTabs from '@/components/dashboard-operacional/DashboardOperacionalYearTabs';
import DashboardOperacionalContent from '@/components/dashboard-operacional/DashboardOperacionalContent';
import { toast } from 'sonner';

const DashboardOperacional: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Buscar anos disponíveis
  const { data: availableYears, isLoading: loadingYears } = useQuery({
    queryKey: ['dashboard-operacional-anos'],
    queryFn: async (): Promise<number[]> => {
      // Anos históricos conhecidos (tabelas fat_resgates_diarios_YYYY)
      const knownHistoricYears = [2025, 2024, 2023, 2022, 2021, 2020];

      // Também buscar anos de fat_registros_de_resgate (2026+)
      const { data: recentYears } = await supabase
        .from('fat_registros_de_resgate')
        .select('data')
        .gte('data', '2026-01-01');
      
      const recentYearSet = new Set<number>();
      recentYears?.forEach(r => {
        const year = new Date(r.data).getFullYear();
        if (year >= 2026) recentYearSet.add(year);
      });

      const allYears = new Set<number>([
        ...knownHistoricYears,
        ...recentYearSet
      ]);

      return Array.from(allYears).sort((a, b) => b - a);
    },
    staleTime: 10 * 60 * 1000 // 10 min
  });

  const handleRefresh = () => {
    toast.info('Atualizando dados...');
    window.location.reload();
  };

  if (loadingYears) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const years = availableYears || [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Dashboard Operacional
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Year Tabs */}
      <DashboardOperacionalYearTabs
        years={years}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {/* Content */}
      <DashboardOperacionalContent year={selectedYear} />
    </div>
  );
};

export default DashboardOperacional;
