import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartCard from './ChartCard';

interface DashboardSazonalidadeProps {
  data: DashboardData;
  year: number;
}

const DashboardSazonalidade: React.FC<DashboardSazonalidadeProps> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  // Calcular média histórica por mês (2020-2025)
  const mediaHistorica = useMemo(() => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dadosPorMes = new Map<number, number[]>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const mes = dataObj.getMonth(); // 0-11
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      
      if (!dadosPorMes.has(mes)) {
        dadosPorMes.set(mes, []);
      }
      dadosPorMes.get(mes)!.push(quantidade);
    });
    
    return meses.map((nome, index) => {
      const valores = dadosPorMes.get(index) || [];
      const media = valores.length > 0 
        ? valores.reduce((a, b) => a + b, 0) / valores.length 
        : 0;
      
      return {
        mes: nome,
        media: Math.round(media * 10) / 10,
        total: valores.reduce((a, b) => a + b, 0)
      };
    });
  }, [registros]);
  
  // Identificar meses de pico e vale
  const pico = mediaHistorica.reduce((max, item) => item.media > max.media ? item : max, mediaHistorica[0]);
  const vale = mediaHistorica.reduce((min, item) => item.media < min.media ? item : min, mediaHistorica[0]);
  
  const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#34d399', '#6ee7b7'];
  
  return (
    <div className="space-y-6">
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Média Histórica de Resgates por Mês (2020-2025)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mediaHistorica} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} vertical={false} />
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
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                        <p className="font-semibold text-sm mb-2 text-green-700">{data.mes}</p>
                        <p className="text-sm text-green-600">
                          <span className="font-medium">Média:</span>{' '}
                          <span className="font-bold text-green-700">{data.media?.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                        </p>
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
              <Bar dataKey="media" name="Média" radius={[12, 12, 0, 0]}>
                {mediaHistorica.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.mes === pico.mes ? '#ef4444' : entry.mes === vale.mes ? '#3b82f6' : COLORS[index % COLORS.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Cards de pico e vale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-red-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-50/80 to-white/80 backdrop-blur-sm border-b border-red-100">
            <CardTitle className="text-lg font-semibold text-red-700">
              Mês de Pico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{pico.mes}</div>
              <div className="text-2xl font-semibold text-red-700">{pico.media.toFixed(1)} resgates/mês</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-primary/30 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-white/80 backdrop-blur-sm border-b border-primary/30">
            <CardTitle className="text-lg font-semibold text-primary">
              Mês de Vale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{vale.mes}</div>
              <div className="text-2xl font-semibold text-primary">{vale.media.toFixed(1)} resgates/mês</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSazonalidade;

