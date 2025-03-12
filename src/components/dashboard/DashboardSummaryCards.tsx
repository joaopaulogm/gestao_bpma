
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/hooks/useDashboardData';

interface DashboardSummaryCardsProps {
  data: DashboardData;
}

const DashboardSummaryCards = ({ data }: DashboardSummaryCardsProps) => {
  const totalAtropelamentos = data.atropelamentos.reduce(
    (acc, curr) => acc + curr.quantidade,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-fauna-blue">
            Total de Resgates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-fauna-blue">
            {data.totalResgates}
          </div>
          <p className="text-sm text-gray-500 mt-1">Resgates registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-fauna-blue">
            Total de Apreensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-fauna-blue">
            {data.totalApreensoes}
          </div>
          <p className="text-sm text-gray-500 mt-1">Apreensões registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-fauna-blue">
            Atropelamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-fauna-blue">
            {totalAtropelamentos}
          </div>
          <p className="text-sm text-gray-500 mt-1">Animais atropelados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummaryCards;
