
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './ChartUtils';

interface SpeciesChartProps {
  data: { name: string; quantidade: number }[];
}

// Paleta de cores verde moderna
const COLORS = [
  '#10b981', // Green 500
  '#059669', // Green 600
  '#047857', // Green 700
  '#065f46', // Green 800
  '#34d399', // Green 400
  '#6ee7b7', // Green 300
  '#a7f3d0', // Green 200
  '#d1fae5', // Green 100
];

const RescuedSpeciesChart: React.FC<SpeciesChartProps> = ({ data }) => {
  // Validar e limitar dados
  const validData = Array.isArray(data) && data.length > 0 
    ? data.slice(0, 10).filter(item => item && item.name && typeof item.quantidade === 'number')
    : [];
  
  if (validData.length === 0) {
    return (
      <Card className="glass-card border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
          <CardTitle className="text-lg font-semibold text-green-700">
            Espécies Mais Resgatadas
          </CardTitle>
          <p className="text-sm text-green-600 mt-1 font-medium">Top 10 espécies em número de resgates</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[450px] text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-card border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm border-b border-green-100">
        <CardTitle className="text-lg font-semibold text-green-700">
          Espécies Mais Resgatadas
        </CardTitle>
        <p className="text-sm text-green-600 mt-1 font-medium">Top 10 espécies em número de resgates</p>
      </CardHeader>
      <CardContent className="p-6 bg-white/50 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart 
            data={validData} 
            margin={{ top: 20, right: 40, left: 160, bottom: 20 }}
            barSize={32}
            layout="vertical"
          >
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
              </linearGradient>
            </defs>
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
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
            />
            <Bar 
              dataKey="quantidade" 
              name="Quantidade" 
              fill="url(#greenGradient)" 
              radius={[0, 12, 12, 0]}
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList 
                dataKey="quantidade" 
                position="right" 
                style={{ fontSize: '13px', fontWeight: 600, fill: '#059669' }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RescuedSpeciesChart;
