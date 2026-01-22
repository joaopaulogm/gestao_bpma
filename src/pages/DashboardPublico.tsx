import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  TreePine
} from 'lucide-react';
import logoBpma from '@/assets/logo-bpma.png';

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

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const DashboardPublico = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<string | null>(null);

  // Fetch data from Supabase
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['public-dashboard', selectedYear, selectedMonth, selectedClasse],
    queryFn: async () => {
      let query = supabase
        .from('fat_registros_de_resgate')
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

      // Apply year filter
      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('data', startDate).lte('data', endDate);
      }

      // Apply month filter
      if (selectedMonth && selectedYear) {
        const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
        query = query.gte('data', startDate).lte('data', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch historical data for complete statistics
  const { data: historicalData } = useQuery({
    queryKey: ['public-dashboard-historical', selectedYear, selectedClasse],
    queryFn: async () => {
      if (selectedYear && selectedYear >= 2025) return [];
      
      const { data, error } = await supabase
        .from('fat_resgates_diarios_2020a2024')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Process dashboard data
  const processedData = useMemo(() => {
    if (!rawData) return processDashboardData([]);
    
    // Filter by class if selected
    let filteredData = rawData;
    if (selectedClasse) {
      filteredData = rawData.filter((r: any) => 
        r.especie?.classe_taxonomica?.toLowerCase() === selectedClasse.toLowerCase()
      );
    }
    
    return processDashboardData(filteredData as any);
  }, [rawData, selectedClasse]);

  // Calculate metrics
  const metrics = useMemo(() => {
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

    return { totalResgates, totalAnimais, solturas, obitos, atropelamentos, filhotes, feridos };
  }, [rawData, selectedClasse]);

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
    if (!rawData) return [];
    const monthCounts: Record<string, number> = {};
    
    rawData.forEach((r: any) => {
      if (r.data) {
        const month = new Date(r.data).toLocaleString('pt-BR', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    return Object.entries(monthCounts).map(([name, value]) => ({ name, value }));
  }, [rawData]);

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedClasse(null);
  };

  const hasFilters = selectedYear || selectedMonth || selectedClasse;

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
            <Badge className="bg-[#ffcc00] text-[#071d49] border-0 font-semibold animate-scale-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: '0.2s' }}>
              <Activity className="h-3 w-3 mr-1" />
              Dados Públicos
            </Badge>
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
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <MetricCard
            icon={<Bird className="h-6 w-6" />}
            label="Total de Resgates"
            value={metrics.totalResgates}
            color="green"
          />
          <MetricCard
            icon={<PawPrint className="h-6 w-6" />}
            label="Total de Animais"
            value={metrics.totalAnimais}
            color="blue"
          />
          <MetricCard
            icon={<TreePine className="h-6 w-6" />}
            label="Solturas"
            value={metrics.solturas}
            color="emerald"
          />
          <MetricCard
            icon={<Skull className="h-6 w-6" />}
            label="Óbitos"
            value={metrics.obitos}
            color="red"
          />
          <MetricCard
            icon={<Car className="h-6 w-6" />}
            label="Atropelamentos"
            value={metrics.atropelamentos}
            color="orange"
          />
          <MetricCard
            icon={<HeartPulse className="h-6 w-6" />}
            label="Feridos"
            value={metrics.feridos}
            color="yellow"
          />
          <MetricCard
            icon={<Home className="h-6 w-6" />}
            label="Filhotes"
            value={metrics.filhotes}
            color="purple"
          />
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="especies" className="space-y-6">
          <TabsList className="bg-[#071d49]/10 border border-[#071d49]/20">
            <TabsTrigger value="especies" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Espécies</TabsTrigger>
            <TabsTrigger value="destinacao" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Destinação</TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Classes</TabsTrigger>
            <TabsTrigger value="temporal" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Temporal</TabsTrigger>
            <TabsTrigger value="regioes" className="data-[state=active]:bg-[#071d49] data-[state=active]:text-white">Regiões</TabsTrigger>
          </TabsList>

          {/* Species Tab */}
          <TabsContent value="especies">
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
          </TabsContent>

          {/* Destination Tab */}
          <TabsContent value="destinacao">
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
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
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
          </TabsContent>

          {/* Temporal Tab */}
          <TabsContent value="temporal">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#071d49]">
                  <TrendingUp className="h-5 w-5 text-[#ffcc00]" />
                  Evolução Mensal de Resgates
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

          {/* Regions Tab */}
          <TabsContent value="regioes">
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
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-[#071d49]">{value.toLocaleString('pt-BR')}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardPublico;
