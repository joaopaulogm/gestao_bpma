
import React from 'react';
import { Especie } from '@/services/especieService';

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
      <div className="mt-4 p-4 bg-gray-50 rounded-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-3/5"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!especie) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Detalhes da Espécie Selecionada</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div><span className="font-semibold">Nome Científico:</span> {especie.nome_cientifico}</div>
        <div><span className="font-semibold">Ordem Taxonômica:</span> {especie.ordem_taxonomica}</div>
        <div><span className="font-semibold">Estado de Conservação:</span> {especie.estado_de_conservacao}</div>
        <div><span className="font-semibold">Tipo de Fauna:</span> {especie.tipo_de_fauna}</div>
      </div>
    </div>
  );
};

export default EspecieDetailsPanel;
