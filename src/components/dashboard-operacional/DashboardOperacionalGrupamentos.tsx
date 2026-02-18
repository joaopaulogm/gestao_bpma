import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Users } from 'lucide-react';

interface GrupamentoStat {
  nome: string;
  id: string;
  resgates: number;
  crimes: number;
  total: number;
  cor: string;
}

interface DashboardOperacionalGrupamentosProps {
  year: number;
}

// Grupamentos definidos com cores institucionais
const GRUPAMENTOS_CONFIG: Record<string, { label: string; cor: string }> = {
  'RP Ambiental': { label: 'RP Ambiental', cor: 'hsl(221, 83%, 35%)' },
  'GOC':          { label: 'GOC',          cor: 'hsl(142, 70%, 35%)' },
  'GTA':          { label: 'GTA',          cor: 'hsl(38, 90%, 45%)' },
  'Lacustre':     { label: 'Lacustre',     cor: 'hsl(200, 80%, 40%)' },
  'PREALG':       { label: 'PREALG',       cor: 'hsl(260, 60%, 45%)' },
  'Voluntário':   { label: 'Voluntário (SVG)', cor: 'hsl(340, 65%, 45%)' },
};

const DashboardOperacionalGrupamentos: React.FC<DashboardOperacionalGrupamentosProps> = ({ year }) => {
  const startDate = `${year}-01-01`;
  const endDate   = `${year}-12-31`;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-grupamentos', year],
    queryFn: async (): Promise<GrupamentoStat[]> => {
      // Buscar todos os grupamentos/serviços
      const { data: grupamentos } = await supabase
        .from('dim_grupamento_servico')
        .select('id, nome');

      if (!grupamentos?.length) return [];

      // Buscar resgates agrupados por grupamento_servico_id
      const [resgatesRes, crimesRes] = await Promise.all([
        supabase
          .from('fat_registros_de_resgate')
          .select('grupamento_servico_id')
          .gte('data', startDate)
          .lte('data', endDate),
        (supabase as any)
          .from('fat_registros_de_crimes_ambientais')
          .select('grupamento_servico_id')
          .gte('data', startDate)
          .lte('data', endDate),
      ]);

      // Contar por grupamento
      const resgateCount: Record<string, number> = {};
      (resgatesRes.data || []).forEach((r: any) => {
        if (r.grupamento_servico_id) {
          resgateCount[r.grupamento_servico_id] = (resgateCount[r.grupamento_servico_id] || 0) + 1;
        }
      });

      const crimeCount: Record<string, number> = {};
      (crimesRes.data || []).forEach((r: any) => {
        if (r.grupamento_servico_id) {
          crimeCount[r.grupamento_servico_id] = (crimeCount[r.grupamento_servico_id] || 0) + 1;
        }
      });

      // Montar stats apenas para grupamentos configurados
      return grupamentos
        .filter(g => Object.keys(GRUPAMENTOS_CONFIG).some(key => 
          g.nome?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(g.nome?.toLowerCase())
        ))
        .map(g => {
          // Encontrar config correspondente (busca flexível)
          const configKey = Object.keys(GRUPAMENTOS_CONFIG).find(key =>
            g.nome?.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(g.nome?.toLowerCase())
          );
          const config = configKey ? GRUPAMENTOS_CONFIG[configKey] : { label: g.nome, cor: 'hsl(0,0%,50%)' };

          const resgates = resgateCount[g.id] || 0;
          const crimes   = crimeCount[g.id]   || 0;

          return {
            nome: config.label,
            id: g.id,
            resgates,
            crimes,
            total: resgates + crimes,
            cor: config.cor,
          };
        })
        .sort((a, b) => b.total - a.total);
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...(stats || []).map(s => s.total), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Ocorrências por Grupamento — {year}</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(stats || []).map(g => (
          <Card key={g.id} className="overflow-hidden border border-border">
            {/* Barra de progresso no topo */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(to right, ${g.cor} ${(g.total / maxTotal) * 100}%, hsl(var(--muted)) ${(g.total / maxTotal) * 100}%)`
              }}
            />
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: g.cor }}
                />
                <span className="text-xs font-medium text-foreground leading-tight">
                  {g.nome}
                </span>
              </div>

              <div className="text-2xl font-bold text-foreground">
                {g.total.toLocaleString('pt-BR')}
              </div>

              <div className="space-y-0.5">
                {g.resgates > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Resgates</span>
                    <span className="font-medium text-foreground">{g.resgates}</span>
                  </div>
                )}
                {g.crimes > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Crimes</span>
                    <span className="font-medium text-foreground">{g.crimes}</span>
                  </div>
                )}
                {g.total === 0 && (
                  <div className="text-xs text-muted-foreground italic">Sem registros</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!stats || stats.length === 0) && (
          <div className="col-span-full text-center text-muted-foreground py-8 text-sm">
            Nenhum dado de grupamento disponível para {year}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOperacionalGrupamentos;
