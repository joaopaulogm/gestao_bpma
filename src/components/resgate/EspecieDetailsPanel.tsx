import React from 'react';
import { Especie } from '@/services/especieService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EspecieDetailsPanelProps {
  especie: Especie | null;
  isLoading: boolean;
}

const EspecieDetailsPanel: React.FC<EspecieDetailsPanelProps> = ({ 
  especie, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="mt-4 bg-background/50 backdrop-blur-sm border-secondary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-secondary text-sm font-medium">Detalhes da Espécie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!especie) return null;

  return (
    <Card className="mt-4 bg-background/50 backdrop-blur-sm border-secondary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-secondary text-sm font-medium">Detalhes da Espécie Selecionada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-secondary text-sm font-normal">Nome Científico</Label>
            <Input 
              value={especie.nome_cientifico || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary text-sm font-normal">Ordem Taxonômica</Label>
            <Input 
              value={especie.ordem_taxonomica || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary text-sm font-normal">Estado de Conservação</Label>
            <Input 
              value={especie.estado_de_conservacao || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-secondary text-sm font-normal">Tipo de Fauna</Label>
            <Input 
              value={especie.tipo_de_fauna || ''} 
              readOnly 
              className="bg-muted"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EspecieDetailsPanel;
