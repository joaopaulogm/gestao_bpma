
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
      <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium" style={{ color: payload[0].color }}>
            {payload[0].name}: 
          </span>{' '}
          {payload[0].value}
        </p>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey={nameKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
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
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            >
              <LabelList dataKey={dataKey} position="top" style={{ fontSize: '11px' }} />
            </Bar>
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
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
