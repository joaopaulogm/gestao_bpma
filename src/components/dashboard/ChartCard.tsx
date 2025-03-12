
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card className="col-span-1 overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-3">
        <CardTitle className="text-lg font-medium text-slate-800 flex items-center">
          {title}
        </CardTitle>
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
