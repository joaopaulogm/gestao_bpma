import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Layers, TreePine, Mountain, Droplets, Shield, Leaf, MapPin, Trees, AlertTriangle, Map, Waves, Layers2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KmlLayer {
  id: string;
  name: string;
  file: string;
  color: string;
  icon: React.ElementType;
  category: 'federal' | 'distrital' | 'ambiental' | 'hidrico' | 'risco' | 'solo';
  visible: boolean;
}

export const KML_LAYERS: KmlLayer[] = [
  // Unidades Federais
  {
    id: 'parque_nacional',
    name: 'Parque Nacional de Brasília',
    file: '/data/kml/Parque_Nacional_de_Brasilia.kml',
    color: '#22c55e',
    icon: Mountain,
    category: 'federal',
    visible: false,
  },
  {
    id: 'reserva_biosfera',
    name: 'Reserva da Biosfera do Cerrado',
    file: '/data/kml/Reserva_da_Biosfera_do_Cerrado_RESBIO.kml',
    color: '#14b8a6',
    icon: Leaf,
    category: 'federal',
    visible: false,
  },
  // Unidades Distritais
  {
    id: 'estacoes_ecologicas',
    name: 'Estações Ecológicas do DF',
    file: '/data/kml/Estacoes_Ecologicas_do_Distrito_Federal.kml',
    color: '#10b981',
    icon: TreePine,
    category: 'distrital',
    visible: false,
  },
  {
    id: 'reservas_biologicas',
    name: 'Reservas Biológicas do DF',
    file: '/data/kml/Reservas_Biologicas_do_Distrito_Federal.kml',
    color: '#059669',
    icon: Trees,
    category: 'distrital',
    visible: false,
  },
  {
    id: 'parques_df',
    name: 'Parques do Distrito Federal',
    file: '/data/kml/Parques_do_Distrito_Federal.kml',
    color: '#84cc16',
    icon: TreePine,
    category: 'distrital',
    visible: false,
  },
  {
    id: 'parques_brasilia',
    name: 'Parques de Brasília',
    file: '/data/kml/Parques_de_Brasilia.kml',
    color: '#65a30d',
    icon: MapPin,
    category: 'distrital',
    visible: false,
  },
  {
    id: 'arie_df',
    name: 'ARIE do Distrito Federal',
    file: '/data/kml/ARIE_Distrito_Federal.kml',
    color: '#16a34a',
    icon: Shield,
    category: 'distrital',
    visible: false,
  },
  // Áreas Ambientais
  {
    id: 'rppn',
    name: 'RPPNs do DF',
    file: '/data/kml/RPPN_Distrito_Federal.kml',
    color: '#a855f7',
    icon: Shield,
    category: 'ambiental',
    visible: false,
  },
  // Recursos Hídricos
  {
    id: 'corpos_dagua',
    name: "Corpos d'água do DF",
    file: '/data/kml/Corpos_dagua_do_Distrito_Federal.kml',
    color: '#3b82f6',
    icon: Droplets,
    category: 'hidrico',
    visible: false,
  },
  {
    id: 'drenagem',
    name: 'Drenagem do DF',
    file: '/data/kml/Drenagem_do_Distrito_Federal.kml',
    color: '#0ea5e9',
    icon: Waves,
    category: 'hidrico',
    visible: false,
  },
  {
    id: 'bacias_hidrograficas',
    name: 'Bacias Hidrográficas do DF',
    file: '/data/kml/Bacias_Hidrograficas_DF.kml',
    color: '#0284c7',
    icon: Map,
    category: 'hidrico',
    visible: false,
  },
  // Riscos Ambientais
  {
    id: 'risco_cerrado',
    name: 'Risco Perda Cerrado Nativo',
    file: '/data/kml/Risco_Perda_Cerrado_Nativo.kml',
    color: '#ef4444',
    icon: AlertTriangle,
    category: 'risco',
    visible: false,
  },
  {
    id: 'risco_aquifero',
    name: 'Risco Recarga Aquífero',
    file: '/data/kml/Risco_Recarga_Aquifero.kml',
    color: '#f97316',
    icon: AlertTriangle,
    category: 'risco',
    visible: false,
  },
  {
    id: 'risco_erosao',
    name: 'Risco Erosão do Solo',
    file: '/data/kml/Risco_Erosao_Solo.kml',
    color: '#eab308',
    icon: AlertTriangle,
    category: 'risco',
    visible: false,
  },
  // Solo
  {
    id: 'classes_solos',
    name: 'Classes de Solos do DF',
    file: '/data/kml/Classes_Solos_DF.kml',
    color: '#a16207',
    icon: Layers2,
    category: 'solo',
    visible: false,
  },
];

const categoryLabels = {
  federal: 'Unidades Federais',
  distrital: 'Unidades Distritais',
  ambiental: 'Áreas Ambientais',
  hidrico: 'Recursos Hídricos',
  risco: 'Riscos Ambientais',
  solo: 'Solo e Geologia',
};

const categoryColors = {
  federal: 'bg-green-500',
  distrital: 'bg-lime-500',
  ambiental: 'bg-purple-500',
  hidrico: 'bg-blue-500',
  risco: 'bg-red-500',
  solo: 'bg-amber-600',
};

interface KmlLayerControlsProps {
  layers: KmlLayer[];
  onToggleLayer: (layerId: string) => void;
  loadingLayers: string[];
}

const KmlLayerControls: React.FC<KmlLayerControlsProps> = ({ 
  layers, 
  onToggleLayer,
  loadingLayers 
}) => {
  const groupedLayers = layers.reduce((acc, layer) => {
    if (!acc[layer.category]) {
      acc[layer.category] = [];
    }
    acc[layer.category].push(layer);
    return acc;
  }, {} as Record<string, KmlLayer[]>);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Camadas do Mapa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[350px] overflow-y-auto">
        {Object.entries(groupedLayers).map(([category, categoryLayers]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", categoryColors[category as keyof typeof categoryColors])} />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </span>
            </div>
            
            <div className="space-y-1 pl-4">
              {categoryLayers.map((layer) => {
                const Icon = layer.icon;
                const isLoading = loadingLayers.includes(layer.id);
                
                return (
                  <div
                    key={layer.id}
                    className={cn(
                      "flex items-center justify-between p-1.5 rounded-lg transition-colors",
                      layer.visible ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div 
                        className="p-1 rounded"
                        style={{ backgroundColor: `${layer.color}20` }}
                      >
                        <Icon 
                          className="h-3 w-3" 
                          style={{ color: layer.color }}
                        />
                      </div>
                      <Label 
                        htmlFor={layer.id} 
                        className="text-[11px] cursor-pointer truncate flex-1"
                      >
                        {layer.name}
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isLoading && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          ...
                        </Badge>
                      )}
                      <Switch
                        id={layer.id}
                        checked={layer.visible}
                        onCheckedChange={() => onToggleLayer(layer.id)}
                        disabled={isLoading}
                        className="scale-[0.65]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
          Ative camadas para visualizar no mapa
        </p>
      </CardContent>
    </Card>
  );
};

export default KmlLayerControls;
