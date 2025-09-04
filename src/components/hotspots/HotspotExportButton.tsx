import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { OcorrenciaData } from '@/types/hotspots';

interface HotspotExportButtonProps {
  filteredData: OcorrenciaData[];
  mapRef?: React.RefObject<any>;
  variant?: 'csv' | 'png';
}

const HotspotExportButton = ({ filteredData, mapRef, variant = 'csv' }: HotspotExportButtonProps) => {
  const handleCSVExport = () => {
    if (filteredData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const csvContent = [
      'ID,Tipo,Latitude,Longitude,Data,Município,UF,Fonte',
      ...filteredData.map(item => 
        `${item.id},${item.tipo},${item.lat},${item.lng},${item.data_iso},${item.municipio},${item.uf},${item.fonte}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hotspots_dados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Dados exportados com sucesso');
  };

  const handlePNGExport = async () => {
    if (!mapRef?.current?.map) {
      toast.error('Mapa não está disponível para exportação');
      return;
    }

    try {
      const canvas = mapRef.current.map.getCanvas();
      const dataURL = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `hotspots_mapa_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Mapa exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar mapa:', error);
      toast.error('Erro ao exportar mapa');
    }
  };

  if (variant === 'csv') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCSVExport}
        className="gap-2"
        aria-label="Exportar dados como CSV"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePNGExport}
      className="gap-2"
      aria-label="Exportar mapa como imagem"
    >
      <Camera className="h-4 w-4" />
      Exportar PNG
    </Button>
  );
};

export default HotspotExportButton;