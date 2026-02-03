import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TreePine, Mountain, Leaf, CheckCircle2, XCircle, MapPin, Loader2, AlertTriangle, Droplets, Layers2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getGeographicInfo, GeographicInfo } from '@/services/geographicInfoService';

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
  const [geographicInfo, setGeographicInfo] = useState<GeographicInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  
  useEffect(() => {
    if (coordenadas) {
      setLoadingInfo(true);
      getGeographicInfo(coordenadas.latitude, coordenadas.longitude)
        .then(info => {
          setGeographicInfo(info);
        })
        .catch(error => {
          console.error('Erro ao obter informações geográficas:', error);
        })
        .finally(() => {
          setLoadingInfo(false);
        });
    } else {
      setGeographicInfo(null);
    }
  }, [coordenadas]);
  
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
            const dentro = (() => {
              if (!geographicInfo) return false;
              switch (area.id) {
                case 'app':
                  return geographicInfo.app;
                case 'uc_federal':
                  return geographicInfo.ucFederal;
                case 'uc_distrital':
                  return geographicInfo.ucDistrital;
                case 'reserva_legal':
                  return geographicInfo.reservaLegal;
                default:
                  return false;
              }
            })();
            
            return (
              <div
                key={area.id}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                  dentro 
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
                  {dentro ? (
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

        {/* Informações Geográficas Detalhadas */}
        {loadingInfo ? (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Carregando informações...</p>
            </div>
          </div>
        ) : geographicInfo && (
          <div className="mt-3 space-y-2">
            {/* Região Administrativa */}
            {geographicInfo.regiaoAdministrativa.nome && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Região Administrativa
                    </p>
                    <p className="text-[12px] text-blue-700 dark:text-blue-300 font-medium">
                      {geographicInfo.regiaoAdministrativa.nome}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Classe de Solo */}
            {geographicInfo.classeSolo && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <Layers2 className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Classe de Solo
                    </p>
                    <p className="text-[12px] text-amber-700 dark:text-amber-300 font-medium">
                      {geographicInfo.classeSolo}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Riscos Ambientais */}
            {(geographicInfo.riscoRecargaAquifero || 
              geographicInfo.riscoErosaoSolo || 
              geographicInfo.riscoPerdaCerrado) && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-red-900 dark:text-red-100 mb-1.5">
                      Áreas de Risco
                    </p>
                    <div className="space-y-1">
                      {geographicInfo.riscoRecargaAquifero && (
                        <div className="flex items-center gap-1.5">
                          <Droplets className="h-3 w-3 text-red-600 dark:text-red-400" />
                          <span className="text-[11px] text-red-700 dark:text-red-300">
                            Risco de Recarga de Aquífero
                          </span>
                        </div>
                      )}
                      {geographicInfo.riscoErosaoSolo && (
                        <div className="flex items-center gap-1.5">
                          <Layers2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                          <span className="text-[11px] text-red-700 dark:text-red-300">
                            Risco de Erosão do Solo
                          </span>
                        </div>
                      )}
                      {geographicInfo.riscoPerdaCerrado && (
                        <div className="flex items-center gap-1.5">
                          <TreePine className="h-3 w-3 text-red-600 dark:text-red-400" />
                          <span className="text-[11px] text-red-700 dark:text-red-300">
                            Risco de Perda de Cerrado Nativo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mensagem se não há riscos */}
            {!geographicInfo.riscoRecargaAquifero && 
             !geographicInfo.riscoErosaoSolo && 
             !geographicInfo.riscoPerdaCerrado && (
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-[11px] text-green-700 dark:text-green-300">
                    Nenhuma área de risco identificada nesta localização
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

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
