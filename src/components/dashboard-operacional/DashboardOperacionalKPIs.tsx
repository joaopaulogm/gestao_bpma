import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Heart, 
  Skull, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Shield,
  Users,
  Gavel
} from 'lucide-react';
import { YearKPIs } from './DashboardOperacionalContent';

interface DashboardOperacionalKPIsProps {
  kpis: YearKPIs;
  year: number;
}

const DashboardOperacionalKPIs: React.FC<DashboardOperacionalKPIsProps> = ({ kpis, year }) => {
  const formatNumber = (n: number) => n.toLocaleString('pt-BR');
  const formatPercent = (n: number) => `${n.toFixed(1)}%`;

  interface KPICard {
    title: string;
    value: string;
    subtitle?: string;
    icon: typeof Bug;
    color: string;
    bgColor: string;
  }

  const kpiCards: KPICard[] = [
    {
      title: 'Animais Resgatados',
      value: formatNumber(kpis.totalAnimais),
      icon: Bug,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Solturas',
      value: formatNumber(kpis.totalSolturas),
      subtitle: formatPercent(kpis.taxaSoltura),
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Óbitos',
      value: formatNumber(kpis.totalObitos),
      subtitle: formatPercent(kpis.taxaMortalidade),
      icon: Skull,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Filhotes',
      value: formatNumber(kpis.totalFilhotes),
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    }
  ];

  // KPIs extras para 2026+
  const extendedKPIs: KPICard[] = !kpis.isHistorico ? [
    {
      title: 'Crimes Ambientais',
      value: formatNumber(kpis.totalCrimesAmbientais),
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Crimes Comuns',
      value: formatNumber(kpis.totalCrimesComuns),
      icon: Gavel,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Ações de Prevenção',
      value: formatNumber(kpis.totalPrevencao),
      icon: Shield,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10'
    },
    {
      title: 'Público Alcançado',
      value: formatNumber(kpis.publicoPrevencao),
      icon: Users,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ] : [];

  const allKPIs = [...kpiCards, ...extendedKPIs];

  return (
    <div className="space-y-4">
      {kpis.isHistorico && (
        <Badge variant="outline" className="mb-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Dados históricos - apenas resgates disponíveis
        </Badge>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allKPIs.map((kpi, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    {kpi.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOperacionalKPIs;
