import { useState, useCallback, useRef, useEffect } from 'react';
import { KML_LAYERS, KmlLayer } from '@/components/mapa/KmlLayerControls';
import { toast } from 'sonner';

interface UseKmlLayersProps {
  map: google.maps.Map | null;
  mapLoaded: boolean;
}

export const useKmlLayers = ({ map, mapLoaded }: UseKmlLayersProps) => {
  const [layers, setLayers] = useState<KmlLayer[]>(KML_LAYERS);
  const [loadingLayers, setLoadingLayers] = useState<string[]>([]);
  const kmlLayersRef = useRef<Map<string, google.maps.KmlLayer>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      kmlLayersRef.current.forEach((layer) => {
        layer.setMap(null);
      });
      kmlLayersRef.current.clear();
    };
  }, []);

  const toggleLayer = useCallback(async (layerId: string) => {
    if (!map || !mapLoaded) {
      toast.error('Mapa não está pronto');
      return;
    }

    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    // Se a camada já está visível, remover
    if (layer.visible) {
      const existingLayer = kmlLayersRef.current.get(layerId);
      if (existingLayer) {
        existingLayer.setMap(null);
        kmlLayersRef.current.delete(layerId);
      }
      
      setLayers(prev => prev.map(l => 
        l.id === layerId ? { ...l, visible: false } : l
      ));
      return;
    }

    // Carregar a camada KML
    setLoadingLayers(prev => [...prev, layerId]);

    try {
      // Construir URL completa para o arquivo KML
      const baseUrl = window.location.origin;
      const kmlUrl = `${baseUrl}${layer.file}`;

      const kmlLayer = new google.maps.KmlLayer({
        url: kmlUrl,
        map: map,
        preserveViewport: true,
        suppressInfoWindows: false,
      });

      // Listener para quando o KML é carregado
      kmlLayer.addListener('status_changed', () => {
        const status = kmlLayer.getStatus();
        
        if (status === 'OK') {
          kmlLayersRef.current.set(layerId, kmlLayer);
          setLayers(prev => prev.map(l => 
            l.id === layerId ? { ...l, visible: true } : l
          ));
          toast.success(`Camada "${layer.name}" carregada`);
        } else {
          console.error(`Erro ao carregar KML ${layer.name}:`, status);
          kmlLayer.setMap(null);
          
          // Tentar carregar manualmente se o KML não for acessível publicamente
          handleKmlError(layerId, layer, status);
        }
        
        setLoadingLayers(prev => prev.filter(id => id !== layerId));
      });

    } catch (error) {
      console.error(`Erro ao carregar camada ${layer.name}:`, error);
      toast.error(`Erro ao carregar "${layer.name}"`);
      setLoadingLayers(prev => prev.filter(id => id !== layerId));
    }
  }, [map, mapLoaded, layers]);

  const handleKmlError = (layerId: string, layer: KmlLayer, status: string) => {
    // Google Maps KML requer URLs públicas
    // Se estiver em ambiente local/desenvolvimento, informar o usuário
    if (status === 'FETCH_ERROR' || status === 'INVALID_DOCUMENT') {
      toast.error(
        `A camada "${layer.name}" não pôde ser carregada. ` +
        'KML requer acesso público ao arquivo.',
        { duration: 5000 }
      );
    } else {
      toast.error(`Erro: ${status}`);
    }
  };

  const getVisibleLayersCount = useCallback(() => {
    return layers.filter(l => l.visible).length;
  }, [layers]);

  return {
    layers,
    loadingLayers,
    toggleLayer,
    getVisibleLayersCount,
  };
};
