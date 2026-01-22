import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, TrendingUp, MapPin, Calendar, Bell } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Alerta {
  tipo: 'pico_regiao' | 'pico_mensal' | 'tendencia_alta';
  severidade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  valor: number;
  referencia: number;
  variacao: number;
  regiao?: string;
  periodo?: string;
}

interface DashboardAlertasPicosProps {
  year: number;
}

const DashboardAlertasPicos: React.FC<DashboardAlertasPicosProps> = ({ year }) => {
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['dashboard-alertas-picos', year],
    queryFn: async (): Promise<Alerta[]> => {
      const alertasList: Alerta[] = [];
      
      // Buscar regiões para lookup
      const { data: regioesData } = await supabase
        .from('dim_regiao_administrativa')
        .select('id, nome');
      
      const regioesLookup: Record<string, string> = {};
      (regioesData || []).forEach(r => { regioesLookup[r.id] = r.nome; });

      if (year >= 2026) {
        // Buscar dados do ano atual
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        
        const { data: resgates } = await supabase
          .from('fat_registros_de_resgate')
          .select('data, regiao_administrativa_id, quantidade_total, quantidade_adulto, quantidade_filhote')
          .gte('data', startDate)
          .lte('data', endDate);

        if (resgates && resgates.length > 0) {
          // Análise por região
          const porRegiao: Record<string, number[]> = {};
          const porMes: Record<number, number> = {};
          
          resgates.forEach(r => {
            const regiao = r.regiao_administrativa_id || 'unknown';
            const mes = new Date(r.data).getMonth() + 1;
            const qty = r.quantidade_total || (r.quantidade_adulto || 0) + (r.quantidade_filhote || 0) || 1;
            
            if (!porRegiao[regiao]) porRegiao[regiao] = [];
            porRegiao[regiao].push(qty);
            
            porMes[mes] = (porMes[mes] || 0) + qty;
          });

          // Calcular média e desvio padrão por região
          Object.entries(porRegiao).forEach(([regiao, valores]) => {
            if (valores.length < 3) return;
            
            const soma = valores.reduce((a, b) => a + b, 0);
            const media = soma / valores.length;
            const variancia = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valores.length;
            const desvioPadrao = Math.sqrt(variancia);
            
            // Se o último valor está 2 desvios padrão acima da média = pico
            const ultimoValor = valores[valores.length - 1];
            if (ultimoValor > media + 2 * desvioPadrao && desvioPadrao > 0) {
              const variacao = ((ultimoValor - media) / media) * 100;
              alertasList.push({
                tipo: 'pico_regiao',
                severidade: variacao > 100 ? 'alta' : variacao > 50 ? 'media' : 'baixa',
                titulo: `Pico de resgates em ${regioesLookup[regiao] || regiao}`,
                descricao: `Quantidade atual está ${variacao.toFixed(0)}% acima da média histórica da região.`,
                valor: ultimoValor,
                referencia: Math.round(media),
                variacao,
                regiao: regioesLookup[regiao] || regiao
              });
            }
          });

          // Análise de tendência mensal
          const meses = Object.keys(porMes).map(Number).sort((a, b) => a - b);
          if (meses.length >= 3) {
            const ultimos3 = meses.slice(-3);
            const valores = ultimos3.map(m => porMes[m]);
            
            // Verificar se há tendência de crescimento
            if (valores[2] > valores[1] && valores[1] > valores[0]) {
              const crescimento = ((valores[2] - valores[0]) / valores[0]) * 100;
              if (crescimento > 30) {
                alertasList.push({
                  tipo: 'tendencia_alta',
                  severidade: crescimento > 80 ? 'alta' : crescimento > 50 ? 'media' : 'baixa',
                  titulo: 'Tendência de crescimento detectada',
                  descricao: `Resgates aumentaram ${crescimento.toFixed(0)}% nos últimos 3 meses consecutivos.`,
                  valor: valores[2],
                  referencia: valores[0],
                  variacao: crescimento,
                  periodo: `${ultimos3[0]}º ao ${ultimos3[2]}º mês`
                });
              }
            }
          }

          // Comparar mês atual com mesmo mês do ano anterior (se houver dados históricos)
          const mesAtual = new Date().getMonth() + 1;
          const { data: historico } = await supabase
            .from('fact_resumo_mensal_historico')
            .select('mes, resgates')
            .eq('ano', year - 1)
            .eq('mes', mesAtual)
            .single();

          if (historico && porMes[mesAtual]) {
            const variacaoAnual = ((porMes[mesAtual] - historico.resgates) / historico.resgates) * 100;
            if (variacaoAnual > 40) {
              alertasList.push({
                tipo: 'pico_mensal',
                severidade: variacaoAnual > 80 ? 'alta' : variacaoAnual > 50 ? 'media' : 'baixa',
                titulo: `Aumento significativo vs. ${year - 1}`,
                descricao: `Este mês registra ${variacaoAnual.toFixed(0)}% mais resgates que o mesmo período do ano anterior.`,
                valor: porMes[mesAtual],
                referencia: historico.resgates,
                variacao: variacaoAnual,
                periodo: format(new Date(year, mesAtual - 1, 1), 'MMMM', { locale: ptBR })
              });
            }
          }
        }
      } else {
        // Para anos históricos, comparar com média dos anos anteriores
        const { data: resumoAnual } = await supabase
          .from('fact_resumo_mensal_historico')
          .select('mes, resgates')
          .eq('ano', year);

        const { data: mediaHistorica } = await supabase
          .from('fact_resumo_mensal_historico')
          .select('mes, resgates')
          .lt('ano', year)
          .gte('ano', year - 3);

        if (resumoAnual && mediaHistorica) {
          const mediasPorMes: Record<number, { soma: number; count: number }> = {};
          mediaHistorica.forEach(r => {
            if (!mediasPorMes[r.mes]) mediasPorMes[r.mes] = { soma: 0, count: 0 };
            mediasPorMes[r.mes].soma += r.resgates;
            mediasPorMes[r.mes].count++;
          });

          resumoAnual.forEach(r => {
            if (mediasPorMes[r.mes] && mediasPorMes[r.mes].count > 0) {
              const media = mediasPorMes[r.mes].soma / mediasPorMes[r.mes].count;
              const variacao = ((r.resgates - media) / media) * 100;
              
              if (variacao > 50) {
                const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                alertasList.push({
                  tipo: 'pico_mensal',
                  severidade: variacao > 80 ? 'alta' : 'media',
                  titulo: `Pico em ${MESES[r.mes - 1]}/${year}`,
                  descricao: `Mês registrou ${variacao.toFixed(0)}% acima da média histórica.`,
                  valor: r.resgates,
                  referencia: Math.round(media),
                  variacao,
                  periodo: MESES[r.mes - 1]
                });
              }
            }
          });
        }
      }

      // Ordenar por severidade
      const ordem = { alta: 0, media: 1, baixa: 2 };
      return alertasList.sort((a, b) => ordem[a.severidade] - ordem[b.severidade]);
    },
    staleTime: 5 * 60 * 1000
  });

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'alta': return 'bg-red-500 text-white';
      case 'media': return 'bg-amber-500 text-white';
      case 'baixa': return 'bg-blue-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'pico_regiao': return <MapPin className="h-4 w-4" />;
      case 'pico_mensal': return <Calendar className="h-4 w-4" />;
      case 'tendencia_alta': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-amber-500" />
          Alertas de Picos Incomuns
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertas && alertas.length > 0 ? (
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-full ${getSeverityColor(alerta.severidade)}`}>
                      {getIcon(alerta.tipo)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{alerta.titulo}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{alerta.descricao}</p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(alerta.severidade)}>
                    +{alerta.variacao.toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Atual: <strong className="text-foreground">{alerta.valor}</strong></span>
                  <span>Referência: <strong className="text-foreground">{alerta.referencia}</strong></span>
                  {alerta.periodo && <span>Período: {alerta.periodo}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum alerta de pico detectado para {year}</p>
            <p className="text-xs mt-1">Os dados estão dentro dos padrões esperados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardAlertasPicos;
