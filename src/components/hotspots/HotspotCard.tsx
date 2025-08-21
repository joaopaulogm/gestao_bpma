
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HotspotRegion } from '@/types/hotspots';

interface HotspotCardProps {
  region: HotspotRegion;
  index: number;
}

const HotspotCard = ({ region, index }: HotspotCardProps) => {
  const getTitle = (region: HotspotRegion, index: number) => {
    if (region.tipo === 'Resgate') {
      return `🔵 Hotspot Resgate #${Math.floor(index / 2) + 1}`;
    } else {
      return `🟢 Hotspot Apreensão #${Math.floor(index / 2) + 1}`;
    }
  };
  
  const getBackgroundColor = (tipo: string) => {
    return tipo === 'Resgate' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
  };

  return (
    <Card className={getBackgroundColor(region.tipo)}>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-2">
          {getTitle(region, index)}
        </h3>
        <p className="text-sm text-gray-700 font-medium">{region.regiao}</p>
        <p className="text-sm text-gray-600 mt-1">
          {region.contagem} {region.contagem === 1 ? 'ocorrência registrada' : 'ocorrências registradas'}
        </p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            region.tipo === 'Resgate' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {region.tipo}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;
