import { Card, CardContent } from '@/components/ui/card';
import { HotspotRegion } from '@/types/hotspots';

interface HotspotCardProps {
  region: HotspotRegion;
  index: number;
}

const HotspotCard = ({ region, index }: HotspotCardProps) => {
  const getTitle = (index: number) => {
    switch (index) {
      case 0:
        return 'Área de Maior Incidência';
      case 1:
        return 'Segundo Hotspot';
      case 2:
        return 'Terceiro Hotspot';
      default:
        return 'Hotspot';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-fauna-blue mb-2">
          {getTitle(index)}
        </h3>
        <p className="text-sm text-foreground">{region.regiao}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {region.contagem} {region.contagem === 1 ? 'ocorrência registrada' : 'ocorrências registradas'}
        </p>
      </CardContent>
    </Card>
  );
};

export default HotspotCard;
