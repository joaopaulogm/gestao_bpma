import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface DestinacaoMensalStackedChartProps {
  data: DashboardData;
  year: number;
}

const DestinacaoMensalStackedChart: React.FC<DestinacaoMensalStackedChartProps> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  const dadosMensais = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const dadosPorMes = new Map<number, { soltura: number, cetas: number, obito: number }>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const anoRegistro = dataObj.getFullYear();
      const mes = dataObj.getMonth(); // 0-11
      
      if (anoRegistro !== year) return;
      
      if (!dadosPorMes.has(mes)) {
        dadosPorMes.set(mes, { soltura: 0, cetas: 0, obito: 0 });
      }
      
      const mesData = dadosPorMes.get(mes)!;
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      
      // Verificar destinacao ou desfecho
      const destinacaoNome = r.destinacao?.nome?.toLowerCase() || '';
      const desfechoNome = r.desfecho?.nome?.toLowerCase() || '';
      const quantidadeSolturas = Number(r.quantidade_solturas) || 0;
      const quantidadeObitos = Number(r.quantidade_obitos) || 0;
      
      if (destinacaoNome.includes('soltura') || desfechoNome.includes('soltura') || quantidadeSolturas > 0) {
        mesData.soltura += quantidadeSolturas > 0 ? quantidadeSolturas : quantidade;
      } else if (destinacaoNome.includes('cetas') || destinacaoNome.includes('cetás')) {
        mesData.cetas += quantidade;
      } else if (desfechoNome.includes('óbito') || desfechoNome.includes('obito') || quantidadeObitos > 0) {
        mesData.obito += quantidadeObitos > 0 ? quantidadeObitos : quantidade;
      }
    });
    
    return meses.map((nome, index) => {
      const mesData = dadosPorMes.get(index) || { soltura: 0, cetas: 0, obito: 0 };
      return {
        mes: nome,
        Soltura: mesData.soltura,
        CETAS: mesData.cetas,
        Óbito: mesData.obito
      };
    });
  }, [registros, year]);
  
  const COLORS = {
    Soltura: '#10b981',
    CETAS: '#3b82f6',
    Óbito: '#ef4444'
  };
  
  return (
    <Card className="glass-card border-green-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Destinação por Mês - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dadosMensais} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} />
            <XAxis 
              dataKey="mes"
              angle={-45}
              textAnchor="end"
              height={80}
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
                  return (
                    <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                      <p className="font-semibold text-sm mb-2 text-green-700">{payload[0].payload.mes}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="text-sm text-green-600">
                          <span className="font-medium" style={{ color: entry.color }}>
                            {entry.name}:
                          </span>{' '}
                          <span className="font-bold text-green-700">
                            {entry.value?.toLocaleString('pt-BR') || 0}
                          </span>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="Soltura" stackId="a" fill={COLORS.Soltura} radius={[0, 0, 0, 0]} />
            <Bar dataKey="CETAS" stackId="a" fill={COLORS.CETAS} />
            <Bar dataKey="Óbito" stackId="a" fill={COLORS.Óbito} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DestinacaoMensalStackedChart;

