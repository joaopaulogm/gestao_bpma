import React, { useEffect, useRef, useState, useCallback } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { OcorrenciaData } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrazilHeatmapProps {
  data: OcorrenciaData[];
}

const BrazilHeatmap = ({ data }: BrazilHeatmapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const heatmapLayer = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch Google Maps API key securely
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-token');
        if (error) {
          console.error('Erro ao obter token Google Maps:', error);
          if (error.message?.includes('not configured') || error.message?.includes('not set')) {
            console.error('GOOGLE_MAPS_API_KEY não configurado no Supabase. Configure em Dashboard → Edge Functions → Secrets.');
          }
          return;
        }
        if (!data?.token) {
          console.error('Token não retornado pela Edge Function');
          return;
        }
        setApiKey(data.token);
      } catch (error) {
        console.error('Failed to fetch Google Maps API key:', error);
      }
    };
    fetchToken();
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    const initMap = async () => {
      try {
        // Set loader options
        setOptions({
          key: apiKey,
          v: 'weekly',
        });

        // Load required libraries
        const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
        await importLibrary('visualization');

        if (!mapContainer.current) return;

        map.current = new Map(mapContainer.current, {
          center: { lat: -15.7942, lng: -47.8822 }, // Distrito Federal center
          zoom: 9,
          minZoom: 7,
          maxZoom: 18,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        infoWindow.current = new google.maps.InfoWindow();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      if (heatmapLayer.current) {
        heatmapLayer.current.setMap(null);
      }
      markersRef.current.forEach(marker => {
        marker.map = null;
      });
      markersRef.current = [];
      map.current = null;
    };
  }, [apiKey]);

  // Update heatmap and markers when data changes
  const updateMapData = useCallback(async () => {
    if (!map.current || !isLoaded || data.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    // Create heatmap data points
    const heatmapData = data.map(item => ({
      location: new google.maps.LatLng(item.lat, item.lng),
      weight: 1
    }));

    // Create or update heatmap layer
    if (heatmapLayer.current) {
      heatmapLayer.current.setData(heatmapData);
    } else {
      heatmapLayer.current = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map.current,
        radius: 30,
        opacity: 0.7,
        gradient: [
          'rgba(0, 0, 0, 0)',
          'rgba(33, 102, 172, 0.6)',
          'rgba(103, 169, 207, 0.7)',
          'rgba(209, 229, 240, 0.8)',
          'rgba(253, 219, 199, 0.9)',
          'rgba(239, 138, 98, 1.0)',
          'rgba(178, 24, 43, 1.0)'
        ]
      });
    }

    // Import marker library
    const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary;

    // Add markers for detailed view at high zoom levels
    data.forEach(item => {
      const markerContent = document.createElement('div');
      markerContent.className = 'w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform';

      const marker = new AdvancedMarkerElement({
        map: map.current,
        position: { lat: item.lat, lng: item.lng },
        content: markerContent,
        title: `Resgate em ${item.municipio}`
      });

      marker.addListener('click', () => {
        const formattedDate = format(new Date(item.data_iso), 'dd/MM/yyyy', { locale: ptBR });
        
        const popupContent = `
          <div class="text-sm space-y-2 max-w-xs p-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
              <strong>Resgate</strong>
            </div>
            <div><strong>Local:</strong> ${item.municipio}, ${item.uf}</div>
            <div><strong>Data:</strong> ${formattedDate}</div>
            <div><strong>Fonte:</strong> ${item.fonte}</div>
          </div>
        `;

        infoWindow.current?.setContent(popupContent);
        infoWindow.current?.open(map.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Adjust visibility based on zoom level
    const updateVisibility = () => {
      const zoom = map.current?.getZoom() || 9;
      const showMarkers = zoom >= 12;
      const heatmapOpacity = zoom < 12 ? 0.7 : 0.3;

      markersRef.current.forEach(marker => {
        if (marker.content instanceof HTMLElement) {
          marker.content.style.display = showMarkers ? 'block' : 'none';
        }
      });

      heatmapLayer.current?.setOptions({ opacity: heatmapOpacity });
    };

    map.current.addListener('zoom_changed', updateVisibility);
    updateVisibility();

  }, [data, isLoaded]);

  useEffect(() => {
    updateMapData();
  }, [updateMapData]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 rounded-lg"
      role="application"
      aria-label="Mapa interativo de hotspots de fauna no Distrito Federal"
      tabIndex={0}
    />
  );
};

export default BrazilHeatmap;
