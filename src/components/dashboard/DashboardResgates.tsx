import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { DashboardData } from '@/types/hotspots';
import DashboardGraficosGerais from './DashboardGraficosGerais';
import DashboardGraficosEspecies from './DashboardGraficosEspecies';
import DashboardGraficosDestinacao from './DashboardGraficosDestinacao';
import DashboardMapas from './DashboardMapas';
import DashboardSazonalidade from './DashboardSazonalidade';
import DashboardComparativos from './DashboardComparativos';
import DashboardResgates2020_2025 from './charts/DashboardResgates2020_2025';

interface DashboardResgatesProps {
  data: DashboardData;
  filters: any;
  onFilterChange: (filters: any) => void;
}

const DashboardResgates: React.FC<DashboardResgatesProps> = ({ 
  data,
  filters,
  onFilterChange
}) => {
  const [activeYearTab, setActiveYearTab] = useState<string>(filters.year?.toString() || "2025");
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const handleYearChange = (year: string) => {
    setActiveYearTab(year);
    onFilterChange({ ...filters, year: parseInt(year) });
  };

  return (
    <div className="space-y-6">
      {/* Abas de Anos */}
      <Tabs 
        value={activeYearTab} 
        onValueChange={handleYearChange}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-7 w-full bg-slate-50 p-1 rounded-xl shadow-sm overflow-x-auto">
          {years.map((year) => (
            <TabsTrigger 
              key={year}
              value={year.toString()}
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium text-sm px-3 py-2"
            >
              {year}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo para cada ano */}
        {years.map((year) => (
          <TabsContent key={year} value={year.toString()} className="mt-6">
            <DashboardResgatesAno 
              data={data}
              year={year}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface DashboardResgatesAnoProps {
  data: DashboardData;
  year: number;
  filters: any;
  onFilterChange: (filters: any) => void;
}

const DashboardResgatesAno: React.FC<DashboardResgatesAnoProps> = ({
  data,
  year,
  filters,
  onFilterChange
}) => {
  const [activeViewTab, setActiveViewTab] = useState("geral");

  // Para anos 2020-2025, mostrar gráficos específicos
  // Para 2026+, mostrar gráficos completos do formulário
  const isHistorico = year >= 2020 && year <= 2025;

  if (isHistorico) {
    return (
      <div className="space-y-6">
        <DashboardResgates2020_2025 data={data} year={year} />
      </div>
    );
  }

  // Para 2026+, mostrar gráficos completos
  return (
    <Tabs 
      value={activeViewTab} 
      onValueChange={setActiveViewTab}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-6 w-full max-w-5xl mx-auto bg-slate-50 p-1 rounded-xl shadow-sm">
        <TabsTrigger 
          value="geral" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Dados Gerais
        </TabsTrigger>
        <TabsTrigger 
          value="especies" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Espécies
        </TabsTrigger>
        <TabsTrigger 
          value="destinacao" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Destinação
        </TabsTrigger>
        <TabsTrigger 
          value="mapas" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Mapas
        </TabsTrigger>
        <TabsTrigger 
          value="sazonalidade" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Sazonalidade
        </TabsTrigger>
        <TabsTrigger 
          value="comparativos" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm"
        >
          Comparativos
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="geral" className="mt-6">
        <DashboardGraficosGerais data={data} year={year} />
      </TabsContent>
      
      <TabsContent value="especies" className="mt-6">
        <DashboardGraficosEspecies data={data} />
      </TabsContent>
      
      <TabsContent value="destinacao" className="mt-6">
        <DashboardGraficosDestinacao data={data} year={year} />
      </TabsContent>
      
      <TabsContent value="mapas" className="mt-6">
        <DashboardMapas 
          dataOrigem={data?.mapDataOrigem || []} 
          dataSoltura={data?.mapDataSoltura || []}
          data={data}
        />
      </TabsContent>
      
      <TabsContent value="sazonalidade" className="mt-6">
        <DashboardSazonalidade data={data} year={year} />
      </TabsContent>
      
      <TabsContent value="comparativos" className="mt-6">
        <DashboardComparativos data={data} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardResgates;

