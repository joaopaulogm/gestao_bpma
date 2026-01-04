import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TaxaSolturaMensalChartProps {
  data: DashboardData;
  year: number;
}

const TaxaSolturaMensalChart: React.FC<TaxaSolturaMensalChartProps> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  const taxaMensal = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const dadosPorMes = new Map<number, { total: number, solturas: number }>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const anoRegistro = dataObj.getFullYear();
      const mes = dataObj.getMonth(); // 0-11
      
      if (anoRegistro !== year) return;
      
      if (!dadosPorMes.has(mes)) {
        dadosPorMes.set(mes, { total: 0, solturas: 0 });
      }
      
      const mesData = dadosPorMes.get(mes)!;
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      const quantidadeSolturas = Number(r.quantidade_solturas) || 0;
      
      mesData.total += quantidade;
      
      // Verificar se é soltura
      const destinacaoNome = r.destinacao?.nome?.toLowerCase() || '';
      const desfechoNome = r.desfecho?.nome?.toLowerCase() || '';
      
      if (destinacaoNome.includes('soltura') || desfechoNome.includes('soltura') || quantidadeSolturas > 0) {
        mesData.solturas += quantidadeSolturas > 0 ? quantidadeSolturas : quantidade;
      }
    });
    
    return meses.map((nome, index) => {
      const mesData = dadosPorMes.get(index) || { total: 0, solturas: 0 };
      const taxa = mesData.total > 0 ? (mesData.solturas / mesData.total) * 100 : 0;
      return {
        mes: nome,
        taxa: Math.round(taxa * 10) / 10
      };
    });
  }, [registros, year]);
  
  return (
    <Card className="glass-card border-green-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Taxa de Soltura por Mês - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={taxaMensal} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                      <p className="font-semibold text-sm mb-2 text-green-700">{data.mes}</p>
                      <p className="text-sm text-green-600">
                        <span className="font-medium">Taxa de Soltura:</span>{' '}
                        <span className="font-bold text-green-700">{data.taxa?.toFixed(1) || 0}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="taxa" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TaxaSolturaMensalChart;

