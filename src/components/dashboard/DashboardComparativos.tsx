import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from './ChartCard';

interface DashboardComparativosProps {
  data: DashboardData;
}

const DashboardComparativos: React.FC<DashboardComparativosProps> = ({ data }) => {
  const [anoA, setAnoA] = useState<number>(2024);
  const [anoB, setAnoB] = useState<number>(2025);
  
  const registros = data.rawData || [];
  
  // Calcular dados comparativos
  const dadosComparativos = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const dadosPorAnoMes = new Map<string, Map<number, number>>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const ano = dataObj.getFullYear();
      const mes = dataObj.getMonth(); // 0-11
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      
      const key = `${ano}-${mes}`;
      if (!dadosPorAnoMes.has(key)) {
        dadosPorAnoMes.set(key, new Map());
      }
      const mesMap = dadosPorAnoMes.get(key)!;
      mesMap.set(mes, (mesMap.get(mes) || 0) + quantidade);
    });
    
    return meses.map((nome, index) => {
      const keyA = `${anoA}-${index}`;
      const keyB = `${anoB}-${index}`;
      
      const totalA = dadosPorAnoMes.get(keyA)?.get(index) || 0;
      const totalB = dadosPorAnoMes.get(keyB)?.get(index) || 0;
      
      return {
        mes: nome,
        [`Ano ${anoA}`]: totalA,
        [`Ano ${anoB}`]: totalB,
        diferenca: totalB - totalA
      };
    });
  }, [registros, anoA, anoB]);
  
  // Calcular métricas comparativas
  const metricas = useMemo(() => {
    const totalA = dadosComparativos.reduce((acc, item) => acc + (Number(item[`Ano ${anoA}`]) || 0), 0);
    const totalB = dadosComparativos.reduce((acc, item) => acc + (Number(item[`Ano ${anoB}`]) || 0), 0);
    
    // Taxa de soltura (simplificado - assumindo que temos dados de soltura)
    const solturasA = 0; // Calcular baseado nos dados
    const solturasB = 0; // Calcular baseado nos dados
    const taxaSolturaA = totalA > 0 ? (solturasA / totalA) * 100 : 0;
    const taxaSolturaB = totalB > 0 ? (solturasB / totalB) * 100 : 0;
    
    // Top 5 espécies
    const especiesA = new Map<string, number>();
    const especiesB = new Map<string, number>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const ano = dataObj.getFullYear();
      const especieNome = r.especie?.nome_popular || r.nome_popular || 'Não identificada';
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      
      if (ano === anoA) {
        especiesA.set(especieNome, (especiesA.get(especieNome) || 0) + quantidade);
      } else if (ano === anoB) {
        especiesB.set(especieNome, (especiesB.get(especieNome) || 0) + quantidade);
      }
    });
    
    const top5A = Array.from(especiesA.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, qtd]) => ({ nome, quantidade: qtd }));
    
    const top5B = Array.from(especiesB.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nome, qtd]) => ({ nome, quantidade: qtd }));
    
    // Maior diferença mensal
    const maiorDiferenca = dadosComparativos.reduce((max, item) => 
      Math.abs(item.diferenca) > Math.abs(max.diferenca) ? item : max, 
      dadosComparativos[0]
    );
    
    return {
      totalA,
      totalB,
      taxaSolturaA,
      taxaSolturaB,
      top5A,
      top5B,
      maiorDiferenca
    };
  }, [dadosComparativos, registros, anoA, anoB]);
  
  const anos = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const COLORS = ['#10b981', '#059669'];
  
  return (
    <div className="space-y-6">
      {/* Seletores de anos */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Selecionar Anos para Comparação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Ano A</label>
              <Select value={anoA.toString()} onValueChange={(v) => setAnoA(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Ano B</label>
              <Select value={anoB.toString()} onValueChange={(v) => setAnoB(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gráfico comparativo */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Comparativo Mensal: {anoA} vs {anoB}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosComparativos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    return (
                      <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm text-green-600">
                            <span className="font-medium">{entry.name}:</span>{' '}
                            <span className="font-bold text-green-700">{entry.value?.toLocaleString('pt-BR') || 0}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey={`Ano ${anoA}`} name={`Ano ${anoA}`} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey={`Ano ${anoB}`} name={`Ano ${anoB}`} fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Cards comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-sm font-semibold text-green-700">Total {anoA}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600">{metricas.totalA.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-sm font-semibold text-green-700">Total {anoB}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600">{metricas.totalB.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-sm font-semibold text-green-700">Taxa Soltura {anoA}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600">{metricas.taxaSolturaA.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-sm font-semibold text-green-700">Taxa Soltura {anoB}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white/50 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600">{metricas.taxaSolturaB.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Maior diferença mensal */}
      {metricas.maiorDiferenca && (
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-lg font-semibold text-green-700">
              Maior Diferença Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{metricas.maiorDiferenca.mes}</div>
              <div className={`text-xl font-semibold ${metricas.maiorDiferenca.diferenca >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {metricas.maiorDiferenca.diferenca >= 0 ? '+' : ''}{metricas.maiorDiferenca.diferenca.toLocaleString('pt-BR')} resgates
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardComparativos;

