import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;
import { processDashboardData } from '@/utils/dashboardDataProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Bird, 
  Activity, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Filter,
  PawPrint,
  Skull,
  HeartPulse,
  Home,
  Car,
  TreePine,
  Shield,
  AlertTriangle,
  Map as MapIcon,
  BarChart3,
  Trophy,
  Download
} from 'lucide-react';
import logoBpma from '@/assets/logo-bpma.png';
import DashboardComparativoAnos from '@/components/dashboard/DashboardComparativoAnos';
import DashboardMapaCalor from '@/components/dashboard/DashboardMapaCalor';
import DashboardRankingEspecies from '@/components/dashboard/DashboardRankingEspecies';
import DashboardTendenciaSazonal from '@/components/dashboard/DashboardTendenciaSazonal';
import DashboardAlertasPicos from '@/components/dashboard/DashboardAlertasPicos';
import DashboardAtropelamentos from '@/components/dashboard/DashboardAtropelamentos';
import DashboardPublicoExport from '@/components/dashboard/DashboardPublicoExport';

const COLORS = ['#071d49', '#ffcc00', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#22c55e'];

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const DashboardPublico = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<string | null>(null);

  const isHistorico = selectedYear && selectedYear <= 2025;

  // Fetch rescue data based on selected year
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['public-dashboard-rescues', selectedYear, selectedMonth, selectedClasse],
    queryFn: async () => {
      console.log('🔍 [DashboardPublico] Buscando dados de resgates...', { selectedYear, selectedMonth });
      
      // Determinar quais tabelas buscar baseado no ano selecionado
      let tabelas: string[] = [];
      
      if (!selectedYear) {
        // Sem ano selecionado - buscar de todas as tabelas disponíveis (todos os anos)
        const tabelasHistoricas = YEARS
          .filter((year) => year <= 2025 && year >= 2020)
          .map((year) => (year === 2025 ? 'fat_resgates_diarios_2025' : `fat_resgates_diarios_${year}`));
        tabelas = ['fat_registros_de_resgate', ...tabelasHistoricas];
        console.log('📊 [DashboardPublico] Sem ano selecionado, buscando em todas as tabelas de resgates');
      } else if (selectedYear >= 2026) {
        // Para 2026 e anos seguintes, usar APENAS fat_registros_de_resgate
        tabelas = ['fat_registros_de_resgate'];
        console.log('📊 [DashboardPublico] Ano >= 2026, usando tabela: fat_registros_de_resgate');
      } else if (selectedYear === 2025) {
        // Para 2025, buscar de ambas as tabelas
        tabelas = ['fat_registros_de_resgate', 'fat_resgates_diarios_2025'];
        console.log('📊 [DashboardPublico] Ano 2025, usando tabelas: fat_registros_de_resgate e fat_resgates_diarios_2025');
      } else if (selectedYear >= 2020 && selectedYear <= 2024) {
        // Para anos históricos (2020-2024), usar tabela específica do ano
        tabelas = [`fat_resgates_diarios_${selectedYear}`];
        console.log(`📊 [DashboardPublico] Ano histórico ${selectedYear}, usando tabela: fat_resgates_diarios_${selectedYear}`);
      } else {
        // Fallback para fat_registros_de_resgate
        tabelas = ['fat_registros_de_resgate'];
        console.log('📊 [DashboardPublico] Ano desconhecido, usando tabela padrão: fat_registros_de_resgate');
      }
      
      const allRegistros: any[] = [];
      
      // Buscar de todas as tabelas em paralelo
      await Promise.all(tabelas.map(async (tabela) => {
        try {
          console.log(`🔍 [DashboardPublico] Buscando de ${tabela}...`);
          
          // Para tabelas históricas (2020-2024), usar campos diferentes
          if (tabela.match(/fat_resgates_diarios_202[0-4]$/)) {
            let query = supabaseAny
              .from(tabela)
              .select('id, data_ocorrencia, especie_id, quantidade_resgates, nome_popular, nome_cientifico, classe_taxonomica')
              .order('data_ocorrencia', { ascending: false });
            
            // Aplicar filtros de data
            if (selectedYear) {
              const startDate = `${selectedYear}-01-01`;
              const endDate = `${selectedYear}-12-31`;
              query = query.gte('data_ocorrencia', startDate).lte('data_ocorrencia', endDate);
              
              if (selectedMonth) {
                const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
                const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
                const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
                query = query.gte('data_ocorrencia', monthStart).lte('data_ocorrencia', monthEnd);
              }
            }
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ [DashboardPublico] Erro ao buscar de ${tabela}:`, error);
              return;
            }
            
            // Normalizar dados históricos para o formato esperado
            const normalized = (data || []).map((r: any) => ({
              id: r.id,
              data: r.data_ocorrencia,
              especie_id: r.especie_id,
              quantidade_total: r.quantidade_resgates || 0,
              quantidade: r.quantidade_resgates || 0,
              especie: {
                nome_popular: r.nome_popular || 'Não identificado',
                nome_cientifico: r.nome_cientifico,
                classe_taxonomica: r.classe_taxonomica
              },
              regiao_administrativa: null,
              origem: null,
              destinacao: null,
              estado_saude: null,
              estagio_vida: null,
              desfecho: null,
              atropelamento: null,
            }));
            
            allRegistros.push(...normalized);
            console.log(`✅ [DashboardPublico] ${tabela}: ${normalized.length} registros encontrados`);
          } else {
            // Para fat_registros_de_resgate e fat_resgates_diarios_2025
            let query = supabaseAny
              .from(tabela)
              .select(`
                *,
                especie:dim_especies_fauna(id, nome_popular, nome_cientifico, classe_taxonomica, ordem_taxonomica, estado_de_conservacao, tipo_de_fauna),
                regiao_administrativa:dim_regiao_administrativa(id, nome),
                origem:dim_origem(id, nome),
                destinacao:dim_destinacao(id, nome),
                estado_saude:dim_estado_saude(id, nome),
                estagio_vida:dim_estagio_vida(id, nome),
                desfecho:dim_desfecho_resgates(id, nome, tipo)
              `)
              .order('data', { ascending: false });
            
            // Aplicar filtros de data
            if (selectedYear) {
              const startDate = `${selectedYear}-01-01`;
              const endDate = `${selectedYear}-12-31`;
              query = query.gte('data', startDate).lte('data', endDate);
              
              if (selectedMonth) {
                const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
                const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
                const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
                query = query.gte('data', monthStart).lte('data', monthEnd);
              }
            }
            
            const { data, error } = await query;
            
            if (error) {
              console.error(`❌ [DashboardPublico] Erro ao buscar de ${tabela}:`, error);
              return;
            }
            
            allRegistros.push(...(data || []));
            console.log(`✅ [DashboardPublico] ${tabela}: ${(data || []).length} registros encontrados`);
          }
        } catch (err: any) {
          console.error(`❌ [DashboardPublico] Erro ao buscar de ${tabela}:`, err);
        }
      }));
      
      console.log(`✅ [DashboardPublico] Total de registros encontrados: ${allRegistros.length}`);
      return allRegistros;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch historical data for years <= 2025
  const { data: historicalData } = useQuery({
    queryKey: ['public-dashboard-historical', selectedYear, selectedMonth],
    queryFn: async () => {
      if (!selectedYear || selectedYear > 2025) return null;

      // Use resumo mensal oficial for historical data
      const { data: resumoData, error } = await supabase
        .from('fact_resumo_mensal_historico')
        .select('*')
        .eq('ano', selectedYear);

      if (error) throw error;
      return resumoData || [];
    },
    enabled: !!selectedYear && selectedYear <= 2025,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch crimes data for 2026+
  const { data: crimesData } = useQuery({
    queryKey: ['public-dashboard-crimes', selectedYear, selectedMonth],
    queryFn: async () => {
      const startDate = selectedYear ? `${selectedYear}-01-01` : null;
      const endDate = selectedYear ? `${selectedYear}-12-31` : null;

      const ambientaisQuery = supabaseAny
        .from('fat_registros_de_crimes_ambientais')
        .select('id');
      const comunsQuery = supabase
        .from('fat_crimes_comuns')
        .select('id');

      if (startDate && endDate) {
        ambientaisQuery.gte('data', startDate).lte('data', endDate);
        comunsQuery.gte('data', startDate).lte('data', endDate);
      }

      const [ambientaisRes, comunsRes] = await Promise.all([ambientaisQuery, comunsQuery]);

      return {
        ambientais: ambientaisRes.data?.length || 0,
        comuns: comunsRes.data?.length || 0
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch prevention data for 2026+
  const { data: prevencaoData } = useQuery({
    queryKey: ['public-dashboard-prevencao', selectedYear, selectedMonth],
    queryFn: async () => {
      const startDate = selectedYear ? `${selectedYear}-01-01` : null;
      const endDate = selectedYear ? `${selectedYear}-12-31` : null;

      let query = supabase
        .from('fat_atividades_prevencao')
        .select('quantidade_publico');

      if (startDate && endDate) {
        query = query.gte('data', startDate).lte('data', endDate);
      }

      const { data, error } = await query;

      if (error) return { atividades: 0, publico: 0 };

      const total = data?.reduce((sum, p) => sum + (p.quantidade_publico || 0), 0) || 0;
      return {
        atividades: data?.length || 0,
        publico: total
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar dados comparativos históricos para gráfico entre anos
  const { data: dadosComparativos } = useQuery({
    queryKey: ['public-dashboard-comparativo'],
    queryFn: async () => {
      const { data: resumoData, error } = await supabase
        .from('fact_resumo_mensal_historico')
        .select('ano, mes, resgates, solturas, obitos')
        .order('ano')
        .order('mes');
      
      if (error) return [];
      
      return (resumoData || []).map(r => ({
        ano: r.ano,
        mes: r.mes,
        total: r.resgates || 0,
        solturas: r.solturas || 0,
        obitos: r.obitos || 0
      }));
    },
    staleTime: 10 * 60 * 1000
  });

  // Buscar dados para mapa de calor (pontos geográficos)
  const { data: pontosMapaCalor } = useQuery({
    queryKey: ['public-dashboard-mapa-calor', selectedYear],
    queryFn: async () => {
      if (selectedYear && selectedYear < 2026) return [];

      const startDate = selectedYear ? `${selectedYear}-01-01` : null;
      const endDate = selectedYear ? `${selectedYear}-12-31` : null;

      let query = supabase
        .from('fat_registros_de_resgate')
        .select(`
          id, 
          latitude_origem, 
          longitude_origem,
          latitude_soltura,
          longitude_soltura,
          atropelamento,
          especie_id,
          regiao_administrativa_id
        `);

      if (startDate && endDate) {
        query = query.gte('data', startDate).lte('data', endDate);
      }

      const { data, error } = await query;
      
      if (error || !data) return [];
      
      // Buscar espécies e regiões
      const especieIds = [...new Set(data.filter(r => r.especie_id).map(r => r.especie_id as string))];
      const regiaoIds = [...new Set(data.filter(r => r.regiao_administrativa_id).map(r => r.regiao_administrativa_id as string))];
      
      const especiesLookup: Record<string, string> = {};
      const regioesLookup: Record<string, string> = {};
      
      if (especieIds.length > 0) {
        const { data: especiesData } = await supabase
          .from('dim_especies_fauna')
          .select('id, nome_popular')
          .in('id', especieIds);
        (especiesData || []).forEach(e => { especiesLookup[e.id] = e.nome_popular; });
      }
      
      if (regiaoIds.length > 0) {
        const { data: regioesData } = await supabase
          .from('dim_regiao_administrativa')
          .select('id, nome')
          .in('id', regiaoIds);
        (regioesData || []).forEach(r => { regioesLookup[r.id] = r.nome; });
      }
      
      const pontos: Array<{
        id: string;
        latitude: number;
        longitude: number;
        tipo: 'resgate' | 'apreensao' | 'soltura' | 'atropelamento';
        nomePopular?: string;
        regiao?: string;
      }> = [];
      
      data.forEach(r => {
        const nomePopular = r.especie_id ? especiesLookup[r.especie_id] : undefined;
        const regiao = r.regiao_administrativa_id ? regioesLookup[r.regiao_administrativa_id] : undefined;
        
        if (r.latitude_origem && r.longitude_origem) {
          const lat = parseFloat(r.latitude_origem);
          const lng = parseFloat(r.longitude_origem);
          if (!isNaN(lat) && !isNaN(lng)) {
            pontos.push({
              id: `${r.id}-origem`,
              latitude: lat,
              longitude: lng,
              tipo: r.atropelamento === 'Sim' ? 'atropelamento' : 'resgate',
              nomePopular,
              regiao
            });
          }
        }
        
        if (r.latitude_soltura && r.longitude_soltura) {
          const lat = parseFloat(r.latitude_soltura);
          const lng = parseFloat(r.longitude_soltura);
          if (!isNaN(lat) && !isNaN(lng)) {
            pontos.push({
              id: `${r.id}-soltura`,
              latitude: lat,
              longitude: lng,
              tipo: 'soltura',
              nomePopular,
              regiao
            });
          }
        }
      });
      
      return pontos;
    },
    staleTime: 5 * 60 * 1000
  });

  // Process dashboard data
  const processedData = useMemo(() => {
    if (isHistorico || !rawData) return processDashboardData([]);
    
    let filteredData = rawData;
    if (selectedClasse) {
      filteredData = rawData.filter((r: any) => 
        r.especie?.classe_taxonomica?.toLowerCase() === selectedClasse.toLowerCase()
      );
    }
    
    return processDashboardData(filteredData as any);
  }, [rawData, selectedClasse, isHistorico]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (isHistorico && historicalData) {
      // Calculate from historical resumo mensal
      const totals = historicalData.reduce((acc: any, row: any) => ({
        resgates: acc.resgates + (row.resgates || 0),
        solturas: acc.solturas + (row.solturas || 0),
        obitos: acc.obitos + (row.obitos || 0),
        feridos: acc.feridos + (row.feridos || 0),
        filhotes: acc.filhotes + (row.filhotes || 0),
        atropelamentos: acc.atropelamentos + (row.atropelamentos || 0)
      }), { resgates: 0, solturas: 0, obitos: 0, feridos: 0, filhotes: 0, atropelamentos: 0 });

      return {
        totalResgates: totals.resgates,
        totalAnimais: totals.resgates,
        solturas: totals.solturas,
        obitos: totals.obitos,
        atropelamentos: totals.atropelamentos,
        filhotes: totals.filhotes,
        feridos: totals.feridos,
        crimesAmbientais: 0,
        crimesComuns: 0,
        prevencao: 0
      };
    }

    const data = rawData || [];
    let filteredData = data;
    if (selectedClasse) {
      filteredData = data.filter((r: any) => 
        r.especie?.classe_taxonomica?.toLowerCase() === selectedClasse.toLowerCase()
      );
    }

    const totalResgates = filteredData.length;
    const totalAnimais = filteredData.reduce((sum: number, r: any) => 
      sum + (r.quantidade_total || r.quantidade || 1), 0);
    const solturas = filteredData.filter((r: any) => 
      r.destinacao?.nome?.toLowerCase().includes('soltura') || 
      r.desfecho?.nome?.toLowerCase().includes('soltura') ||
      r.desfecho?.nome?.toLowerCase().includes('vida livre')
    ).length;
    const obitos = filteredData.filter((r: any) => 
      r.desfecho?.nome?.toLowerCase().includes('óbito') ||
      r.desfecho?.nome?.toLowerCase().includes('obito')
    ).length;
    const atropelamentos = filteredData.filter((r: any) => 
      r.atropelamento === 'Sim'
    ).length;
    const filhotes = filteredData.reduce((sum: number, r: any) => 
      sum + (r.quantidade_filhote || 0), 0);
    const feridos = filteredData.filter((r: any) => 
      r.estado_saude?.nome?.toLowerCase().includes('ferido') ||
      r.estado_saude?.nome?.toLowerCase().includes('debilitado')
    ).length;

    return { 
      totalResgates, 
      totalAnimais, 
      solturas, 
      obitos, 
      atropelamentos, 
      filhotes, 
      feridos,
      crimesAmbientais: crimesData?.ambientais || 0,
      crimesComuns: crimesData?.comuns || 0,
      prevencao: prevencaoData?.atividades || 0
    };
  }, [rawData, selectedClasse, isHistorico, historicalData, crimesData, prevencaoData]);

  // Get unique classes
  const availableClasses = useMemo(() => {
    if (!rawData) return [];
    const classes = new Set<string>();
    rawData.forEach((r: any) => {
      if (r.especie?.classe_taxonomica) {
        classes.add(r.especie.classe_taxonomica);
      }
    });
    return Array.from(classes).sort();
  }, [rawData]);

  // Monthly distribution
  const monthlyData = useMemo(() => {
    if (isHistorico && historicalData) {
      const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return MESES.map((name, i) => {
        const row = historicalData.find((d: any) => d.mes === i + 1);
        return { name, value: row?.resgates || 0 };
      });
    }

    if (!rawData) return [];
    const monthCounts: Record<string, number> = {};
    
    rawData.forEach((r: any) => {
      if (r.data) {
        const month = new Date(r.data).toLocaleString('pt-BR', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    return Object.entries(monthCounts).map(([name, value]) => ({ name, value }));
  }, [rawData, isHistorico, historicalData]);

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedClasse(null);
  };

  const hasFilters = selectedMonth || selectedClasse || selectedYear !== null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#071d49] mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#071d49] text-white sticky top-0 z-50 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Logo com fundo branco e borda amarela para melhor visibilidade */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-[#ffcc00] flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,204,0,0.8)] animate-scale-in p-1">
                <img 
                  src={logoBpma} 
                  alt="BPMA" 
                  className="w-full h-full object-contain transition-transform duration-500 hover:rotate-[360deg]" 
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <h1 className="text-xl sm:text-2xl font-bold text-white transition-colors duration-300 hover:text-[#ffcc00]">
                  Gestão de Dados do BPMA
                </h1>
                <p className="text-sm text-[#ffcc00]">
                  Dashboard Público de Estatísticas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#ffcc00] text-[#071d49] border-0 font-semibold animate-scale-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: '0.2s' }}>
                <Activity className="h-3 w-3 mr-1" />
                Dados Públicos
              </Badge>
              {isHistorico && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Dados Históricos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-[#071d49]">
              <Filter className="h-5 w-5 text-[#ffcc00]" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Ano
                </label>
                <Select
                  value={selectedYear?.toString() || 'all'}
                  onValueChange={(v) => setSelectedYear(v === 'all' ? null : parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Mês</label>
                <Select
                  value={selectedMonth?.toString() || 'all'}
                  onValueChange={(v) => setSelectedMonth(v === 'all' ? null : parseInt(v))}
                  disabled={!selectedYear}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <PawPrint className="h-4 w-4" />
                  Classe Taxonômica
                </label>
                <Select
                  value={selectedClasse || 'all'}
                  onValueChange={(v) => setSelectedClasse(v === 'all' ? null : v)}
                  disabled={isHistorico}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {availableClasses.map((classe) => (
                      <SelectItem key={classe} value={classe}>
                        {classe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-[#071d49] hover:bg-[#071d49]/10 rounded-md transition-colors font-medium"
                >
                  Limpar filtros
                </button>
              )}
              
              <div className="ml-auto">
                <DashboardPublicoExport
                  metrics={metrics}
                  monthlyData={monthlyData}
                  classDistribution={processedData.classeTaxonomica || []}
                  regionDistribution={processedData.regiaoAdministrativa || []}
                  speciesRanking={(processedData.especiesMaisResgatadas || []).map(s => ({ name: s.name, value: s.quantidade }))}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3 mb-6">
          <MetricCard
            icon={<Bird className="h-5 w-5" />}
            label="Resgates"
            value={metrics.totalResgates}
            color="green"
          />
          <MetricCard
            icon={<PawPrint className="h-5 w-5" />}
            label="Animais"
            value={metrics.totalAnimais}
            color="blue"
          />
          <MetricCard
            icon={<TreePine className="h-5 w-5" />}
            label="Solturas"
            value={metrics.solturas}
            color="emerald"
          />
          <MetricCard
            icon={<Skull className="h-5 w-5" />}
            label="Óbitos"
            value={metrics.obitos}
            color="red"
          />
          <MetricCard
            icon={<Car className="h-5 w-5" />}
            label="Atropelamentos"
            value={metrics.atropelamentos}
            color="orange"
          />
          <MetricCard
            icon={<HeartPulse className="h-5 w-5" />}
            label="Feridos"
            value={metrics.feridos}
            color="yellow"
          />
          <MetricCard
            icon={<Home className="h-5 w-5" />}
            label="Filhotes"
            value={metrics.filhotes}
            color="purple"
          />
          {(
            selectedYear === null ||
            selectedYear >= 2026
          ) && (
            <>
              <MetricCard
                icon={<AlertTriangle className="h-5 w-5" />}
                label="C. Ambientais"
                value={metrics.crimesAmbientais}
                color="blue"
              />
              <MetricCard
                icon={<Shield className="h-5 w-5" />}
                label="C. Comuns"
                value={metrics.crimesComuns}
                color="blue"
              />
              <MetricCard
                icon={<TreePine className="h-5 w-5" />}
                label="Prevenção"
                value={metrics.prevencao}
                color="emerald"
              />
            </>
          )}
        </div>

        {/* Historical Notice */}
        {isHistorico && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <p className="text-sm text-amber-800">
                <strong>Dados Históricos:</strong> Os dados exibidos para {selectedYear} são baseados nos registros consolidados oficiais. 
                Gráficos detalhados de espécies e regiões estão disponíveis apenas para 2026 em diante.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="especies" className="space-y-6">
          <TabsList className="bg-[#071d49]/10 border border-[#071d49]/20 flex-wrap">
            <TabsTrigger value="especies" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Espécies</TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
              <Trophy className="h-4 w-4 mr-1" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="atropelamentos" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
              <Car className="h-4 w-4 mr-1" />
              Atropelamentos
            </TabsTrigger>
            <TabsTrigger value="destinacao" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Destinação</TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Classes</TabsTrigger>
            <TabsTrigger value="temporal" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Temporal</TabsTrigger>
            <TabsTrigger value="sazonal" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-1" />
              Sazonal
            </TabsTrigger>
            <TabsTrigger value="alertas" className="data-[state=active]:bg-[#ff0000] data-[state=active]:text-white">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="regioes" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Regiões</TabsTrigger>
            <TabsTrigger value="comparativo" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-1" />
              Comparativo
            </TabsTrigger>
            <TabsTrigger value="mapa" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">
              <MapIcon className="h-4 w-4 mr-1" />
              Mapa
            </TabsTrigger>
          </TabsList>

          {/* Species Tab */}
          <TabsContent value="especies">
            {isHistorico ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Bird className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Dados detalhados de espécies disponíveis apenas para 2026 em diante.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <Bird className="h-5 w-5 text-[#ffcc00]" />
                      Espécies Mais Resgatadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={processedData.especiesMaisResgatadas.slice(0, 10)}
                        layout="vertical"
                        margin={{ left: 20, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#071d49" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <Car className="h-5 w-5 text-[#ff0000]" />
                      Espécies Mais Atropeladas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={processedData.especiesAtropeladas.slice(0, 10)}
                        layout="vertical"
                        margin={{ left: 20, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#f97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Ranking Interativo Tab */}
          <TabsContent value="ranking">
            <DashboardRankingEspecies 
              isPublico={true}
              anosDisponiveis={YEARS}
            />
          </TabsContent>

          {/* Destination Tab */}
          <TabsContent value="destinacao">
            {isHistorico ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Dados detalhados de destinação disponíveis apenas para 2026 em diante.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <MapPin className="h-5 w-5 text-[#ffcc00]" />
                      Distribuição por Destinação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={processedData.destinacaoTipos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {processedData.destinacaoTipos.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <Activity className="h-5 w-5 text-[#ffcc00]" />
                      Distribuição por Desfecho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={processedData.desfechoResgate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#071d49" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            {isHistorico ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <PawPrint className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Dados detalhados de classes disponíveis apenas para 2026 em diante.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <PawPrint className="h-5 w-5 text-[#ffcc00]" />
                      Distribuição por Classe Taxonômica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={processedData.classeTaxonomica}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {processedData.classeTaxonomica.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                      <HeartPulse className="h-5 w-5 text-[#ff0000]" />
                      Estado de Saúde dos Animais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={processedData.estadoSaude}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill="#ff0000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Temporal Tab */}
          <TabsContent value="temporal">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                  <TrendingUp className="h-5 w-5 text-[#ffcc00]" />
                  Evolução Mensal de Resgates {selectedYear ? `- ${selectedYear}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#071d49"
                      strokeWidth={3}
                      dot={{ fill: '#ffcc00', strokeWidth: 2, stroke: '#071d49' }}
                      activeDot={{ r: 8, fill: '#ffcc00' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sazonal Tab - Tendência Sazonal */}
          <TabsContent value="sazonal">
            <DashboardTendenciaSazonal isPublico={true} />
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regioes">
            {isHistorico ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Dados detalhados de regiões disponíveis apenas para 2026 em diante.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                    <MapPin className="h-5 w-5 text-[#ffcc00]" />
                    Resgates por Região Administrativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={processedData.regiaoAdministrativa.slice(0, 15)}
                      layout="vertical"
                      margin={{ left: 30, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#071d49" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparativo Tab */}
          <TabsContent value="comparativo">
            {dadosComparativos && dadosComparativos.length > 0 ? (
              <DashboardComparativoAnos 
                dadosHistoricos={dadosComparativos}
                anosDisponiveis={[2026, 2025, 2024, 2023, 2022, 2021, 2020]}
                isPublico={true}
              />
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Carregando dados comparativos...
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mapa de Calor Tab */}
          <TabsContent value="mapa">
            {(selectedYear === null || selectedYear >= 2026) ? (
              <DashboardMapaCalor 
                pontos={pontosMapaCalor || []}
                isPublico={true}
                ano={selectedYear ?? new Date().getFullYear()}
              />
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {isHistorico 
                      ? 'Mapa de calor disponível apenas para dados de 2026 em diante.'
                      : 'Selecione um ano a partir de 2026 para visualizar o mapa de calor.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Atropelamentos Tab */}
          <TabsContent value="atropelamentos">
            <DashboardAtropelamentos year={selectedYear || 2026} />
          </TabsContent>

          {/* Alertas Tab */}
          <TabsContent value="alertas">
            <DashboardAlertasPicos year={selectedYear || 2026} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[#071d49]/20 text-center">
          <p className="text-sm text-[#071d49]">
            © {new Date().getFullYear()} Batalhão de Polícia Militar Ambiental - Distrito Federal
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Dados atualizados em tempo real
          </p>
        </footer>
      </main>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'green' | 'blue' | 'emerald' | 'red' | 'orange' | 'yellow' | 'purple';
}

const MetricCard = ({ icon, label, value, color }: MetricCardProps) => {
  const colorClasses = {
    green: 'bg-[#071d49] text-[#ffcc00]',
    blue: 'bg-[#071d49] text-[#ffcc00]',
    emerald: 'bg-[#071d49] text-[#ffcc00]',
    red: 'bg-[#ff0000] text-white',
    orange: 'bg-[#ff0000] text-white',
    yellow: 'bg-[#ffcc00] text-[#071d49]',
    purple: 'bg-[#071d49] text-[#ffcc00]',
  };

  return (
    <Card className="glass-card hover:shadow-lg transition-shadow">
      <CardContent className="p-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-xl font-bold text-[#071d49]">{value.toLocaleString('pt-BR')}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardPublico;
