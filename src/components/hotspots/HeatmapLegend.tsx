import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const HeatmapLegend = () => {
  return (
    <Card className="fixed bottom-4 right-4 z-10 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Legenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Resgates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Apreensões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Solturas</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Áreas mais claras indicam maior intensidade de ocorrências.
        </p>
      </CardContent>
    </Card>
  );
};

export default HeatmapLegend;