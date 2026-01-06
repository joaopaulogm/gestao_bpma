import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardData } from '@/types/hotspots';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart, Bar, CartesianGrid } from 'recharts';

interface HeatmapDiaSemanaMesChartProps {
  data: DashboardData;
  year: number;
}

const HeatmapDiaSemanaMesChart: React.FC<HeatmapDiaSemanaMesChartProps> = ({ data, year }) => {
  const registros = data.rawData || [];
  
  const heatmapData = useMemo(() => {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Criar matriz de dados
    const matriz = new Map<string, number>();
    
    registros.forEach((r: any) => {
      const dataRegistro = r.data || r.data_ocorrencia;
      if (!dataRegistro) return;
      
      const dataObj = typeof dataRegistro === 'string' ? new Date(dataRegistro) : new Date(dataRegistro);
      const anoRegistro = dataObj.getFullYear();
      const mes = dataObj.getMonth(); // 0-11
      const diaSemana = dataObj.getDay(); // 0-6 (0 = domingo)
      
      if (anoRegistro !== year) return;
      
      const quantidade = Number(r.quantidade) || Number(r.quantidade_total) || Number(r.quantidade_resgates) || 0;
      const key = `${diaSemana}-${mes}`;
      matriz.set(key, (matriz.get(key) || 0) + quantidade);
    });
    
    // Encontrar máximo para normalizar cores
    const maxValue = Math.max(...Array.from(matriz.values()), 1);
    
    // Criar dados para o gráfico
    const dados = diasSemana.map((dia, diaIndex) => {
      const linha: any = { dia };
      meses.forEach((mes, mesIndex) => {
        const key = `${diaIndex}-${mesIndex}`;
        const valor = matriz.get(key) || 0;
        linha[mes] = valor;
        linha[`${mes}_intensidade`] = (valor / maxValue) * 100;
      });
      return linha;
    });
    
    return { dados, maxValue };
  }, [registros, year]);
  
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Função para obter cor baseada na intensidade
  const getColor = (intensidade: number) => {
    if (intensidade === 0) return '#f3f4f6';
    if (intensidade < 25) return '#d1fae5';
    if (intensidade < 50) return '#6ee7b7';
    if (intensidade < 75) return '#34d399';
    return '#10b981';
  };
  
  return (
    <Card className="glass-card border-green-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Heatmap: Dia da Semana x Mês - {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-sm font-medium text-foreground border border-border bg-muted">Dia/Mês</th>
                {meses.map(mes => (
                  <th key={mes} className="p-2 text-sm font-medium text-foreground border border-border bg-muted">
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.dados.map((linha, index) => (
                <tr key={index}>
                  <td className="p-2 text-sm font-medium text-foreground border border-border bg-muted">
                    {linha.dia}
                  </td>
                  {meses.map(mes => {
                    const valor = linha[mes] || 0;
                    const intensidade = linha[`${mes}_intensidade`] || 0;
                    return (
                      <td
                        key={mes}
                        className="p-2 text-center border border-border"
                        style={{ backgroundColor: getColor(intensidade) }}
                        title={`${linha.dia} - ${mes}: ${valor} resgates`}
                      >
                        <span className={`text-sm font-medium ${
                          intensidade > 50 ? 'text-white' : 'text-foreground'
                        }`}>
                          {valor > 0 ? valor : '-'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
            <span>0</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d1fae5' }}></div>
            <span>Baixo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6ee7b7' }}></div>
            <span>Médio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#34d399' }}></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
            <span>Muito Alto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapDiaSemanaMesChart;

