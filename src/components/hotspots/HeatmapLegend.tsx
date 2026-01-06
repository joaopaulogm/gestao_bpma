import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HeatmapLegendProps {
  dataCount?: number;
}

const HeatmapLegend = ({ dataCount = 0 }: HeatmapLegendProps) => {
  const densityLevels = [
    { color: 'rgba(178, 24, 43, 1.0)', label: 'Alta', value: '> 15' },
    { color: 'rgba(239, 138, 98, 1.0)', label: 'Média-Alta', value: '10-15' },
    { color: 'rgba(253, 219, 199, 0.9)', label: 'Média', value: '5-10' },
    { color: 'rgba(209, 229, 240, 0.8)', label: 'Baixa-Média', value: '2-5' },
    { color: 'rgba(103, 169, 207, 0.7)', label: 'Baixa', value: '1-2' },
    { color: 'rgba(33, 102, 172, 0.6)', label: 'Muito Baixa', value: '< 1' }
  ];

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
      <CardContent className="pt-0 space-y-4">
        {/* Legenda de Densidade */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground">Densidade (resgates/km²)</h4>
          <div className="space-y-1">
            {densityLevels.map((level, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded border border-border" 
                  style={{ backgroundColor: level.color }}
                ></div>
                <span className="text-xs text-muted-foreground">{level.value}</span>
                <span className="text-xs text-muted-foreground opacity-75">({level.label})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Região:</strong> Distrito Federal<br/>
            <strong>Visualização:</strong> Cores mais quentes (vermelho) indicam maior densidade de resgates.
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Navegação:</strong> Zoom para ver pontos individuais</p>
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