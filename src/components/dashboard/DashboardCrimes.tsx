import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import DashboardCrimesEnquadramento from './DashboardCrimesEnquadramento';

interface DashboardCrimesProps {
  tiposCrime: any[];
  loadingTipos: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
}

const DashboardCrimes: React.FC<DashboardCrimesProps> = ({ 
  tiposCrime,
  loadingTipos,
  filters,
  onFilterChange
}) => {
  const [activeTipoTab, setActiveTipoTab] = useState<string>("");

  useEffect(() => {
    if (tiposCrime.length > 0 && !activeTipoTab) {
      setActiveTipoTab(tiposCrime[0].id_tipo_de_crime);
    }
  }, [tiposCrime, activeTipoTab]);

  if (loadingTipos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (tiposCrime.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum tipo de crime encontrado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Abas de Tipos de Crime */}
      <Tabs 
        value={activeTipoTab} 
        onValueChange={(value) => {
          setActiveTipoTab(value);
          onFilterChange({ ...filters, tipoCrimeId: value });
        }}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full bg-muted/30 p-1 rounded-xl shadow-sm overflow-x-auto gap-1">
          {tiposCrime.map((tipo) => (
            <TabsTrigger 
              key={tipo.id_tipo_de_crime}
              value={tipo.id_tipo_de_crime}
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium text-xs lg:text-sm px-2 lg:px-4 py-2 whitespace-nowrap"
            >
              {tipo["Tipo de Crime"]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo para cada tipo de crime */}
        {tiposCrime.map((tipo) => (
          <TabsContent key={tipo.id_tipo_de_crime} value={tipo.id_tipo_de_crime} className="mt-6">
            <DashboardCrimesEnquadramento 
              tipoCrimeId={tipo.id_tipo_de_crime}
              tipoCrimeNome={tipo["Tipo de Crime"]}
              filters={filters}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DashboardCrimes;

