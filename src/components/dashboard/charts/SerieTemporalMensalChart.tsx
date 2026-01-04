import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardData } from '@/types/hotspots';

interface SerieTemporalMensalChartProps {
  data: DashboardData;
  year: number;
}

const SerieTemporalMensalChart: React.FC<SerieTemporalMensalChartProps> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  const serieTemporal = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const dadosPorMes = new Map<number, number>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const anoRegistro = dataObj.getFullYear();
      const mes = dataObj.getMonth(); // 0-11
      
      if (anoRegistro !== year) return;
      
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      dadosPorMes.set(mes, (dadosPorMes.get(mes) || 0) + quantidade);
    });
    
    return meses.map((nome, index) => ({
      mes: nome,
      total: dadosPorMes.get(index) || 0
    }));
  }, [registros, year]);
  
  return (
    <Card className="glass-card border-green-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Série Temporal Mensal - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={serieTemporal} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} />
            <XAxis 
              dataKey="mes"
              tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                      <p className="font-semibold text-sm mb-2 text-green-700">{data.mes}</p>
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Total:</span>{' '}
                        <span className="font-bold text-green-700">{data.total?.toLocaleString('pt-BR') || 0}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SerieTemporalMensalChart;

