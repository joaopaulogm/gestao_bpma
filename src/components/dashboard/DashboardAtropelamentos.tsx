import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, MapPin, AlertTriangle, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface AtropelamentoData {
  especie: string;
  quantidade: number;
  regiao: string;
}

interface HotspotData {
  regiao: string;
  total: number;
  especies: string[];
}

interface DashboardAtropelamentosProps {
  year: number;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const DashboardAtropelamentos: React.FC<DashboardAtropelamentosProps> = ({ year }) => {
  const [viewMode, setViewMode] = useState<'especie' | 'regiao'>('especie');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-atropelamentos', year],
    queryFn: async () => {
      // Buscar lookups
      const [especiesRes, regioesRes] = await Promise.all([
        supabase.from('dim_especies_fauna').select('id, nome_popular'),
        supabase.from('dim_regiao_administrativa').select('id, nome')
      ]);

      const especiesLookup: Record<string, string> = {};
      (especiesRes.data || []).forEach(e => { especiesLookup[e.id] = e.nome_popular; });
      
      const regioesLookup: Record<string, string> = {};
      (regioesRes.data || []).forEach(r => { regioesLookup[r.id] = r.nome; });

      let atropelamentos: AtropelamentoData[] = [];

      if (year >= 2026) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data: resgates } = await supabase
          .from('fat_registros_de_resgate')
          .select('especie_id, regiao_administrativa_id, quantidade_total, quantidade_adulto, quantidade_filhote, atropelamento')
          .gte('data', startDate)
          .lte('data', endDate)
          .eq('atropelamento', 'Sim');

        (resgates || []).forEach(r => {
          const qty = r.quantidade_total || (r.quantidade_adulto || 0) + (r.quantidade_filhote || 0) || 1;
          atropelamentos.push({
            especie: r.especie_id ? especiesLookup[r.especie_id] || 'Não identificada' : 'Não identificada',
            quantidade: qty,
            regiao: r.regiao_administrativa_id ? regioesLookup[r.regiao_administrativa_id] || 'Não informada' : 'Não informada'
          });
        });
      } else {
        // Anos históricos - usar tabelas fat_resgates_diarios_YYYY
        const tableName = year === 2025 ? 'fat_resgates_diarios_2025' : `fat_resgates_diarios_${year}`;
        
        try {
          const { data: resgates } = await supabase
            .from(tableName as any)
            .select('nome_popular, regiao_administrativa, quantidade_resgates, origem_ocorrencia');

          (resgates || []).forEach((r: any) => {
            // Verificar se foi atropelamento baseado na origem da ocorrência
            if (r.origem_ocorrencia?.toLowerCase().includes('atropel') || 
                r.origem_ocorrencia?.toLowerCase().includes('roadkill')) {
              atropelamentos.push({
                especie: r.nome_popular || 'Não identificada',
                quantidade: r.quantidade_resgates || 1,
                regiao: r.regiao_administrativa || 'Não informada'
              });
            }
          });
        } catch (err) {
          console.warn(`Tabela ${tableName} não encontrada ou erro:`, err);
        }
      }

      // Agregar por espécie
      const porEspecie: Record<string, number> = {};
      atropelamentos.forEach(a => {
        porEspecie[a.especie] = (porEspecie[a.especie] || 0) + a.quantidade;
      });

      const especiesData = Object.entries(porEspecie)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      // Agregar por região (hotspots)
      const porRegiao: Record<string, { total: number; especies: Set<string> }> = {};
      atropelamentos.forEach(a => {
        if (!porRegiao[a.regiao]) {
          porRegiao[a.regiao] = { total: 0, especies: new Set() };
        }
        porRegiao[a.regiao].total += a.quantidade;
        porRegiao[a.regiao].especies.add(a.especie);
      });

      const hotspots: HotspotData[] = Object.entries(porRegiao)
        .map(([regiao, data]) => ({
          regiao,
          total: data.total,
          especies: Array.from(data.especies).slice(0, 3)
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

      const totalAtropelamentos = atropelamentos.reduce((sum, a) => sum + a.quantidade, 0);
      const totalEspecies = Object.keys(porEspecie).length;
      const totalRegioes = Object.keys(porRegiao).length;

      return {
        especiesData,
        hotspots,
        totalAtropelamentos,
        totalEspecies,
        totalRegioes
      };
    },
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-red-500" />
            Análise de Atropelamentos de Fauna
          </CardTitle>
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'especie' | 'regiao')}>
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="especie">Por Espécie</SelectItem>
              <SelectItem value="regiao">Por Região (Hotspots)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
            <Car className="h-5 w-5 mx-auto text-red-500 mb-1" />
            <p className="text-xl font-bold text-red-600">{data?.totalAtropelamentos || 0}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold text-amber-600">{data?.totalEspecies || 0}</p>
            <p className="text-xs text-muted-foreground">Espécies</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
            <MapPin className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold text-blue-600">{data?.totalRegioes || 0}</p>
            <p className="text-xs text-muted-foreground">Regiões</p>
          </div>
        </div>

        {viewMode === 'especie' ? (
          <div>
            <h4 className="text-sm font-medium mb-3">Top 10 Espécies Mais Atropeladas</h4>
            {data?.especiesData && data.especiesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.especiesData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={90}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="quantidade" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum dado de atropelamento encontrado para {year}</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-medium mb-3">Hotspots de Atropelamento (Top Regiões)</h4>
            {data?.hotspots && data.hotspots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.hotspots.map((hotspot, index) => (
                  <div 
                    key={hotspot.regiao}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{hotspot.regiao}</h5>
                          <p className="text-xs text-muted-foreground">
                            {hotspot.especies.join(', ')}
                            {hotspot.especies.length === 3 && '...'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {hotspot.total}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum hotspot identificado para {year}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardAtropelamentos;
