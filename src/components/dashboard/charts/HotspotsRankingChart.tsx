import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HotspotsRankingChartProps {
  data: DashboardData;
}

const HotspotsRankingChart = ({ data }: HotspotsRankingChartProps) => {
  const registros = data.rawData || [];
  
  const hotspots = useMemo(() => {
    // Agrupar por região administrativa ou coordenadas aproximadas
    const hotspotsMap = new Map<string, { nome: string, quantidade: number, latitude?: number, longitude?: number }>();
    
    registros.forEach((r: any) => {
      const regiaoNome = r.regiao_administrativa?.nome || 'Não especificada';
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      
      if (!hotspotsMap.has(regiaoNome)) {
        hotspotsMap.set(regiaoNome, {
          nome: regiaoNome,
          quantidade: 0,
          latitude: r.latitude ? parseFloat(r.latitude) : undefined,
          longitude: r.longitude ? parseFloat(r.longitude) : undefined
        });
      }
      
      const hotspot = hotspotsMap.get(regiaoNome)!;
      hotspot.quantidade += quantidade;
    });
    
    return Array.from(hotspotsMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);
  }, [registros]);
  
  const COLORS = [
    '#10b981', '#059669', '#047857', '#065f46', '#34d399', 
    '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#f0fdf4'
  ];
  
  return (
    <Card className="glass-card border-green-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Top 10 Hotspots de Resgates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        {hotspots.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={hotspots} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="nome"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
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
                          <p className="font-semibold text-sm mb-2 text-green-700">{data.nome}</p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Quantidade:</span>{' '}
                            <span className="font-bold text-green-700">{data.quantidade?.toLocaleString('pt-BR') || 0}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantidade" name="Quantidade" radius={[12, 12, 0, 0]}>
                  {hotspots.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Lista de hotspots */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Lista Detalhada</h4>
              {hotspots.map((hotspot, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{hotspot.nome}</p>
                      {hotspot.latitude && hotspot.longitude && (
                        <p className="text-xs text-muted-foreground">
                          {hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{hotspot.quantidade.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground">resgates</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotspotsRankingChart;

