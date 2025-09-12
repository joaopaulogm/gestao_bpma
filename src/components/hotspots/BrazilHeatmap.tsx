import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { OcorrenciaData } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrazilHeatmapProps {
  data: OcorrenciaData[];
}

const BrazilHeatmap = ({ data }: BrazilHeatmapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Mapbox token securely
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
        mapboxgl.accessToken = data.token;
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-51.9253, -14.2350], // Brazil center
      zoom: 4,
      minZoom: 3,
      maxZoom: 16,
      attributionControl: false
    });

    // Add attribution control in bottom right
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update layers function
  const updateLayers = useCallback((dataToRender: OcorrenciaData[]) => {
    if (!map.current) return;
    
    // Remove existing sources and layers
    const heatmapId = 'resgates-heatmap';
    const pointsId = 'resgates-points';
    const sourceId = 'resgates-source';

    if (map.current.getLayer(heatmapId)) {
      map.current.removeLayer(heatmapId);
    }
    if (map.current.getLayer(pointsId)) {
      map.current.removeLayer(pointsId);
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId);
    }

    if (dataToRender.length === 0) return;

    // Create GeoJSON source for rescue data
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: dataToRender.map(item => ({
        type: 'Feature',
        properties: {
          id: item.id,
          tipo: item.tipo,
          municipio: item.municipio,
          uf: item.uf,
          data_iso: item.data_iso,
          fonte: item.fonte
        },
        geometry: {
          type: 'Point',
          coordinates: [item.lng, item.lat]
        }
      }))
    };

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    });

    // Add heatmap layer for rescue data with green color scheme
    map.current.addLayer({
      id: heatmapId,
      type: 'heatmap',
      source: sourceId,
      paint: {
        // Weight based on data density
        'heatmap-weight': 1,
        // Enhanced intensity scaling
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 0.6,
          6, 1.0,
          9, 1.4,
          12, 1.8,
          16, 2.2
        ],
        // Green color gradient for rescue heatmap
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.1, 'rgba(16, 185, 129, 0.2)', // Light green
          0.3, 'rgba(16, 185, 129, 0.6)', // Medium green
          0.5, 'rgba(16, 185, 129, 0.9)', // Darker green
          0.7, '#10B981',                 // Full green
          0.9, '#059669',                 // Intense green
          1, '#047857'                    // Hottest green
        ],
        // Adaptive radius for different zoom levels
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 15,
          6, 25,
          9, 40,
          12, 55,
          16, 70
        ],
        // Opacity control
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          3, 0.8,
          9, 0.9,
          12, 0.7,
          16, 0.4
        ]
      }
    });

    // Add points layer for precise locations at high zoom
    map.current.addLayer({
      id: pointsId,
      type: 'circle',
      source: sourceId,
      paint: {
        // Adaptive circle size
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 4,
          12, 7,
          16, 12
        ],
        'circle-color': '#10B981', // Green for rescues
        // Smooth opacity transition
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0,
          9, 0.7,
          12, 0.9,
          16, 1
        ],
        // Enhanced stroke for better visibility
        'circle-stroke-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          9, 1,
          12, 2,
          16, 3
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.9
      }
    });

    // Add click handler for points
    map.current.on('click', pointsId, (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const props = feature.properties;
      
      if (!props) return;

      const formattedDate = format(new Date(props.data_iso), 'dd/MM/yyyy', { locale: ptBR });
      
      const popupContent = `
        <div class="text-sm space-y-2 max-w-xs">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background-color: #10B981"></div>
            <strong>Resgate</strong>
          </div>
          <div><strong>Local:</strong> ${props.municipio}, ${props.uf}</div>
          <div><strong>Data:</strong> ${formattedDate}</div>
          <div><strong>Fonte:</strong> ${props.fonte}</div>
        </div>
      `;

      new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        className: 'hotspot-popup'
      })
        .setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map.current);
    });

    // Change cursor on hover
    map.current.on('mouseenter', pointsId, () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', pointsId, () => {
      map.current.getCanvas().style.cursor = '';
    });
  }, []);

  // Debounced update function for better performance
  const debouncedUpdate = useCallback((newData: OcorrenciaData[]) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateLayers(newData);
    }, 150);
  }, [updateLayers]);

  // Update heatmap layers when data changes
  useEffect(() => {
    if (!map.current) return;

    if (data.length === 0) {
      // Clear layers if no data
      const heatmapId = 'resgates-heatmap';
      const pointsId = 'resgates-points';
      const sourceId = 'resgates-source';

      if (map.current.getLayer(heatmapId)) {
        map.current.removeLayer(heatmapId);
      }
      if (map.current.getLayer(pointsId)) {
        map.current.removeLayer(pointsId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      return;
    }

    if (map.current.isStyleLoaded()) {
      debouncedUpdate(data);
    } else {
      map.current.on('load', () => debouncedUpdate(data));
    }

    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [data, debouncedUpdate]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 rounded-lg"
      role="application"
      aria-label="Mapa interativo de hotspots de fauna no Brasil"
      tabIndex={0}
    />
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default BrazilHeatmap;