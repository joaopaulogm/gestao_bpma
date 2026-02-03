import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Shield, TreeDeciduous } from 'lucide-react';

interface AreaProtegida {
  id: string;
  nome: string;
  competencia: 'Federal' | 'Distrital';
  tipo: string | null;
}

interface AreaProtegidaSectionProps {
  emAreaProtegida: boolean;
  areaProtegidaId: string;
  onEmAreaProtegidaChange: (value: boolean) => void;
  onAreaProtegidaChange: (id: string, competencia: string) => void;
}

const AreaProtegidaSection: React.FC<AreaProtegidaSectionProps> = ({
  emAreaProtegida,
  areaProtegidaId,
  onEmAreaProtegidaChange,
  onAreaProtegidaChange,
}) => {
  const [areasProtegidas, setAreasProtegidas] = useState<AreaProtegida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaProtegida | null>(null);

  useEffect(() => {
    if (emAreaProtegida) {
      fetchAreasProtegidas();
    }
  }, [emAreaProtegida]);

  useEffect(() => {
    if (areaProtegidaId && areasProtegidas.length > 0) {
      const area = areasProtegidas.find(a => a.id === areaProtegidaId);
      setSelectedArea(area || null);
    } else {
      setSelectedArea(null);
    }
  }, [areaProtegidaId, areasProtegidas]);

  const fetchAreasProtegidas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dim_area_especialmente_protegida')
        .select('id, nome, competencia, tipo')
        .order('competencia')
        .order('nome');

      if (error) throw error;
      setAreasProtegidas(data || []);
    } catch (error) {
      console.error('Erro ao carregar áreas protegidas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaChange = (id: string) => {
    const area = areasProtegidas.find(a => a.id === id);
    if (area) {
      setSelectedArea(area);
      onAreaProtegidaChange(id, area.competencia);
    }
  };

  // Agrupar áreas por competência
  const areasFederais = areasProtegidas.filter(a => a.competencia === 'Federal');
  const areasDistritais = areasProtegidas.filter(a => a.competencia === 'Distrital');

  return (
    <div className="space-y-4">
      {/* Toggle para área protegida */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <Label htmlFor="emAreaProtegida" className="text-sm font-medium cursor-pointer">
              Atividade em Área Especialmente Protegida?
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Marque se a atividade ocorreu em Unidade de Conservação, APP ou Reserva Legal
            </p>
          </div>
        </div>
        <Switch
          id="emAreaProtegida"
          checked={emAreaProtegida}
          onCheckedChange={onEmAreaProtegidaChange}
        />
      </div>

      {/* Seletor de área protegida */}
      {emAreaProtegida && (
        <div className="space-y-3 animate-fade-in">
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <TreeDeciduous className="h-4 w-4" />
              Área Especialmente Protegida
            </Label>
            <Select
              value={areaProtegidaId}
              onValueChange={handleAreaChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione a área..."} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {/* UCs Federais */}
                {areasFederais.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                      UCs Federais
                    </div>
                    {areasFederais.map((area) => (
                      <SelectItem key={area.id} value={area.id} className="pl-4">
                        {area.nome}
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {/* UCs Distritais */}
                {areasDistritais.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0 mt-1">
                      UCs Distritais
                    </div>
                    {areasDistritais.map((area) => (
                      <SelectItem key={area.id} value={area.id} className="pl-4">
                        {area.nome}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Badge de competência */}
          {selectedArea && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="text-sm text-muted-foreground">Competência da Área:</span>
              <Badge 
                variant={selectedArea.competencia === 'Federal' ? 'default' : 'secondary'}
                className={selectedArea.competencia === 'Federal' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              >
                {selectedArea.competencia}
              </Badge>
              {selectedArea.tipo && (
                <Badge variant="outline" className="ml-1">
                  {selectedArea.tipo}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AreaProtegidaSection;
