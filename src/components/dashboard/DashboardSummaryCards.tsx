
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/hooks/useDashboardData';
import { Activity, Clover, Grid3X3 } from 'lucide-react';

interface DashboardSummaryCardsProps {
  data: DashboardData;
}

const DashboardSummaryCards = ({ data }: DashboardSummaryCardsProps) => {
  const totalAtropelamentos = data.atropelamentos.reduce(
    (acc, curr) => acc + curr.quantidade,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-white pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-medium text-slate-800 flex items-center">
            <Clover className="w-4 h-4 mr-2 text-blue-500" />
            Total de Resgates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold text-blue-600">
            {data.totalResgates}
          </div>
          <p className="text-sm text-slate-500 mt-1">Resgates registrados</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-white pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-medium text-slate-800 flex items-center">
            <Grid3X3 className="w-4 h-4 mr-2 text-purple-500" />
            Total de Apreensões
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold text-purple-600">
            {data.totalApreensoes}
          </div>
          <p className="text-sm text-slate-500 mt-1">Apreensões registradas</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-white pb-2 border-b border-slate-100">
          <CardTitle className="text-base font-medium text-slate-800 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-pink-500" />
            Atropelamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-bold text-pink-600">
            {totalAtropelamentos}
          </div>
          <p className="text-sm text-slate-500 mt-1">Animais atropelados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummaryCards;
