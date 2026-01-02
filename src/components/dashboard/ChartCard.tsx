
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartDataItem } from '@/types/hotspots';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

// New enhanced color palette
const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Violet
];

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  data?: ChartDataItem[] | any[];
  type?: string;
  dataKey?: string;
  nameKey?: string;
  showLegend?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-xl ring-1 ring-border/50">
        <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-foreground/80 flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full inline-block" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.name}:</span>
            <span className="font-bold text-foreground">{item.value.toLocaleString('pt-BR')}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children,
  className = "",
  data,
  type,
  dataKey = "value",
  nameKey = "name",
  showLegend = true
}) => {
  const renderChart = () => {
    if (!data || !type) {
      return children;
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} vertical={false} />
            <XAxis 
              dataKey={nameKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '10px' }}
              />
            )}
            <Bar 
              dataKey={dataKey} 
              name="Quantidade" 
              fill="url(#colorGradient)" 
              radius={[8, 8, 0, 0]}
            >
              <LabelList 
                dataKey={dataKey} 
                position="top" 
                style={{ fontSize: '11px', fill: 'hsl(var(--foreground))', fontWeight: 500 }} 
                formatter={(value: number) => value.toLocaleString('pt-BR')}
              />
            </Bar>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="70%"
              innerRadius="40%"
              fill="#8884d8"
              dataKey={dataKey}
              paddingAngle={5}
            >
              {data.map((_entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            )}
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    return children;
  };

  return (
    <Card className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20 ${className}`}>
      <CardHeader className="pb-3 border-b border-border/50 bg-gradient-to-r from-background to-muted/30">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-6 bg-background/50">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
