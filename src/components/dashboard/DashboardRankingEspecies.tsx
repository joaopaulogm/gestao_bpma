import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Trophy, Filter, MapPin, Calendar, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DashboardRankingEspeciesProps {
  isPublico?: boolean;
  anosDisponiveis?: number[];
}

interface EspecieRankingItem {
  nome: string;
  quantidade: number;
  classe?: string;
  regiao?: string;
}

interface RegiaoOption {
  id: string;
  nome: string;
}

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03', '#3b82f6', '#2563eb', '#1d4ed8'];

const DashboardRankingEspecies: React.FC<DashboardRankingEspeciesProps> = ({
  isPublico = false,
  anosDisponiveis = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
}) => {
  const [anoInicio, setAnoInicio] = useState<number>(2020);
  const [anoFim, setAnoFim] = useState<number>(2025);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string>('all');

  // Buscar regiões administrativas
  const { data: regioes = [] } = useQuery({
    queryKey: ['regioes-ranking'],
    queryFn: async (): Promise<RegiaoOption[]> => {
      const { data, error } = await supabase
        .from('dim_regiao_administrativa')
        .select('id, nome')
        .order('nome');
      
      if (error) return [];
      return data || [];
    },
    staleTime: 10 * 60 * 1000
  });

  // Buscar ranking de espécies com filtros
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['ranking-especies', anoInicio, anoFim, regiaoSelecionada],
    queryFn: async (): Promise<EspecieRankingItem[]> => {
      const resultado: Record<string, { quantidade: number; classe?: string }> = {};

      // Para cada ano no período, buscar dados da tabela apropriada
      for (let ano = anoInicio; ano <= anoFim; ano++) {
        if (ano <= 2024) {
          // Tabelas históricas fat_resgates_diarios_YYYY
          const { data, error } = await supabase
            .from(`fat_resgates_diarios_${ano}` as any)
            .select('nome_popular, classe_taxonomica, quantidade_resgates');

          if (!error && data) {
            (data as any[]).forEach((row) => {
              const nome = row.nome_popular || 'Não identificado';
              if (!resultado[nome]) {
                resultado[nome] = { quantidade: 0, classe: row.classe_taxonomica };
              }
              resultado[nome].quantidade += row.quantidade_resgates || 0;
            });
          }
        } else if (ano === 2025) {
          // Tabela específica de 2025
          const { data, error } = await supabase
            .from('fat_resgates_diarios_2025_especies')
            .select('nome_popular, classe_taxonomica, quantidade_resgates');

          if (!error && data) {
            (data as any[]).forEach((row) => {
              const nome = row.nome_popular || 'Não identificado';
              if (!resultado[nome]) {
                resultado[nome] = { quantidade: 0, classe: row.classe_taxonomica };
              }
              resultado[nome].quantidade += row.quantidade_resgates || 0;
            });
          }
        } else if (ano >= 2026) {
          // Tabela fat_registros_de_resgate com join em espécie e região
          const startDate = `${ano}-01-01`;
          const endDate = `${ano}-12-31`;

          let query = supabase
            .from('fat_registros_de_resgate')
            .select(`
              quantidade_total, quantidade_adulto, quantidade_filhote,
              regiao_administrativa_id,
              especie:dim_especies_fauna(nome_popular, classe_taxonomica)
            `)
            .gte('data', startDate)
            .lte('data', endDate);

          // Filtrar por região se selecionada
          if (regiaoSelecionada !== 'all') {
            query = query.eq('regiao_administrativa_id', regiaoSelecionada);
          }

          const { data, error } = await query;

          if (!error && data) {
            (data as any[]).forEach((row) => {
              const nome = row.especie?.nome_popular || 'Não identificado';
              const qty = row.quantidade_total || (row.quantidade_adulto || 0) + (row.quantidade_filhote || 0) || 1;
              if (!resultado[nome]) {
                resultado[nome] = { quantidade: 0, classe: row.especie?.classe_taxonomica };
              }
              resultado[nome].quantidade += qty;
            });
          }
        }
      }

      // Converter para array e ordenar
      return Object.entries(resultado)
        .map(([nome, { quantidade, classe }]) => ({ nome, quantidade, classe }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);
    },
    staleTime: 5 * 60 * 1000
  });

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    if (!rankingData || rankingData.length === 0) return null;

    const total = rankingData.reduce((sum, e) => sum + e.quantidade, 0);
    const top3Total = rankingData.slice(0, 3).reduce((sum, e) => sum + e.quantidade, 0);
    const concentracaoTop3 = total > 0 ? (top3Total / total) * 100 : 0;

    // Contagem por classe
    const porClasse: Record<string, number> = {};
    rankingData.forEach(e => {
      const c = e.classe || 'Não informado';
      porClasse[c] = (porClasse[c] || 0) + e.quantidade;
    });

    const classesMaisComuns = Object.entries(porClasse)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([classe]) => classe);

    return {
      total,
      concentracaoTop3,
      campeao: rankingData[0],
      classesMaisComuns
    };
  }, [rankingData]);

  const primaryColor = isPublico ? '#071d49' : 'hsl(var(--primary))';
  const accentColor = isPublico ? '#ffcc00' : 'hsl(142, 76%, 36%)';

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            <Trophy className={`h-5 w-5 ${isPublico ? 'text-[#ffcc00]' : 'text-green-600'}`} />
            Ranking Interativo - Top 10 Espécies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ano Início
              </label>
              <Select value={anoInicio.toString()} onValueChange={(v) => setAnoInicio(parseInt(v))}>
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
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ano Fim
              </label>
              <Select value={anoFim.toString()} onValueChange={(v) => setAnoFim(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anosDisponiveis.filter(a => a >= anoInicio).map(ano => (
                    <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Região Administrativa
              </label>
              <Select value={regiaoSelecionada} onValueChange={setRegiaoSelecionada}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as regiões</SelectItem>
                  {regioes.map(regiao => (
                    <SelectItem key={regiao.id} value={regiao.id}>{regiao.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Badges de filtros ativos */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="bg-primary/10">
              <Calendar className="h-3 w-3 mr-1" />
              {anoInicio} - {anoFim}
            </Badge>
            {regiaoSelecionada !== 'all' && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <MapPin className="h-3 w-3 mr-1" />
                {regioes.find(r => r.id === regiaoSelecionada)?.nome || 'Região'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumo */}
      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Espécie Campeã</p>
                  <p className="font-bold text-sm truncate">{estatisticas.campeao?.nome || '-'}</p>
                  <p className={`text-lg font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                    {estatisticas.campeao?.quantidade.toLocaleString('pt-BR') || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Top 10</p>
              <p className={`text-2xl font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                {estatisticas.total.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
          <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Concentração Top 3</p>
                  <p className={`text-2xl font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                    {estatisticas.concentracaoTop3.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={isPublico ? 'glass-card' : 'glass-card border-green-100'}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Classes Predominantes</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {estatisticas.classesMaisComuns.map((classe, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {classe}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Ranking */}
      <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100 shadow-xl'}>
        <CardHeader className={isPublico ? 'bg-[#071d49]/5 border-b border-[#071d49]/10' : 'bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100'}>
          <CardTitle className={`text-lg font-semibold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
            Top 10 Espécies Mais Resgatadas ({anoInicio}-{anoFim})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !rankingData || rankingData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado disponível para o período selecionado.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart 
                data={rankingData} 
                layout="vertical"
                margin={{ top: 20, right: 80, left: 150, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="rankingGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={isPublico ? '#071d49' : '#166534'} />
                    <stop offset="100%" stopColor={isPublico ? '#ffcc00' : '#22c55e'} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  width={140}
                  tick={{ fontSize: 12, fill: '#374151' }}
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
                  formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Resgates']}
                />
                <Bar 
                  dataKey="quantidade" 
                  fill="url(#rankingGradient)"
                  radius={[0, 4, 4, 0]}
                >
                  {rankingData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index] || '#6b7280'}
                    />
                  ))}
                  <LabelList 
                    dataKey="quantidade" 
                    position="right" 
                    fill="#374151" 
                    fontSize={12}
                    formatter={(value: number) => value.toLocaleString('pt-BR')}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Lista detalhada */}
      {rankingData && rankingData.length > 0 && (
        <Card className={isPublico ? 'glass-card border-[#071d49]/20' : 'glass-card border-green-100'}>
          <CardContent className="p-6">
            <div className="space-y-2">
              {rankingData.map((especie, index) => (
                <div 
                  key={especie.nome}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: COLORS[index] || '#6b7280' }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{especie.nome}</p>
                      {especie.classe && (
                        <p className="text-xs text-muted-foreground">{especie.classe}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isPublico ? 'text-[#071d49]' : 'text-green-700'}`}>
                      {especie.quantidade.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">resgates</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardRankingEspecies;
