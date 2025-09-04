import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeatmapLegendProps {
  filteredDataCount?: number;
  totalDataCount?: number;
}

const HeatmapLegend = ({ filteredDataCount = 0, totalDataCount = 0 }: HeatmapLegendProps) => {
  return (
    <Card className="fixed bottom-4 right-4 z-10 bg-background/95 backdrop-blur-sm shadow-lg max-w-xs">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          Legenda do Mapa
          {totalDataCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filteredDataCount}/{totalDataCount}
            </Badge>
          )}
        </h3>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2" role="img" aria-label="Resgates representados em verde">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-sm"></div>
            <span className="text-sm font-medium">Resgates</span>
          </div>
          <div className="flex items-center gap-2" role="img" aria-label="Apreensões representadas em azul">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span className="text-sm font-medium">Apreensões</span>
          </div>
          <div className="flex items-center gap-2" role="img" aria-label="Solturas representadas em vermelho">
            <div className="w-4 h-4 rounded-full bg-red-500 border border-white shadow-sm"></div>
            <span className="text-sm font-medium">Solturas</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Visualização:</strong> Áreas mais intensas indicam maior concentração de ocorrências. 
            Clique nos pontos para ver detalhes.
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Zoom:</strong> Aproxime para ver pontos individuais</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapLegend;