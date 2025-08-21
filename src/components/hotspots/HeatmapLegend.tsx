import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const HeatmapLegend = () => {
  return (
    <Card className="absolute bottom-4 left-4 z-10 w-64">
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-3">Legenda do Mapa de Calor</h3>
        
        <div className="space-y-3">
          {/* Resgate Legend */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Resgate</span>
            </div>
            <div className="flex items-center gap-1 ml-6">
              <div className="w-3 h-3 rounded-full bg-blue-200"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <div className="w-3 h-3 rounded-full bg-blue-800"></div>
              <span className="text-xs text-gray-500 ml-2">Baixa → Alta densidade</span>
            </div>
          </div>
          
          {/* Apreensão Legend */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Apreensão</span>
            </div>
            <div className="flex items-center gap-1 ml-6">
              <div className="w-3 h-3 rounded-full bg-green-200"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <div className="w-3 h-3 rounded-full bg-green-800"></div>
              <span className="text-xs text-gray-500 ml-2">Baixa → Alta densidade</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Zoom no mapa para ver pontos individuais. Clique nos pontos para mais detalhes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapLegend;