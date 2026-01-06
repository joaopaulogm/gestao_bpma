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
  Cell,
  PieChart,
  Pie,
  Legend
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
    // Verificar se os dados vêm de tabelas históricas ou agregados
    const isHistoricalData = registros.length > 0 && (
      'quantidade_resgates' in (registros[0] as any) ||
      (registros[0] as any).tipo_registro === 'historico' ||
      (registros[0] as any).data_ocorrencia !== undefined
    );
    
    const isAgregado = registros.length > 0 && (
      (registros[0] as any).tipo_registro === 'agregado' ||
      (registros[0] as any).natureza !== undefined
    );
    
    let totalResgates = 0;
    let solturas = 0;
    let filhotes = 0;
    let adultos = 0;
    let obitos = 0;
    let feridos = 0;
    let atropelamentos = 0;
    
    // Para gráfico de atropelamentos por espécie
    const atropelamentosPorEspecie = new Map<string, number>();
    
    // Para 2021-2024, buscar dados das novas tabelas BPMA
    if (year >= 2021 && year <= 2024) {
      // Separar dados agregados e dados por espécie
      const dadosAgregados = registros.filter((r: any) => r.tipo_registro === 'agregado');
      const dadosPorEspecie = registros.filter((r: any) => r.tipo_registro !== 'agregado' && r.tipo_registro !== 'resgate');
      
      // Se temos dados por espécie, usar eles (mais detalhados)
      if (dadosPorEspecie.length > 0) {
        dadosPorEspecie.forEach((r: any) => {
          const qtdResgates = Number(r.quantidade_resgates) || Number(r.quantidade) || Number(r.quantidade_total) || 0;
          const qtdSolturas = Number(r.quantidade_solturas) || Number(r.quantidade_soltura) || 0;
          const qtdFilhotes = Number(r.quantidade_filhotes) || Number(r.quantidade_filhote) || 0;
          const qtdObitos = Number(r.quantidade_obitos) || Number(r.quantidade_obito) || 0;
          const qtdFeridos = Number(r.quantidade_feridos) || Number(r.quantidade_ferido) || 0;
          
          totalResgates += qtdResgates;
          solturas += qtdSolturas > 0 ? qtdSolturas : Math.max(0, qtdResgates - qtdObitos - qtdFeridos);
          filhotes += qtdFilhotes;
          adultos += Math.max(0, qtdResgates - qtdFilhotes);
          obitos += qtdObitos > 0 ? qtdObitos : Math.max(0, qtdResgates - qtdFeridos - (qtdSolturas > 0 ? qtdSolturas : 0));
          feridos += qtdFeridos;
        });
      } else if (dadosAgregados.length > 0) {
        // Se só temos dados agregados, usar bpma_fato_mensal via query direta
        // Por enquanto, somar os dados agregados que temos
        dadosAgregados.forEach((r: any) => {
          if (r.natureza === 'Resgate de Fauna Silvestre') {
            totalResgates += Number(r.quantidade) || 0;
          }
        });
        // Para dados agregados, não temos detalhes de solturas, filhotes, etc. por registro
        // Seria necessário buscar de bpma_fato_mensal diretamente
      }
      atropelamentos = 0; // Dados de atropelamento não disponíveis nas novas tabelas agregadas
    } else if (isHistoricalData) {
      // Dados das tabelas históricas (2020 ou outros anos)
      // SOMAR AS QUANTIDADES (não contar registros)
      registros.forEach((r: any) => {
        const qtdResgates = Number(r.quantidade_resgates) || 0;
        const qtdSolturas = Number(r.quantidade_solturas) || 0;
        const qtdFilhotes = Number(r.quantidade_filhotes) || Number(r.quantidade_filhote) || 0;
        const qtdObitos = Number(r.quantidade_obitos) || 0;
        const qtdFeridos = Number(r.quantidade_feridos) || 0;
        
        // Total de resgates = soma de quantidade_resgates
        totalResgates += qtdResgates;
        
        // Solturas: usar quantidade_solturas diretamente
        // Se não existir, calcular: quantidade_resgates - quantidade_obitos - quantidade_feridos
        if (qtdSolturas > 0) {
          solturas += qtdSolturas;
        } else {
          // Fórmula: Do total de resgates - obitos - feridos = soltura
          const solturasCalculadas = Math.max(0, qtdResgates - qtdObitos - qtdFeridos);
          solturas += solturasCalculadas;
        }
        
        // Filhotes = soma de quantidade_filhotes
        filhotes += qtdFilhotes;
        
        // Adultos = quantidade_resgates - quantidade_filhotes
        adultos += Math.max(0, qtdResgates - qtdFilhotes);
        
        // Óbitos: usar quantidade_obitos diretamente
        // Se não existir, calcular: quantidade_resgates - quantidade_feridos - quantidade_solturas
        if (qtdObitos > 0) {
          obitos += qtdObitos;
        } else {
          // Fórmula: Do total de resgates - feridos - soltura = óbitos
          const solturasParaCalculo = qtdSolturas > 0 ? qtdSolturas : Math.max(0, qtdResgates - qtdObitos - qtdFeridos);
          const obitosCalculados = Math.max(0, qtdResgates - qtdFeridos - solturasParaCalculo);
          obitos += obitosCalculados;
        }
        
        // Feridos = soma de quantidade_feridos
        feridos += qtdFeridos;
      });
      
      // Atropelamentos não disponível em dados históricos
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
      
      // Filhotes (soma de quantidade_filhote)
      registros.forEach(r => {
        const qtdFilhote = Number(r.quantidade_filhote) || 0;
        filhotes += qtdFilhote;
      });
      
      // Adultos (soma de quantidade - quantidade_filhote)
      registros.forEach(r => {
        const qtdTotal = Number(r.quantidade) || Number(r.quantidade_total) || 0;
        const qtdFilhote = Number(r.quantidade_filhote) || 0;
        adultos += Math.max(0, qtdTotal - qtdFilhote);
      });
      
      // Óbitos (contagem de registros com óbito)
      obitos = registros.filter(r => 
        r.desfecho?.nome?.toLowerCase().includes('óbito') ||
        r.desfecho?.nome?.toLowerCase().includes('obito') ||
        r.estado_saude?.nome?.toLowerCase().includes('morto')
      ).length;
      
      // Atropelamentos (soma de quantidades de registros com atropelamento)
      registros.forEach(r => {
        if (r.atropelamento === 'Sim' || r.atropelamento === true || r.atropelamento === 'true') {
          const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || 1;
          atropelamentos += quantidade;
        }
      });
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
    
    // Calcular atropelamentos por espécie (apenas para dados não históricos)
    if (!isHistoricalData) {
      registros.forEach(r => {
        if (r.atropelamento === 'Sim' || r.atropelamento === true || r.atropelamento === 'true') {
          const especieNome = r.especie?.nome_popular || r.especie?.nome_cientifico || 'Espécie não identificada';
          const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || 1;
          atropelamentosPorEspecie.set(especieNome, (atropelamentosPorEspecie.get(especieNome) || 0) + quantidade);
        }
      });
    }
    
    const atropelamentosPorEspecieArray = Array.from(atropelamentosPorEspecie.entries())
      .map(([nome, quantidade]) => ({ name: nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10); // Top 10
    
    return {
      totalResgates,
      solturas,
      filhotes,
      adultos,
      obitos,
      feridos,
      atropelamentos,
      maiorQuantidadeDia,
      top3DiasSemana,
      atropelamentosPorEspecie: atropelamentosPorEspecieArray
    };
  }, [registros]);

  const graficoPrincipal = [
    { name: 'Resgates', valor: estatisticas.totalResgates },
    { name: 'Solturas', valor: estatisticas.solturas },
    { name: 'Filhotes', valor: estatisticas.filhotes },
    { name: 'Óbitos', valor: estatisticas.obitos },
    { name: 'Feridos', valor: estatisticas.feridos },
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

      {/* N° de Atropelamentos */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            N° de Atropelamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {estatisticas.atropelamentos.toLocaleString('pt-BR')}
            </div>
            <p className="text-lg text-green-700 font-medium">
              Total de animais atropelados em {year}
            </p>
            {estatisticas.atropelamentos === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Dados de atropelamento não disponíveis para anos históricos (2020-2025)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estágio da Vida (Adulto x Filhotes) */}
      <Card className="glass-card border-green-100 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Estágio de Vida
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
          {estatisticas.totalResgates > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Adultos', value: estatisticas.adultos },
                    { name: 'Filhotes', value: estatisticas.filhotes }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        {`${(percent * 100).toFixed(1)}%`}
                      </text>
                    );
                  }}
                  outerRadius="80%"
                  innerRadius="55%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" stroke="#fff" />
                  <Cell fill="#34d399" stroke="#fff" />
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl">
                          <p className="font-semibold text-sm mb-2 text-green-700">{data.name}</p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Quantidade:</span>{' '}
                            <span className="font-bold text-green-700">{data.value?.toLocaleString('pt-BR') || 0}</span>
                          </p>
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Percentual:</span>{' '}
                            <span className="font-bold text-green-700">
                              {((Number(data.value) / (estatisticas.adultos + estatisticas.filhotes)) * 100).toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          )}
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

      {/* Animais Atropelados por Espécie - Apenas para 2026+ */}
      {estatisticas.atropelamentosPorEspecie && estatisticas.atropelamentosPorEspecie.length > 0 && (
        <Card className="glass-card border-green-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
            <CardTitle className="text-lg font-semibold text-green-700">
              Animais Atropelados por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={estatisticas.atropelamentosPorEspecie}
                margin={{ top: 20, right: 30, left: 140, bottom: 20 }}
                barSize={32}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.2} horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: '#374151', fontWeight: 500 }}
                  width={160}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" name="Quantidade" radius={[0, 12, 12, 0]}>
                  {estatisticas.atropelamentosPorEspecie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardResgates2020_2025;

