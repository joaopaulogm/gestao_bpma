import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TreePine, Mountain, Leaf, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Coordenadas {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface AreaStatus {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  dentro: boolean;
  description: string;
}

interface AreaVerificationGridProps {
  coordenadas: Coordenadas | null;
  visibleLayersCount: number;
}

const AREA_STATUSES: AreaStatus[] = [
  {
    id: 'app',
    label: 'Área de Preservação Permanente',
    shortLabel: 'APP',
    icon: TreePine,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    dentro: false,
    description: 'Mata ciliar, nascentes',
  },
  {
    id: 'uc_federal',
    label: 'Unidade de Conservação Federal',
    shortLabel: 'UC Federal',
    icon: Mountain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    dentro: false,
    description: 'Parques nacionais, reservas',
  },
  {
    id: 'uc_distrital',
    label: 'Unidade de Conservação Distrital',
    shortLabel: 'UC Distrital',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    dentro: false,
    description: 'Parques ecológicos do DF',
  },
  {
    id: 'reserva_legal',
    label: 'Reserva Legal / RPPN',
    shortLabel: 'Reserva',
    icon: Leaf,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    dentro: false,
    description: 'Áreas privadas protegidas',
  },
];

const AreaVerificationGrid: React.FC<AreaVerificationGridProps> = ({
  coordenadas,
  visibleLayersCount,
}) => {
  if (!coordenadas) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-green-500" />
            Verificação de Áreas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Obtenha sua localização para verificar áreas protegidas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Verificação de Áreas
          </div>
          {visibleLayersCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {visibleLayersCount} camadas
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Grid 2x2 de áreas */}
        <div className="grid grid-cols-2 gap-2">
          {AREA_STATUSES.map((area) => {
            const Icon = area.icon;
            
            return (
              <div
                key={area.id}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                  area.dentro 
                    ? "bg-red-500/10 border-red-500/30" 
                    : "bg-muted/30 border-border/50 hover:bg-muted/50"
                )}
              >
                <div className={cn("p-2.5 rounded-xl mb-2", area.bgColor)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                <span className="text-xs font-semibold text-center leading-tight">
                  {area.shortLabel}
                </span>
                
                <div className="flex items-center gap-1 mt-1.5">
                  {area.dentro ? (
                    <>
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-[10px] text-red-500 font-medium">Dentro</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Fora</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo da localização */}
        <div className="mt-3 p-2.5 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground">
                Localização Atual
              </p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                {coordenadas.latitude.toFixed(6)}°, {coordenadas.longitude.toFixed(6)}°
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                Precisão: ±{Math.round(coordenadas.accuracy)}m • {coordenadas.timestamp.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Dica */}
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          Ative camadas KML para visualização detalhada no mapa
        </p>
      </CardContent>
    </Card>
  );
};

export default AreaVerificationGrid;
