import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, ComposedChart, Area, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Activity, Bug } from 'lucide-react';

const MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Paleta distinta por ano (evita aspecto monocromático; ano mais recente em destaque)
const CORES_ANOS = [
  '#2563eb', // azul - ano atual
  '#059669', // esmeralda
  '#d97706', // âmbar
  '#7c3aed', // violeta
  '#0891b2', // ciano
  '#64748b'  // slate (fallback)
];

export interface SazonalidadeData {
  mensal: { mes: number; resgates: number; feridos: number; solturas: number }[];
  especiesMensais: { mes: number; especie: string; quantidade: number }[];
  ano: number;
}

export interface SazonalidadeHistorico {
  anos: SazonalidadeData[];
  anoAtual: number;
}

interface Props {
  dados: SazonalidadeHistorico;
}

const DashboardOperacionalSazonalidade: React.FC<Props> = ({ dados }) => {
  // 1. Gráfico de Correlação Resgates x Período do Ano (todos os anos)
  const correlacaoResgates = useMemo(() => {
    const mesesData = MESES_NOME.map((nome, idx) => {
      const item: Record<string, any> = { mes: idx + 1, mesNome: nome };
      let totalGeral = 0;
      
      dados.anos.forEach(anoData => {
        const mesInfo = anoData.mensal.find(m => m.mes === idx + 1);
        item[`resgates_${anoData.ano}`] = mesInfo?.resgates || 0;
        totalGeral += mesInfo?.resgates || 0;
      });
      
      item.mediaHistorica = dados.anos.length > 0 
        ? Math.round(totalGeral / dados.anos.length) 
        : 0;
      
      return item;
    });
    
    // Identificar pico e vale
    const mediasPorMes = mesesData.map(m => ({ mes: m.mesNome, media: m.mediaHistorica }));
    const pico = mediasPorMes.reduce((a, b) => a.media > b.media ? a : b);
    const vale = mediasPorMes.reduce((a, b) => a.media < b.media ? a : b);
    
    return { data: mesesData, pico, vale };
  }, [dados]);

  // 2. Gráfico de Taxa de Feridos (Feridos / Resgates)
  const taxaFeridosMensal = useMemo(() => {
    return MESES_NOME.map((nome, idx) => {
      const item: Record<string, any> = { mes: idx + 1, mesNome: nome };
      let totalFeridos = 0;
      let totalResgates = 0;
      
      dados.anos.forEach(anoData => {
        const mesInfo = anoData.mensal.find(m => m.mes === idx + 1);
        const feridos = mesInfo?.feridos || 0;
        const resgates = mesInfo?.resgates || 0;
        
        item[`taxa_${anoData.ano}`] = resgates > 0 
          ? parseFloat(((feridos / resgates) * 100).toFixed(1)) 
          : 0;
        item[`feridos_${anoData.ano}`] = feridos;
        
        totalFeridos += feridos;
        totalResgates += resgates;
      });
      
      item.taxaMedia = totalResgates > 0 
        ? parseFloat(((totalFeridos / totalResgates) * 100).toFixed(1)) 
        : 0;
      
      return item;
    });
  }, [dados]);

  // 3. Espécies mais resgatadas por período/mês
  const especiesPorPeriodo = useMemo(() => {
    // Agrupar todas as espécies por mês considerando todos os anos
    const especieMesMap: Record<string, Record<string, number>> = {};
    
    dados.anos.forEach(anoData => {
      anoData.especiesMensais.forEach(em => {
        const especie = em.especie;
        if (!especieMesMap[especie]) {
          especieMesMap[especie] = {};
        }
        especieMesMap[especie][em.mes] = (especieMesMap[especie][em.mes] || 0) + em.quantidade;
      });
    });
    
    // Calcular totais por espécie
    const especieTotals = Object.entries(especieMesMap).map(([especie, meses]) => ({
      especie,
      total: Object.values(meses).reduce((a, b) => a + b, 0),
      meses
    })).sort((a, b) => b.total - a.total);
    
    // Top 5 espécies
    const topEspecies = especieTotals.slice(0, 5);
    
    // Criar dados mensais para as top espécies
    const dadosMensais = MESES_NOME.map((nome, idx) => {
      const item: Record<string, any> = { mes: idx + 1, mesNome: nome };
      
      topEspecies.forEach(esp => {
        item[esp.especie] = esp.meses[idx + 1] || 0;
      });
      
      return item;
    });
    
    return { data: dadosMensais, especies: topEspecies.map(e => e.especie) };
  }, [dados]);

  // Identificar padrões sazonais por espécie
  const padroesSazonais = useMemo(() => {
    const padroes: { especie: string; mesPico: string; mesVale: string; variacao: number }[] = [];
    
    especiesPorPeriodo.especies.forEach(especie => {
      const mesesComDados = especiesPorPeriodo.data.map(m => ({
        mes: m.mesNome,
        qtd: m[especie] as number || 0
      }));
      
      const pico = mesesComDados.reduce((a, b) => a.qtd > b.qtd ? a : b);
      const vale = mesesComDados.reduce((a, b) => a.qtd < b.qtd ? a : b);
      const variacao = pico.qtd > 0 ? ((pico.qtd - vale.qtd) / pico.qtd) * 100 : 0;
      
      padroes.push({
        especie,
        mesPico: pico.mes,
        mesVale: vale.mes,
        variacao: Math.round(variacao)
      });
    });
    
    return padroes;
  }, [especiesPorPeriodo]);

  const anosDisponiveis = dados.anos.map(a => a.ano).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Análise de Sazonalidade</h2>
        <div className="flex gap-1 ml-auto">
          {anosDisponiveis.map((ano, i) => (
            <Badge key={ano} variant={i === 0 ? "default" : "secondary"} className="text-xs">
              {ano}
            </Badge>
          ))}
        </div>
      </div>

      {/* Cards de Pico e Vale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mês de Pico (Média Histórica)</p>
                <p className="text-2xl font-bold">{correlacaoResgates.pico.mes}</p>
                <p className="text-sm text-green-600">{correlacaoResgates.pico.media} resgates/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mês de Vale (Média Histórica)</p>
                <p className="text-2xl font-bold">{correlacaoResgates.vale.mes}</p>
                <p className="text-sm text-amber-600">{correlacaoResgates.vale.media} resgates/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 1: Resgates x Período do Ano */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resgates por Período do Ano</CardTitle>
          <CardDescription>Comparativo mensal entre anos - identificação de sazonalidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={correlacaoResgates.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mesNome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              
              {/* Linha de média histórica */}
              <Line 
                type="monotone" 
                dataKey="mediaHistorica" 
                name="Média Histórica"
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
              
              {/* Barras por ano - cores distintas por ano */}
              {anosDisponiveis.slice(0, 5).map((ano, i) => (
                <Bar
                  key={ano}
                  dataKey={`resgates_${ano}`}
                  name={`${ano}`}
                  fill={CORES_ANOS[i]}
                  opacity={i === 0 ? 1 : 0.88}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 2: Taxa de Feridos por Período */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base">Taxa de Feridos por Período</CardTitle>
          </div>
          <CardDescription>Percentual de animais feridos em relação ao total de resgates por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={taxaFeridosMensal}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mesNome" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `${value}%`}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              
              {/* Linha de média */}
              <Line 
                type="monotone" 
                dataKey="taxaMedia" 
                name="Média Histórica"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              
              {anosDisponiveis.slice(0, 5).map((ano, i) => (
                <Line
                  key={ano}
                  type="monotone"
                  dataKey={`taxa_${ano}`}
                  name={`${ano}`}
                  stroke={CORES_ANOS[i]}
                  strokeWidth={i === 0 ? 3 : 2}
                  dot={{ r: i === 0 ? 4 : 3 }}
                  opacity={i === 0 ? 1 : 0.9}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico 3: Espécies mais resgatadas por período */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Top 5 Espécies por Período do Ano</CardTitle>
          </div>
          <CardDescription>Padrão sazonal das espécies mais resgatadas (agregado de todos os anos)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={especiesPorPeriodo.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mesNome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              
              {especiesPorPeriodo.especies.map((especie, i) => (
                <Area
                  key={especie}
                  type="monotone"
                  dataKey={especie}
                  name={especie}
                  fill={CORES_ANOS[i]}
                  stroke={CORES_ANOS[i]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  stackId="1"
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cards de Padrões Sazonais por Espécie */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {padroesSazonais.map((padrao, i) => (
          <Card key={padrao.especie} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm truncate flex-1" title={padrao.especie}>
                  {padrao.especie}
                </h4>
                <Badge variant="outline" className="ml-2 shrink-0">
                  #{i + 1}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Pico:</span>
                  <span className="font-medium">{padrao.mesPico}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Vale:</span>
                  <span className="font-medium">{padrao.mesVale}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Variação sazonal: <span className="font-semibold text-foreground">{padrao.variacao}%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOperacionalSazonalidade;
