import React, { useMemo } from 'react';
import { DashboardData } from '@/types/hotspots';
import { Calendar, TrendingUp, TrendingDown, Award, Target, Leaf } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface DashboardAdvancedKPIsProps {
  data: DashboardData;
  year: number;
  month: number | null;
}

const DashboardAdvancedKPIs: React.FC<DashboardAdvancedKPIsProps> = ({ data, year, month }) => {
  const registros = data.rawData || [];
  
  const kpis = useMemo(() => {
    // Para 2021-2024, buscar dados das novas tabelas BPMA
    const usarNovasTabelas = year >= 2021 && year <= 2024;
    
    // Filtrar registros pelo ano e mês
    const registrosFiltrados = registros.filter((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return false;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const anoRegistro = dataObj.getFullYear();
      const mesRegistro = dataObj.getMonth() + 1;
      
      if (anoRegistro !== year) return false;
      if (month !== null && mesRegistro !== month + 1) return false;
      
      return true;
    });
    
    // Mês atual e mês anterior
    const mesAtual = month !== null ? month : new Date().getMonth();
    const anoAtual = year;
    const mesNumero = month !== null ? month + 1 : null;
    
    const inicioMesAtual = startOfMonth(new Date(anoAtual, mesAtual, 1));
    const fimMesAtual = endOfMonth(new Date(anoAtual, mesAtual, 1));
    const inicioMesAnterior = startOfMonth(subMonths(new Date(anoAtual, mesAtual, 1), 1));
    const fimMesAnterior = endOfMonth(subMonths(new Date(anoAtual, mesAtual, 1), 1));
    
    // Para 2021-2024, usar dados das novas tabelas
    let totalMesAtual = 0;
    let totalMesAnterior = 0;
    let totalPeriodo = 0;
    let totalSolturas = 0;
    const especiesMap = new Map<string, { nome: string, quantidade: number }>();
    let especiesDistintas = 0;
    
    if (usarNovasTabelas) {
      // Buscar dados agregados de bpma_fato_mensal
      // Nota: Esta busca será feita de forma síncrona no useMemo, então vamos calcular baseado nos dados já carregados
      // Se os dados vierem agregados, usar diretamente
      const dadosAgregados = registrosFiltrados.filter((r: any) => r.tipo_registro === 'agregado');
      const dadosPorEspecie = registrosFiltrados.filter((r: any) => r.tipo_registro !== 'agregado');
      
      if (dadosAgregados.length > 0) {
        // Usar dados agregados
        totalMesAtual = dadosAgregados.reduce((acc: number, r: any) => acc + (Number(r.quantidade) || 0), 0);
        totalPeriodo = totalMesAtual;
        
        // Buscar mês anterior das novas tabelas (seria necessário fazer query, mas por enquanto usar dados carregados)
        const mesAnteriorNumero = mesNumero ? (mesNumero === 1 ? 12 : mesNumero - 1) : null;
        const anoAnterior = mesNumero === 1 ? anoAtual - 1 : anoAtual;
        
        // Para solturas, buscar da tabela bpma_fato_mensal
        // Por enquanto, calcular dos dados por espécie se disponíveis
        if (dadosPorEspecie.length > 0) {
          totalSolturas = dadosPorEspecie.reduce((acc: number, r: any) => 
            acc + (Number(r.quantidade_soltura) || 0), 0);
          
          // Top espécie e riqueza
          dadosPorEspecie.forEach((r: any) => {
            const especieNome = r.especie?.nome_popular || r.nome_popular || 'Não identificada';
            const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
            especiesMap.set(especieNome, {
              nome: especieNome,
              quantidade: (especiesMap.get(especieNome)?.quantidade || 0) + quantidade
            });
          });
          
          especiesDistintas = new Set(
            dadosPorEspecie
              .map((r: any) => r.especie?.nome_cientifico || r.nome_cientifico)
              .filter(Boolean)
          ).size;
        }
      } else if (dadosPorEspecie.length > 0) {
        // Usar dados por espécie (mais detalhados)
        totalMesAtual = dadosPorEspecie.reduce((acc: number, r: any) => 
          acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0), 0);
        totalPeriodo = totalMesAtual;
        totalSolturas = dadosPorEspecie.reduce((acc: number, r: any) => 
          acc + (Number(r.quantidade_soltura) || 0), 0);
        
        dadosPorEspecie.forEach((r: any) => {
          const especieNome = r.especie?.nome_popular || r.nome_popular || 'Não identificada';
          const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
          especiesMap.set(especieNome, {
            nome: especieNome,
            quantidade: (especiesMap.get(especieNome)?.quantidade || 0) + quantidade
          });
        });
        
        especiesDistintas = new Set(
          dadosPorEspecie
            .map((r: any) => r.especie?.nome_cientifico || r.nome_cientifico)
            .filter(Boolean)
        ).size;
      }
    } else {
      // Para outros anos, usar lógica original
      const resgatesMesAtual = registrosFiltrados.filter((r: any) => {
        const dataRegistro = r.data || r.data_ocorrencia;
        if (!dataRegistro) return false;
        const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
        return dataObj >= inicioMesAtual && dataObj <= fimMesAtual;
      });
      
      totalMesAtual = resgatesMesAtual.reduce((acc: number, r: any) => {
        return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
      }, 0);
      
      // Resgates no mês anterior
      const resgatesMesAnterior = registros.filter((r: any) => {
        const dataRegistro = r.data || r.data_ocorrencia;
        if (!dataRegistro) return false;
        const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
        return dataObj >= inicioMesAnterior && dataObj <= fimMesAnterior;
      });
      
      totalMesAnterior = resgatesMesAnterior.reduce((acc: number, r: any) => {
        return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
      }, 0);
      
      totalPeriodo = registrosFiltrados.reduce((acc: number, r: any) => {
        return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
      }, 0);
      
      // Top 1 espécie
      registrosFiltrados.forEach((r: any) => {
        const especieNome = r.especie?.nome_popular || r.nome_popular || 'Não identificada';
        const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
        especiesMap.set(especieNome, {
          nome: especieNome,
          quantidade: (especiesMap.get(especieNome)?.quantidade || 0) + quantidade
        });
      });
      
      especiesDistintas = new Set(
        registrosFiltrados
          .map((r: any) => r.especie?.id || r.especie_id || r.nome_cientifico || r.nome_popular)
          .filter(Boolean)
      ).size;
      
      // Taxa de soltura
      const solturas = registrosFiltrados.filter((r: any) => 
        r.destinacao?.nome?.toLowerCase().includes('soltura') ||
        r.desfecho?.nome?.toLowerCase().includes('soltura') ||
        r.desfecho?.tipo === 'Soltura' ||
        (r as any).quantidade_solturas > 0
      );
      
      totalSolturas = solturas.reduce((acc: number, r: any) => {
        return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_solturas) || 0);
      }, 0);
    }
    
    const variacaoMes = totalMesAnterior > 0 
      ? ((totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100 
      : 0;
    
    // Média diária no período filtrado
    const diasNoPeriodo = month !== null 
      ? differenceInDays(fimMesAtual, inicioMesAtual) + 1
      : differenceInDays(new Date(anoAtual, 11, 31), new Date(anoAtual, 0, 1)) + 1;
    
    const mediaDiaria = diasNoPeriodo > 0 ? totalPeriodo / diasNoPeriodo : 0;
    
    const topEspecie = Array.from(especiesMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)[0];
    
    const percentualTopEspecie = totalPeriodo > 0 && topEspecie
      ? (topEspecie.quantidade / totalPeriodo) * 100
      : 0;
    
    const taxaSoltura = totalPeriodo > 0 ? (totalSolturas / totalPeriodo) * 100 : 0;
    
    return {
      resgatesMesAtual: totalMesAtual,
      variacaoMes,
      mediaDiaria,
      topEspecie: topEspecie?.nome || 'N/A',
      percentualTopEspecie,
      taxaSoltura,
      riquezaEspecies: especiesDistintas
    };
  }, [registros, year, month]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      {/* Resgates no Mês Atual */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
        <div className="absolute top-4 right-4 p-2 rounded-full bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium mb-3 pr-10 text-muted-foreground">
          Resgates no Mês Atual
        </p>
        <p className="text-4xl font-bold mb-3 text-foreground">
          {kpis.resgatesMesAtual.toLocaleString('pt-BR')}
        </p>
        {kpis.variacaoMes !== 0 && (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            kpis.variacaoMes >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${
              kpis.variacaoMes >= 0 ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {kpis.variacaoMes >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
            </span>
            <span>
              {kpis.variacaoMes >= 0 ? '+' : ''}{kpis.variacaoMes.toFixed(1)}% vs. mês anterior
            </span>
          </div>
        )}
      </div>

      {/* Média Diária */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
        <div className="absolute top-4 right-4 p-2 rounded-full bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
        <p className="text-sm font-medium mb-3 pr-10 text-muted-foreground">
          Média Diária
        </p>
        <p className="text-4xl font-bold mb-3 text-foreground">
          {kpis.mediaDiaria.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground">
          Resgates por dia no período
        </p>
      </div>

      {/* Top 1 Espécie */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
        <div className="absolute top-4 right-4 p-2 rounded-full bg-yellow-50">
          <Award className="h-4 w-4 text-yellow-600" />
        </div>
        <p className="text-sm font-medium mb-3 pr-10 text-muted-foreground">
          Top 1 Espécie
        </p>
        <p className="text-lg font-bold mb-1 text-foreground truncate" title={kpis.topEspecie}>
          {kpis.topEspecie}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {kpis.percentualTopEspecie.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          do total de resgates
        </p>
      </div>

      {/* Taxa de Soltura */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
        <div className="absolute top-4 right-4 p-2 rounded-full bg-purple-50">
          <Target className="h-4 w-4 text-purple-600" />
        </div>
        <p className="text-sm font-medium mb-3 pr-10 text-muted-foreground">
          Taxa de Soltura
        </p>
        <p className="text-4xl font-bold mb-3 text-foreground">
          {kpis.taxaSoltura.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground">
          Solturas / Total de Resgates
        </p>
      </div>

      {/* Riqueza de Espécies */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-300">
        <div className="absolute top-4 right-4 p-2 rounded-full bg-emerald-50">
          <Leaf className="h-4 w-4 text-emerald-600" />
        </div>
        <p className="text-sm font-medium mb-3 pr-10 text-muted-foreground">
          Riqueza de Espécies
        </p>
        <p className="text-4xl font-bold mb-3 text-foreground">
          {kpis.riquezaEspecies}
        </p>
        <p className="text-xs text-muted-foreground">
          Espécies distintas resgatadas
        </p>
      </div>
    </div>
  );
};

export default DashboardAdvancedKPIs;

