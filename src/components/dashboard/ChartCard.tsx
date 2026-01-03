
import React, { ReactNode } from 'react';
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

// Chart colors following site identity - navy, yellow accent, complementary
const CHART_COLORS = [
  'hsl(220, 83%, 16%)',    // Navy blue (primary)
  'hsl(48, 100%, 50%)',    // Yellow (accent)
  'hsl(142, 76%, 36%)',    // Green (success)
  'hsl(220, 60%, 35%)',    // Medium blue
  'hsl(48, 90%, 60%)',     // Light yellow
  'hsl(142, 60%, 50%)',    // Light green
  'hsl(220, 40%, 50%)',    // Slate blue
  'hsl(25, 90%, 55%)',     // Orange
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
      <div className="bg-white/95 backdrop-blur-md p-4 border border-green-200 rounded-lg shadow-xl ring-1 ring-green-100">
        <p className="font-semibold text-sm mb-2 text-green-700">{label || payload[0]?.name}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-green-600 flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full inline-block" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.name}:</span>
            <span className="font-bold text-green-700">{item.value?.toLocaleString('pt-BR') || 0}</span>
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

  if (percent < 0.05) return null; // Hide labels for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={11}
      fontWeight="600"
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
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey={nameKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={40}
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
              radius={[6, 6, 0, 0]}
            >
              {data.map((_entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                />
              ))}
              <LabelList 
                dataKey={dataKey} 
                position="top" 
                style={{ fontSize: '10px', fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
                formatter={(value: number) => value.toLocaleString('pt-BR')}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius="75%"
              innerRadius="45%"
              fill="#8884d8"
              dataKey={dataKey}
              paddingAngle={3}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((_entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    return children;
  };

  return (
    <div className={`glass-card border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-green-100 bg-gradient-to-r from-green-50/80 to-white/80 backdrop-blur-sm">
        <h3 className="text-base font-semibold text-green-700">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-green-600 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>
      <div className="p-4 bg-white/50 backdrop-blur-sm">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartCard;
