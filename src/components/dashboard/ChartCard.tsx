
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartDataItem } from '@/types/hotspots';

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

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children,
  className = "",
  data,
  type,
  dataKey,
  nameKey,
  showLegend
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="h-[300px]">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
