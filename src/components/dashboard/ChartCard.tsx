
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className 
}) => {
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
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
