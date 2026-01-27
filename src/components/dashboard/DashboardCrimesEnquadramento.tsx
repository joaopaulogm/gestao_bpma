import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
const supabaseAny = supabase as any;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface DashboardCrimesEnquadramentoProps {
  tipoCrimeId: string;
  tipoCrimeNome: string;
  filters: any;
}

interface EnquadramentoData {
  id_enquadramento: string;
  Enquadramento: string;
  quantidade: number;
}

const DashboardCrimesEnquadramento: React.FC<DashboardCrimesEnquadramentoProps> = ({
  tipoCrimeId,
  tipoCrimeNome,
  filters
}) => {
  const [enquadramentos, setEnquadramentos] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<EnquadramentoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCrimes, setTotalCrimes] = useState(0);

  // Cores modernas inspiradas no Donezo (verde)
  const COLORS = [
    '#10b981', // Green 500
    '#059669', // Green 600
    '#047857', // Green 700
    '#065f46', // Green 800
    '#064e3b', // Green 900
    '#34d399', // Green 400
    '#6ee7b7', // Green 300
    '#a7f3d0', // Green 200
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar enquadramentos do tipo de crime
        const { data: enquadramentosData, error: enquadError } = await supabase
          .from('dim_enquadramento')
          .select('id_enquadramento, Enquadramento')
          .eq('id_tipo_de_crime', tipoCrimeId)
          .order('Enquadramento');

        if (enquadError) {
          console.error('Erro ao buscar enquadramentos:', enquadError);
        } else {
          setEnquadramentos(enquadramentosData || []);
        }

        // Buscar estatísticas de crimes por enquadramento
        let query = supabaseAny
          .from('fat_registros_de_crimes_ambientais')
          .select('enquadramento_id')
          .eq('tipo_crime_id', tipoCrimeId);

        // Aplicar filtro de ano se especificado
        if (filters.year) {
          const startDate = `${filters.year}-01-01`;
          const endDate = `${filters.year}-12-31`;
          query = query.gte('data', startDate).lte('data', endDate);
        }

        const { data: crimesData, error: crimesError } = await query;

        if (crimesError) {
          console.error('Erro ao buscar crimes:', crimesError);
        } else {
          // Agrupar por enquadramento
          const statsMap = new Map<string, EnquadramentoData>();
          
          (crimesData || []).forEach((crime: any) => {
            const enquadramentoId = crime.enquadramento_id;
            const enquadramentoNome = crime.dim_enquadramento?.Enquadramento || 'Não especificado';
            
            if (enquadramentoId) {
              if (!statsMap.has(enquadramentoId)) {
                statsMap.set(enquadramentoId, {
                  id_enquadramento: enquadramentoId,
                  Enquadramento: enquadramentoNome,
                  quantidade: 0
                });
              }
              const stat = statsMap.get(enquadramentoId)!;
              stat.quantidade += 1;
            }
          });

          const statsArray = Array.from(statsMap.values())
            .sort((a, b) => b.quantidade - a.quantidade);
          
          setEstatisticas(statsArray);
          setTotalCrimes(statsArray.reduce((sum, stat) => sum + stat.quantidade, 0));
        }
      } catch (err) {
        console.error('Exceção ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipoCrimeId, filters.year]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total de Crimes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalCrimes}</div>
            <p className="text-xs text-green-600 mt-1">{tipoCrimeNome}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Enquadramentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{enquadramentos.length}</div>
            <p className="text-xs text-green-600 mt-1">Tipos diferentes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Média por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {enquadramentos.length > 0 ? Math.round(totalCrimes / enquadramentos.length) : 0}
            </div>
            <p className="text-xs text-green-600 mt-1">Crimes por enquadramento</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras */}
      <Card className="shadow-lg border-green-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-700">
            Crimes por Enquadramento - {tipoCrimeNome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estatisticas.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={estatisticas} 
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="Enquadramento" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [value, 'Quantidade']}
                />
                <Legend />
                <Bar 
                  dataKey="quantidade" 
                  name="Quantidade de Crimes"
                  radius={[8, 8, 0, 0]}
                >
                  {estatisticas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Nenhum crime encontrado para este tipo
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Enquadramentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estatisticas.map((stat, index) => (
          <Card key={stat.id_enquadramento} className="hover:shadow-md transition-shadow border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 line-clamp-2">
                {stat.Enquadramento}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">{stat.quantidade}</span>
                <span className="text-sm text-muted-foreground">crimes</span>
              </div>
              <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(stat.quantidade / totalCrimes) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardCrimesEnquadramento;

