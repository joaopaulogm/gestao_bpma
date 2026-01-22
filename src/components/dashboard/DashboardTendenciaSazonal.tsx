import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Sun, Cloud, Leaf, Snowflake, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DashboardTendenciaSazonalProps {
  isPublico?: boolean;
}

interface DadoMensal {
  ano: number;
  mes: number;
  total: number;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DashboardTendenciaSazonal: React.FC<DashboardTendenciaSazonalProps> = ({
  isPublico = false
}) => {
  // Buscar dados históricos de todos os anos
  const { data: dadosHistoricos, isLoading } = useQuery({
    queryKey: ['tendencia-sazonal-historico'],
    queryFn: async (): Promise<DadoMensal[]> => {
      const { data, error } = await supabase
        .from('fact_resumo_mensal_historico')
        .select('ano, mes, resgates')
        .order('ano')
        .order('mes');

      if (error) return [];
      
      return (data || []).map(r => ({
        ano: r.ano,
        mes: r.mes,
        total: r.resgates || 0
      }));
    },
    staleTime: 10 * 60 * 1000
  });

  // Calcular padrões sazonais
  const padroesSazonais = useMemo(() => {
    if (!dadosHistoricos || dadosHistoricos.length === 0) return null;

    // Agrupar por mês (média histórica)
    const porMes: Record<number, { total: number; count: number; anos: number[] }> = {};
    
    dadosHistoricos.forEach(d => {
      if (!porMes[d.mes]) {
        porMes[d.mes] = { total: 0, count: 0, anos: [] };
      }
      porMes[d.mes].total += d.total;
      porMes[d.mes].count++;
      if (!porMes[d.mes].anos.includes(d.ano)) {
        porMes[d.mes].anos.push(d.ano);
      }
    });

    // Calcular média e desvio por mês
    const mediaMensal = MESES.map((nome, i) => {
      const mes = i + 1;
      const dados = porMes[mes] || { total: 0, count: 1 };
      const media = dados.total / dados.count;
      
      // Calcular desvio padrão
      const valores = dadosHistoricos
        .filter(d => d.mes === mes)
        .map(d => d.total);
      
      const variancia = valores.length > 0 
        ? valores.reduce((acc, v) => acc + Math.pow(v - media, 2), 0) / valores.length
        : 0;
      const desvio = Math.sqrt(variancia);

      return {
        mes: nome,
        mesNum: mes,
        media: Math.round(media),
        min: Math.min(...valores, 0),
        max: Math.max(...valores, 0),
        desvio: Math.round(desvio),
        numAnos: dados.count
      };
    });

    // Identificar pico e vale
    const mediaGeral = mediaMensal.reduce((acc, m) => acc + m.media, 0) / 12;
    const pico = mediaMensal.reduce((max, m) => m.media > max.media ? m : max, mediaMensal[0]);
    const vale = mediaMensal.reduce((min, m) => m.media < min.media ? m : min, mediaMensal[0]);

    // Identificar estações
    const verao = [12, 1, 2]; // Dez, Jan, Fev
    const outono = [3, 4, 5]; // Mar, Abr, Mai
    const inverno = [6, 7, 8]; // Jun, Jul, Ago
    const primavera = [9, 10, 11]; // Set, Out, Nov

    const totalPorEstacao = {
      verao: mediaMensal.filter(m => verao.includes(m.mesNum)).reduce((s, m) => s + m.media, 0),
      outono: mediaMensal.filter(m => outono.includes(m.mesNum)).reduce((s, m) => s + m.media, 0),
      inverno: mediaMensal.filter(m => inverno.includes(m.mesNum)).reduce((s, m) => s + m.media, 0),
      primavera: mediaMensal.filter(m => primavera.includes(m.mesNum)).reduce((s, m) => s + m.media, 0)
    };

    const estacaoMaisAtiva = Object.entries(totalPorEstacao)
      .sort((a, b) => b[1] - a[1])[0][0];

    return {
      mediaMensal,
      mediaGeral,
      pico,
      vale,
      totalPorEstacao,
      estacaoMaisAtiva
    };
  }, [dadosHistoricos]);

  // Dados por ano para gráfico de linhas
  const dadosPorAno = useMemo(() => {
    if (!dadosHistoricos) return [];

    const anos = [...new Set(dadosHistoricos.map(d => d.ano))].sort();
    
    return MESES.map((mes, i) => {
      const mesNum = i + 1;
      const registro: any = { mes };
      
      anos.forEach(ano => {
        const dado = dadosHistoricos.find(d => d.ano === ano && d.mes === mesNum);
        registro[ano] = dado?.total || 0;
      });
      
      // Adicionar média histórica
      if (padroesSazonais) {
        const mediaMes = padroesSazonais.mediaMensal.find(m => m.mesNum === mesNum);
        registro.mediaHistorica = mediaMes?.media || 0;
      }
      
      return registro;
    });
  }, [dadosHistoricos, padroesSazonais]);

  // Cores para cada ano
  const coresAnos = {
    2020: '#3b82f6',
    2021: '#10b981',
    2022: '#f59e0b',
    2023: '#ef4444',
    2024: '#8b5cf6',
    2025: '#071d49'
  };

  const getEstacaoIcon = (estacao: string) => {
    switch (estacao) {
      case 'verao': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'outono': return <Leaf className="h-5 w-5 text-orange-500" />;
      case 'inverno': return <Snowflake className="h-5 w-5 text-blue-400" />;
      case 'primavera': return <Cloud className="h-5 w-5 text-green-500" />;
      default: return null;
    }
  };

  const getEstacaoNome = (estacao: string) => {
    switch (estacao) {
      case 'verao': return 'Verão';
      case 'outono': return 'Outono';
      case 'inverno': return 'Inverno';
      case 'primavera': return 'Primavera';
      default: return estacao;
    }
  };

  const primaryColor = isPublico ? '#071d49' : 'hsl(var(--primary))';

  if (isLoading) {
    return (
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardContent className="py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!padroesSazonais) {
    return (
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Dados históricos não disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Insight */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Mês de Pico</p>
                <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                  {padroesSazonais.pico.mes}
                </p>
                <p className="text-sm text-muted-foreground">
                  ~{padroesSazonais.pico.media.toLocaleString('pt-BR')} resgates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Mês de Vale</p>
                <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                  {padroesSazonais.vale.mes}
                </p>
                <p className="text-sm text-muted-foreground">
                  ~{padroesSazonais.vale.media.toLocaleString('pt-BR')} resgates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {getEstacaoIcon(padroesSazonais.estacaoMaisAtiva)}
              <div>
                <p className="text-xs text-muted-foreground">Estação Mais Ativa</p>
                <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                  {getEstacaoNome(padroesSazonais.estacaoMaisAtiva)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Média Mensal</p>
                <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                  {Math.round(padroesSazonais.mediaGeral).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">resgates/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência por Ano */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <TrendingUp className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-green-600'}`} />
            Padrão Sazonal - Resgates por Mês (2020-2025)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={dadosPorAno} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="mediaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                  name === 'mediaHistorica' ? 'Média Histórica' : name
                ]}
              />
              <Legend />
              
              {/* Área da média histórica */}
              <Area 
                type="monotone" 
                dataKey="mediaHistorica" 
                name="Média Histórica"
                fill="url(#mediaGradient)" 
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="5 5"
              />
              
              {/* Linhas de cada ano */}
              {Object.entries(coresAnos).map(([ano, cor]) => (
                <Line 
                  key={ano}
                  type="monotone" 
                  dataKey={ano}
                  name={ano}
                  stroke={cor}
                  strokeWidth={2}
                  dot={{ r: 3, fill: cor }}
                  activeDot={{ r: 5 }}
                />
              ))}
              
              {/* Linha de referência da média geral */}
              <ReferenceLine 
                y={padroesSazonais.mediaGeral} 
                stroke="#6b7280" 
                strokeDasharray="3 3"
                label={{ value: 'Média', fill: '#6b7280', fontSize: 10 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Estação */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            Média por Estação do Ano
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(padroesSazonais.totalPorEstacao).map(([estacao, total]) => {
              const percentual = (total / Object.values(padroesSazonais.totalPorEstacao).reduce((a, b) => a + b, 0)) * 100;
              const isTop = estacao === padroesSazonais.estacaoMaisAtiva;
              
              return (
                <div 
                  key={estacao}
                  className={`p-4 rounded-lg border ${isTop ? 'border-primary bg-primary/5' : 'border-muted'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getEstacaoIcon(estacao)}
                    <span className="font-medium">{getEstacaoNome(estacao)}</span>
                    {isTop && <Badge variant="default" className="text-xs">Mais ativo</Badge>}
                  </div>
                  <p className={`text-2xl font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                    {Math.round(total / 3).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    média/mês ({percentual.toFixed(1)}% do ano)
                  </p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Médias Mensais */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            Estatísticas Mensais Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-2">
              {padroesSazonais.mediaMensal.map((mes) => {
                const isPico = mes.mes === padroesSazonais.pico.mes;
                const isVale = mes.mes === padroesSazonais.vale.mes;
                const intensidade = (mes.media / padroesSazonais.pico.media) * 100;
                
                return (
                  <div 
                    key={mes.mes}
                    className={`p-2 rounded-lg text-center border ${
                      isPico ? 'border-red-300 bg-red-50' : 
                      isVale ? 'border-blue-300 bg-blue-50' : 
                      'border-muted'
                    }`}
                  >
                    <p className="text-xs font-medium text-muted-foreground">{mes.mes}</p>
                    <p className={`text-sm font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                      {mes.media.toLocaleString('pt-BR')}
                    </p>
                    <div 
                      className="mt-1 h-1 bg-primary/30 rounded-full"
                      style={{ width: `${intensidade}%`, margin: '0 auto' }}
                    />
                    {isPico && <Badge variant="destructive" className="text-[10px] mt-1">Pico</Badge>}
                    {isVale && <Badge variant="secondary" className="text-[10px] mt-1 bg-blue-200">Vale</Badge>}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTendenciaSazonal;
