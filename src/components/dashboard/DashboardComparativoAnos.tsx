import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area, Bar, Line } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown, BarChart3 } from 'lucide-react';

interface DadosAno {
  ano: number;
  mes: number;
  total: number;
  solturas?: number;
  obitos?: number;
}

interface DashboardComparativoAnosProps {
  dadosHistoricos: DadosAno[];
  anosDisponiveis?: number[];
  isPublico?: boolean;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DashboardComparativoAnos: React.FC<DashboardComparativoAnosProps> = ({
  dadosHistoricos,
  anosDisponiveis = [2026, 2025, 2024, 2023, 2022, 2021, 2020],
  isPublico = false,
}) => {
  const [anoA, setAnoA] = useState<number>(2025);
  const [anoB, setAnoB] = useState<number>(2024);

  // Dados comparativos mensais
  const dadosComparativos = useMemo(() => {
    const dadosPorAnoMes = new Map<string, number>();
    
    dadosHistoricos.forEach(d => {
      const key = `${d.ano}-${d.mes}`;
      dadosPorAnoMes.set(key, (dadosPorAnoMes.get(key) || 0) + d.total);
    });

    return MESES.map((mesNome, index) => {
      const mes = index + 1;
      const keyA = `${anoA}-${mes}`;
      const keyB = `${anoB}-${mes}`;
      
      const valorA = dadosPorAnoMes.get(keyA) || 0;
      const valorB = dadosPorAnoMes.get(keyB) || 0;
      
      return {
        mes: mesNome,
        [anoA]: valorA,
        [anoB]: valorB,
        diferenca: valorA - valorB,
        percentualDiferenca: valorB > 0 ? ((valorA - valorB) / valorB) * 100 : 0
      };
    });
  }, [dadosHistoricos, anoA, anoB]);

  // Métricas calculadas
  const metricas = useMemo(() => {
    const totalA = dadosComparativos.reduce((acc, d) => acc + (d[anoA] as number), 0);
    const totalB = dadosComparativos.reduce((acc, d) => acc + (d[anoB] as number), 0);
    const variacao = totalB > 0 ? ((totalA - totalB) / totalB) * 100 : 0;
    
    // Encontrar mês com maior diferença
    const maiorDiferenca = dadosComparativos.reduce((max, curr) => 
      Math.abs(curr.diferenca) > Math.abs(max.diferenca) ? curr : max,
      dadosComparativos[0]
    );
    
    // Média mensal
    const mediaA = totalA / 12;
    const mediaB = totalB / 12;

    return { totalA, totalB, variacao, maiorDiferenca, mediaA, mediaB };
  }, [dadosComparativos, anoA, anoB]);

  // Evolução anual (todos os anos)
  const evolucaoAnual = useMemo(() => {
    const totaisPorAno = new Map<number, number>();
    
    dadosHistoricos.forEach(d => {
      totaisPorAno.set(d.ano, (totaisPorAno.get(d.ano) || 0) + d.total);
    });

    return anosDisponiveis
      .filter(ano => totaisPorAno.has(ano))
      .map(ano => ({
        ano,
        total: totaisPorAno.get(ano) || 0
      }))
      .sort((a, b) => a.ano - b.ano);
  }, [dadosHistoricos, anosDisponiveis]);

  const primaryColor = isPublico ? '#071d49' : 'hsl(var(--primary))';
  const secondaryColor = isPublico ? '#ffcc00' : 'hsl(var(--secondary))';
  const accentColor = '#22c55e';

  return (
    <div className="space-y-6">
      {/* Seletores de Anos */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <ArrowUpDown className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-green-600'}`} />
            Comparativo Entre Anos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Ano A</label>
              <Select value={anoA.toString()} onValueChange={(v) => setAnoA(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Ano B</label>
              <Select value={anoB.toString()} onValueChange={(v) => setAnoB(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total {anoA}</p>
            <p className={`text-2xl font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
              {metricas.totalA.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total {anoB}</p>
            <p className={`text-2xl font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
              {metricas.totalB.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Variação</p>
            <div className="flex items-center gap-2">
              {metricas.variacao >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${metricas.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metricas.variacao >= 0 ? '+' : ''}{metricas.variacao.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Maior Diferença</p>
            <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
              {metricas.maiorDiferenca?.mes}
            </p>
            <p className={`text-sm ${metricas.maiorDiferenca?.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metricas.maiorDiferenca?.diferenca >= 0 ? '+' : ''}
              {metricas.maiorDiferenca?.diferenca.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Comparativo Mensal */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <BarChart3 className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-green-600'}`} />
            Comparativo Mensal: {anoA} vs {anoB}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dadosComparativos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="mes"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString('pt-BR'),
                  name === 'diferenca' ? 'Diferença' : `Ano ${name}`
                ]}
              />
              <Legend />
              <Bar dataKey={anoA} name={`${anoA}`} fill={primaryColor} radius={[4, 4, 0, 0]} />
              <Bar dataKey={anoB} name={`${anoB}`} fill={secondaryColor} radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="diferenca" 
                name="Diferença"
                stroke={accentColor}
                strokeWidth={2}
                dot={{ r: 4, fill: accentColor }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução Histórica */}
      {evolucaoAnual.length > 2 && (
        <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
          <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
              <TrendingUp className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-green-600'}`} />
              Evolução Histórica de Resgates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={evolucaoAnual} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="ano"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Total']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  fill={isPublico ? 'rgba(7, 29, 73, 0.1)' : 'rgba(16, 185, 129, 0.1)'} 
                  stroke="none" 
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={primaryColor}
                  strokeWidth={3}
                  dot={{ r: 6, fill: primaryColor, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: secondaryColor }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardComparativoAnos;
