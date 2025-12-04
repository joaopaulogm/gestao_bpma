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
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-secondary/10 rounded"></div>
          <div className="h-10 bg-secondary/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!especie) return null;

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="text-secondary text-sm font-normal">Nome Científico</Label>
        <Input 
          value={especie.nome_cientifico} 
          readOnly 
          className="bg-background border-secondary/30 text-secondary"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary text-sm font-normal">Ordem Taxonômica</Label>
        <Input 
          value={especie.ordem_taxonomica} 
          readOnly 
          className="bg-background border-secondary/30 text-secondary"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary text-sm font-normal">Estado de Conservação</Label>
        <Input 
          value={especie.estado_de_conservacao} 
          readOnly 
          className="bg-background border-secondary/30 text-secondary"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-secondary text-sm font-normal">Tipo de Fauna</Label>
        <Input 
          value={especie.tipo_de_fauna} 
          readOnly 
          className="bg-background border-secondary/30 text-secondary"
        />
      </div>
    </div>
  );
};

export default EspecieDetailsPanel;
