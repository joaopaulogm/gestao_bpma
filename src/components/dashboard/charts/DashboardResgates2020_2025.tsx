import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { DashboardData } from '@/types/hotspots';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardResgates2020_2025Props {
  data: DashboardData;
  year: number;
}

// Paleta de cores verde
const COLORS = [
  '#10b981', '#059669', '#047857', '#065f46', '#34d399', '#6ee7b7'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
        <p className="font-semibold text-sm mb-2 text-green-700">{payload[0].name}</p>
        <p className="text-sm text-green-600">
          <span className="font-medium">Quantidade:</span>{' '}
          <span className="font-bold text-green-700">{payload[0].value?.toLocaleString('pt-BR') || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DashboardResgates2020_2025: React.FC<DashboardResgates2020_2025Props> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  // Para dados históricos, precisamos acessar os dados brutos antes da normalização
  // Se os dados vierem normalizados, tentar extrair informações dos campos disponíveis

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    // Verificar se os dados vêm de tabelas históricas
    // Pode ter quantidade_resgates diretamente ou tipo_registro === 'historico'
    const isHistoricalData = registros.length > 0 && (
      'quantidade_resgates' in (registros[0] as any) ||
      (registros[0] as any).tipo_registro === 'historico' ||
      (registros[0] as any).data_ocorrencia !== undefined
    );
    
    let totalResgates = 0;
    let solturas = 0;
    let filhotes = 0;
    let obitos = 0;
    let atropelamentos = 0;
    
    if (isHistoricalData) {
      // Dados das tabelas históricas (fat_resgates_diarios_2020-2025)
      // CONTAGEM DE REGISTROS (cada linha é um registro)
      totalResgates = registros.length;
      
      // Contar registros com solturas
      solturas = registros.filter((r: any) => {
        const qtdSolturas = Number(r.quantidade_solturas) || 0;
        return qtdSolturas > 0;
      }).length;
      
      // Contar registros com filhotes
      filhotes = registros.filter((r: any) => {
        const qtdFilhotes = Number(r.quantidade_filhotes) || Number(r.quantidade_filhote) || 0;
        return qtdFilhotes > 0;
      }).length;
      
      // Contar registros com óbitos
      obitos = registros.filter((r: any) => {
        const qtdObitos = Number(r.quantidade_obitos) || 0;
        return qtdObitos > 0;
      }).length;
      
      // Para atropelamentos em dados históricos, geralmente não há campo específico
      atropelamentos = 0;
    } else {
      // Dados da tabela fat_registros_de_resgate
      // CONTAGEM DE REGISTROS (cada linha é um registro)
      totalResgates = registros.length;
      
      // Solturas (contagem de registros com soltura)
      solturas = registros.filter(r => 
        r.destinacao?.nome?.toLowerCase().includes('soltura') ||
        r.desfecho?.nome?.toLowerCase().includes('soltura') ||
        r.desfecho?.tipo === 'Soltura'
      ).length;
      
      // Filhotes (contagem de registros com filhotes)
      filhotes = registros.filter(r => {
        const qtdFilhote = Number(r.quantidade_filhote) || 0;
        return qtdFilhote > 0;
      }).length;
      
      // Óbitos (contagem de registros com óbito)
      obitos = registros.filter(r => 
        r.desfecho?.nome?.toLowerCase().includes('óbito') ||
        r.desfecho?.nome?.toLowerCase().includes('obito') ||
        r.estado_saude?.nome?.toLowerCase().includes('morto')
      ).length;
      
      // Atropelamentos (contagem de registros com atropelamento)
      atropelamentos = registros.filter(r => 
        r.atropelamento === 'Sim' || r.atropelamento === true || r.atropelamento === 'true'
      ).length;
    }
    
    // Maior quantidade em um dia
    const quantidadePorDia = new Map<string, number>();
    registros.forEach(r => {
      // Verificar ambos os campos de data (data normalizada ou data_ocorrencia original)
      const dataField = (r as any).data_ocorrencia || r.data;
      if (dataField) {
        const dataStr = typeof dataField === 'string' ? dataField.split('T')[0] : format(new Date(dataField), 'yyyy-MM-dd');
        let quantidade = 1;
        if (isHistoricalData) {
          quantidade = Number((r as any).quantidade_resgates) || 0;
        } else {
          quantidade = Number(r.quantidade) || Number(r.quantidade_total) || 1;
        }
        quantidadePorDia.set(dataStr, (quantidadePorDia.get(dataStr) || 0) + quantidade);
      }
    });
    
    let maiorQuantidadeDia = { data: '', quantidade: 0 };
    quantidadePorDia.forEach((quantidade, data) => {
      if (quantidade > maiorQuantidadeDia.quantidade) {
        maiorQuantidadeDia = { data, quantidade };
      }
    });
    
    // Top 3 dias da semana
    const quantidadePorDiaSemana = new Map<string, number>();
    registros.forEach(r => {
      // Verificar ambos os campos de data (data normalizada ou data_ocorrencia original)
      const dataField = (r as any).data_ocorrencia || r.data;
      if (dataField) {
        const dataObj = typeof dataField === 'string' ? new Date(dataField) : new Date(dataField);
        const diaSemana = format(dataObj, 'EEEE', { locale: ptBR });
        let quantidade = 1;
        if (isHistoricalData) {
          quantidade = Number((r as any).quantidade_resgates) || 0;
        } else {
          quantidade = Number(r.quantidade) || Number(r.quantidade_total) || 1;
        }
        quantidadePorDiaSemana.set(diaSemana, (quantidadePorDiaSemana.get(diaSemana) || 0) + quantidade);
      }
    });
    
    const top3DiasSemana = Array.from(quantidadePorDiaSemana.entries())
      .map(([dia, quantidade]) => ({ dia, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 3);
    
    return {
      totalResgates,
      solturas,
      filhotes,
      obitos,
      atropelamentos,
      maiorQuantidadeDia,
      top3DiasSemana
    };
  }, [registros]);

  const graficoPrincipal = [
    { name: 'Resgates', valor: estatisticas.totalResgates },
    { name: 'Solturas', valor: estatisticas.solturas },
    { name: 'Filhotes', valor: estatisticas.filhotes },
    { name: 'Óbitos', valor: estatisticas.obitos },
    { name: 'Atropelamentos', valor: estatisticas.atropelamentos },
  ];

  return (
    <div className="space-y-6">
      {/* Gráfico Principal - Quantidades */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Estatísticas de Resgates - {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={graficoPrincipal}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="valor" name="Quantidade" radius={[12, 12, 0, 0]}>
                {graficoPrincipal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Maior Quantidade em um Dia */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Maior Quantidade de Resgates em um Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          {estatisticas.maiorQuantidadeDia.quantidade > 0 ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {estatisticas.maiorQuantidadeDia.quantidade}
              </div>
              <p className="text-lg text-green-700 font-medium">
                {format(new Date(estatisticas.maiorQuantidadeDia.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Dias da Semana - Gráfico de Dispersão */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Top 3 Dias da Semana com Mais Resgates (Dispersão)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          {estatisticas.top3DiasSemana.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} />
                <XAxis 
                  type="number"
                  dataKey="x"
                  domain={[0.5, 3.5]}
                  tickCount={3}
                  tickFormatter={(value) => {
                    const entry = estatisticas.top3DiasSemana[Math.round(value) - 1];
                    return entry ? entry.dia : '';
                  }}
                  tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Dia da Semana', position: 'insideBottom', offset: -10, style: { fill: '#6b7280', fontSize: 12 } }}
                />
                <YAxis 
                  type="number"
                  dataKey="y"
                  tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Quantidade de Resgates', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                          <p className="font-semibold text-sm mb-2 text-green-700">{data.dia}</p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Quantidade:</span>{' '}
                            <span className="font-bold text-green-700">{data.quantidade?.toLocaleString('pt-BR') || 0}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {estatisticas.top3DiasSemana.map((entry, index) => (
                  <Scatter 
                    key={`scatter-${index}`}
                    data={[{
                      x: index + 1,
                      y: entry.quantidade,
                      dia: entry.dia,
                      quantidade: entry.quantidade
                    }]}
                    fill={COLORS[index % COLORS.length]}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardResgates2020_2025;

