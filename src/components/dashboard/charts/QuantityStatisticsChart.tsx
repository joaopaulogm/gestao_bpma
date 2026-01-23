
import React from 'react';
import ChartCard from '../ChartCard';

interface QuantityStats {
  min: number;
  max: number;
  avg: number;
  median: number;
}

interface QuantityStatisticsChartProps {
  data: QuantityStats;
}

const QuantityStatisticsChart: React.FC<QuantityStatisticsChartProps> = ({ data }) => {
  return (
    <ChartCard title="Estatísticas de Quantidade por Ocorrência" subtitle="Análise quantitativa das ocorrências">
      <div className="flex flex-col justify-center h-full p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-center bg-primary/10 p-6 rounded-lg">
            <span className="text-sm text-primary font-medium mb-2">Mínimo</span>
            <span className="text-3xl font-bold text-primary">
              {data.min}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-green-50 p-6 rounded-lg">
            <span className="text-sm text-green-600 font-medium mb-2">Máximo</span>
            <span className="text-3xl font-bold text-green-700">
              {data.max}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-purple-50 p-6 rounded-lg">
            <span className="text-sm text-purple-600 font-medium mb-2">Média</span>
            <span className="text-3xl font-bold text-purple-700">
              {data.avg.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center bg-amber-50 p-6 rounded-lg">
            <span className="text-sm text-amber-600 font-medium mb-2">Mediana</span>
            <span className="text-3xl font-bold text-amber-700">
              {data.median}
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default QuantityStatisticsChart;
