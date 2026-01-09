import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileText, 
  AlertTriangle, 
  Gavel, 
  TreePine, 
  Fish, 
  Building, 
  Shield,
  Flame,
  Car,
  Droplets,
  Mountain,
  Scale,
  Users,
  Bug,
  Leaf
} from 'lucide-react';

export interface IndicadoresData {
  atendimentosRegistrados: number;
  tcoPMDF: number;
  tcoOutras: number;
  emApuracao: number;
  flagrantes: number;
  paai: number;
  apreensaoArma: number;
  crimesContraFauna: number;
  crimesContraFlora: number;
  outrosCrimesAmbientais: number;
  corteArvores: number;
  crimeAPP: number;
  crimeUC: number;
  crimeLicenciamento: number;
  crimeRecursosHidricos: number;
  crimeRecursosPesqueiros: number;
  crimeAdmAmbiental: number;
  parcelamentoIrregular: number;
}

interface DashboardOperacionalIndicadoresProps {
  data: IndicadoresData;
  year: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)', // green
  'hsl(221, 83%, 53%)', // blue
  'hsl(38, 92%, 50%)',  // amber
  'hsl(280, 65%, 60%)', // purple
  'hsl(0, 84%, 60%)',   // red
  'hsl(180, 70%, 45%)', // cyan
  'hsl(330, 70%, 50%)', // pink
  'hsl(60, 70%, 45%)',  // yellow
];

const DashboardOperacionalIndicadores: React.FC<DashboardOperacionalIndicadoresProps> = ({
  data,
  year
}) => {
  const formatNumber = (n: number) => n.toLocaleString('pt-BR');

  // KPIs principais
  const mainKPIs = [
    { title: 'Atendimentos Registrados', value: data.atendimentosRegistrados, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'TCOs PMDF', value: data.tcoPMDF, icon: Gavel, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Flagrantes', value: data.flagrantes, icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { title: 'Outros Crimes Ambientais', value: data.outrosCrimesAmbientais, icon: Shield, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { title: 'Crimes contra Fauna', value: data.crimesContraFauna, icon: Bug, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
    { title: 'Crimes contra Flora', value: data.crimesContraFlora, icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-600/10' },
    { title: 'P.A.A.I.', value: data.paai, icon: Scale, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Apreensão Armas', value: data.apreensaoArma, icon: Flame, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  ];

  // Dados para gráfico de barras - Crimes Ambientais detalhados
  const crimesData = [
    { nome: 'Fauna', valor: data.crimesContraFauna, fill: 'hsl(38, 92%, 50%)' },
    { nome: 'Flora', valor: data.crimesContraFlora, fill: 'hsl(142, 76%, 36%)' },
    { nome: 'Outros', valor: data.outrosCrimesAmbientais, fill: 'hsl(280, 65%, 60%)' },
    { nome: 'Parcelamento', valor: data.parcelamentoIrregular, fill: 'hsl(221, 83%, 53%)' },
    { nome: 'Licenciamento', valor: data.crimeLicenciamento, fill: 'hsl(0, 84%, 60%)' },
    { nome: 'UC', valor: data.crimeUC, fill: 'hsl(180, 70%, 45%)' },
    { nome: 'APP', valor: data.crimeAPP, fill: 'hsl(330, 70%, 50%)' },
    { nome: 'Hídricos', valor: data.crimeRecursosHidricos, fill: 'hsl(200, 70%, 50%)' },
    { nome: 'Pesqueiros', valor: data.crimeRecursosPesqueiros, fill: 'hsl(160, 70%, 50%)' },
    { nome: 'Corte Árvores', valor: data.corteArvores, fill: 'hsl(100, 70%, 40%)' },
    { nome: 'Adm Ambiental', valor: data.crimeAdmAmbiental, fill: 'hsl(40, 70%, 50%)' },
  ].filter(item => item.valor > 0).sort((a, b) => b.valor - a.valor);

  // Dados para gráfico de pizza - Distribuição TCOs
  const tcosData = [
    { name: 'TCOs PMDF', value: data.tcoPMDF },
    { name: 'TCOs Outras', value: data.tcoOutras },
    { name: 'Em Apuração', value: data.emApuracao },
    { name: 'Flagrantes', value: data.flagrantes },
  ].filter(item => item.value > 0);

  // KPIs secundários
  const secondaryKPIs = [
    { title: 'Parcelamento Irregular', value: data.parcelamentoIrregular, icon: Building },
    { title: 'Crime Licenciamento', value: data.crimeLicenciamento, icon: FileText },
    { title: 'Crime Áreas UC', value: data.crimeUC, icon: Mountain },
    { title: 'Crime APP', value: data.crimeAPP, icon: TreePine },
    { title: 'Recursos Hídricos', value: data.crimeRecursosHidricos, icon: Droplets },
    { title: 'Recursos Pesqueiros', value: data.crimeRecursosPesqueiros, icon: Fish },
    { title: 'Corte de Árvores', value: data.corteArvores, icon: TreePine },
    { title: 'TCOs Outras', value: data.tcoOutras, icon: Gavel },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Indicadores Operacionais - {year}</h3>
        <Badge variant="outline" className="text-xs">
          Total de atendimentos: {formatNumber(data.atendimentosRegistrados)}
        </Badge>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {mainKPIs.map((kpi, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center space-y-1">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <p className="text-xl font-bold">{formatNumber(kpi.value)}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                  {kpi.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Crimes Ambientais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Crimes Ambientais por Tipo - {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={crimesData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="nome" 
                    tick={{ fontSize: 10 }}
                    width={75}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatNumber(value), 'Ocorrências']}
                  />
                  <Bar 
                    dataKey="valor" 
                    name="Ocorrências"
                    radius={[0, 4, 4, 0]}
                  >
                    {crimesData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - Distribuição Procedimentos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição de Procedimentos - {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tcosData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  >
                    {tcosData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), 'Quantidade']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda */}
            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {tcosData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {item.name}: <span className="font-medium text-foreground">{formatNumber(item.value)}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs secundários */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalhamento de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {secondaryKPIs.map((kpi, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-2 rounded-lg bg-muted/50">
                <kpi.icon className="h-4 w-4 text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{formatNumber(kpi.value)}</p>
                <p className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                  {kpi.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOperacionalIndicadores;
