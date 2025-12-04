import React from 'react';
import { Especie } from '@/services/especieService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <div className="mt-4 p-4 bg-secondary/5 border border-secondary/20 rounded-md animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!especie) return null;

  return (
    <div className="mt-4 p-4 bg-secondary/5 border border-secondary/20 rounded-md backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-secondary/70 text-sm">Nome Científico</Label>
          <Input 
            value={especie.nome_cientifico} 
            readOnly 
            className="bg-background/50 border-secondary/20 text-secondary"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-secondary/70 text-sm">Ordem Taxonômica</Label>
          <Input 
            value={especie.ordem_taxonomica} 
            readOnly 
            className="bg-background/50 border-secondary/20 text-secondary"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-secondary/70 text-sm">Estado de Conservação</Label>
          <Input 
            value={especie.estado_de_conservacao} 
            readOnly 
            className="bg-background/50 border-secondary/20 text-secondary"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-secondary/70 text-sm">Tipo de Fauna</Label>
          <Input 
            value={especie.tipo_de_fauna} 
            readOnly 
            className="bg-background/50 border-secondary/20 text-secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default EspecieDetailsPanel;
