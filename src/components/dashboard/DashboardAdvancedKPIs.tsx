import React, { useMemo } from 'react';
import { DashboardData } from '@/types/hotspots';
import { Calendar, TrendingUp, TrendingDown, Award, Target, Leaf } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardAdvancedKPIsProps {
  data: DashboardData;
  year: number;
  month: number | null;
}

const DashboardAdvancedKPIs: React.FC<DashboardAdvancedKPIsProps> = ({ data, year, month }) => {
  const registros = data.rawData || [];
  
  const kpis = useMemo(() => {
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
    
    const inicioMesAtual = startOfMonth(new Date(anoAtual, mesAtual, 1));
    const fimMesAtual = endOfMonth(new Date(anoAtual, mesAtual, 1));
    const inicioMesAnterior = startOfMonth(subMonths(new Date(anoAtual, mesAtual, 1), 1));
    const fimMesAnterior = endOfMonth(subMonths(new Date(anoAtual, mesAtual, 1), 1));
    
    // Resgates no mês atual
    const resgatesMesAtual = registrosFiltrados.filter((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return false;
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      return dataObj >= inicioMesAtual && dataObj <= fimMesAtual;
    });
    
    const totalMesAtual = resgatesMesAtual.reduce((acc: number, r: any) => {
      return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
    }, 0);
    
    // Resgates no mês anterior
    const resgatesMesAnterior = registros.filter((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return false;
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      return dataObj >= inicioMesAnterior && dataObj <= fimMesAnterior;
    });
    
    const totalMesAnterior = resgatesMesAnterior.reduce((acc: number, r: any) => {
      return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
    }, 0);
    
    const variacaoMes = totalMesAnterior > 0 
      ? ((totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100 
      : 0;
    
    // Média diária no período filtrado
    const diasNoPeriodo = month !== null 
      ? differenceInDays(fimMesAtual, inicioMesAtual) + 1
      : differenceInDays(new Date(anoAtual, 11, 31), new Date(anoAtual, 0, 1)) + 1;
    
    const totalPeriodo = registrosFiltrados.reduce((acc: number, r: any) => {
      return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0);
    }, 0);
    
    const mediaDiaria = diasNoPeriodo > 0 ? totalPeriodo / diasNoPeriodo : 0;
    
    // Top 1 espécie
    const especiesMap = new Map<string, { nome: string, quantidade: number }>();
    registrosFiltrados.forEach((r: any) => {
      const especieNome = r.especie?.nome_popular || r.nome_popular || 'Não identificada';
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      especiesMap.set(especieNome, {
        nome: especieNome,
        quantidade: (especiesMap.get(especieNome)?.quantidade || 0) + quantidade
      });
    });
    
    const topEspecie = Array.from(especiesMap.values())
      .sort((a, b) => b.quantidade - a.quantidade)[0];
    
    const percentualTopEspecie = totalPeriodo > 0 && topEspecie
      ? (topEspecie.quantidade / totalPeriodo) * 100
      : 0;
    
    // Taxa de soltura
    const solturas = registrosFiltrados.filter((r: any) => 
      r.destinacao?.nome?.toLowerCase().includes('soltura') ||
      r.desfecho?.nome?.toLowerCase().includes('soltura') ||
      r.desfecho?.tipo === 'Soltura' ||
      (r as any).quantidade_solturas > 0
    );
    
    const totalSolturas = solturas.reduce((acc: number, r: any) => {
      return acc + (Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_solturas) || 0);
    }, 0);
    
    const taxaSoltura = totalPeriodo > 0 ? (totalSolturas / totalPeriodo) * 100 : 0;
    
    // Riqueza de espécies
    const especiesDistintas = new Set(
      registrosFiltrados
        .map((r: any) => r.especie?.id || r.especie_id || r.nome_cientifico || r.nome_popular)
        .filter(Boolean)
    ).size;
    
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

