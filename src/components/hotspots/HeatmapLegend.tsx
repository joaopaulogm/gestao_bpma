import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeatmapLegendProps {
  dataCount?: number;
}

const HeatmapLegend = ({ dataCount = 0 }: HeatmapLegendProps) => {
  return (
    <Card className="h-full bg-background shadow-lg">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          Mapa de Calor - Resgates
          {dataCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dataCount}
            </Badge>
          )}
        </h3>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2" role="img" aria-label="Resgates representados em verde">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-sm"></div>
            <span className="text-sm font-medium">Resgates de Fauna</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Visualização:</strong> Áreas mais intensas (verdes) indicam maior concentração de resgates. 
            Clique nos pontos para ver detalhes.
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Navegação:</strong> Use zoom e arraste para explorar</p>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            Dados de todo o período registrado no sistema
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapLegend;