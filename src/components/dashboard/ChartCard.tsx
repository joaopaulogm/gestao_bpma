
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-fauna-blue">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
