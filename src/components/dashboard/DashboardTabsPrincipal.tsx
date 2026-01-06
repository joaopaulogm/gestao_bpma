import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Bird, Scale } from 'lucide-react';
import DashboardResgates from './DashboardResgates';
import DashboardCrimes from './DashboardCrimes';
import { DashboardData } from '@/types/hotspots';

interface DashboardTabsPrincipalProps {
  data: DashboardData;
  filters: any;
  onFilterChange: (filters: any) => void;
}

const DashboardTabsPrincipal: React.FC<DashboardTabsPrincipalProps> = ({ 
  data,
  filters,
  onFilterChange
}) => {
  const [activeMainTab, setActiveMainTab] = useState("resgates");
  const [tiposCrime, setTiposCrime] = useState<any[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    // Buscar tipos de crime
    const fetchTiposCrime = async () => {
      try {
        const { data: tipos, error } = await supabase
          .from('dim_tipo_de_crime')
          .select('id_tipo_de_crime, "Tipo de Crime"')
          .order('"Tipo de Crime"');
        
        if (error) {
          console.error('Erro ao buscar tipos de crime:', error);
        } else {
          setTiposCrime(tipos || []);
        }
      } catch (err) {
        console.error('Exceção ao buscar tipos de crime:', err);
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTiposCrime();
  }, []);

  return (
    <Tabs 
      value={activeMainTab} 
      onValueChange={setActiveMainTab}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-muted/30 p-1.5 rounded-xl shadow-sm">
        <TabsTrigger 
          value="resgates" 
          className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm font-medium"
        >
          <Bird className="h-4 w-4 mr-2" />
          Resgates
        </TabsTrigger>
        <TabsTrigger 
          value="crimes" 
          className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm font-medium"
        >
          <Scale className="h-4 w-4 mr-2" />
          Crimes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="resgates" className="mt-6">
        <DashboardResgates 
          data={data}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </TabsContent>
      
      <TabsContent value="crimes" className="mt-6">
        <DashboardCrimes 
          tiposCrime={tiposCrime}
          loadingTipos={loadingTipos}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabsPrincipal;

