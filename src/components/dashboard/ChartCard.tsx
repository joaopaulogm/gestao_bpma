
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { ChartDataItem } from '@/types/hotspots';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data?: ChartDataItem[] | any[];
  type?: 'bar' | 'pie' | 'line';
  dataKey?: string;
  nameKey?: string;
  showLegend?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#e67e22', '#c0392b'];

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  data = [],
  type = 'bar',
  dataKey = 'value',
  nameKey = 'name',
  showLegend = true,
  children, 
  className 
}) => {
  const renderChart = () => {
    if (children) {
      return children;
    }

    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={nameKey} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            <Bar 
              dataKey={dataKey} 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={dataKey}
              nameKey={nameKey}
              label={(entry) => entry[nameKey]}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={{ r: 3 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Card 
      className={`col-span-1 overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 ${className || ''}`}
    >
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-3">
        <CardTitle className="text-lg font-medium text-slate-800">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-80">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
