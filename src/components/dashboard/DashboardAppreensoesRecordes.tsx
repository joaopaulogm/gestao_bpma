
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Registro } from '@/types/hotspots';

interface ApreensaoRecord {
  data: string;
  numeroTCO: string;
  quantidade: number;
  label: string;
}

interface DashboardAppreensoesRecordesProps {
  registros: Registro[];
}

const DashboardAppreensoesRecordes: React.FC<DashboardAppreensoesRecordesProps> = ({ registros }) => {
  const apreensoesPorTCO = useMemo(() => {
    if (!registros || registros.length === 0) return [];

    // Filtrar apenas apreensões com números de TCO
    const apreensoes = registros.filter(reg => 
      reg.origem === 'Apreensão/Resgate' && 
      reg.desfecho_apreensao && 
      (reg.desfecho_apreensao.includes('TCO PMDF') || reg.desfecho_apreensao.includes('TCO PCDF')) &&
      reg.numero_tco
    );

    // Agrupar por data e número TCO
    const agrupados = apreensoes.reduce((acc: Record<string, ApreensaoRecord>, reg) => {
      const chave = `${reg.data}_${reg.numero_tco}`;
      
      if (!acc[chave]) {
        acc[chave] = {
          data: reg.data,
          numeroTCO: reg.numero_tco || '',
          quantidade: 0,
          label: ''
        };
      }
      
      // Adicionar quantidade (ou 1 se não especificado)
      acc[chave].quantidade += reg.quantidade || 1;
      
      return acc;
    }, {});

    // Converter para array e ordenar por quantidade (decrescente)
    return Object.values(agrupados)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10) // Pegar os 10 maiores
      .map(record => ({
        ...record,
        label: `${new Date(record.data).toLocaleDateString('pt-BR')} - TCO: ${record.numeroTCO}`
      }));
  }, [registros]);

  if (!apreensoesPorTCO.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recordes de Apreensões</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Não há dados de apreensões com TCO para exibir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recordes de Apreensões por TCO</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={apreensoesPorTCO}
            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="label" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="quantidade" 
              name="Quantidade de Animais" 
              fill="#9b87f5" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardAppreensoesRecordes;
