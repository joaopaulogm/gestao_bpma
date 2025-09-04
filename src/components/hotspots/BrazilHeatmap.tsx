import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { OcorrenciaData, HeatmapFilters } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrazilHeatmapProps {
  data: OcorrenciaData[];
  filters: HeatmapFilters;
}

const BrazilHeatmap = ({ data, filters }: BrazilHeatmapProps) => {
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
  const updateLayers = useCallback((dataToRender: OcorrenciaData[], filtersToApply: HeatmapFilters) => {
    if (!map.current) return;
    
    // Filter data based on active filters
    const filteredData = dataToRender.filter(item => {
      const typeMatch = 
        (item.tipo === 'resgate' && filtersToApply.resgates) ||
        (item.tipo === 'apreensao' && filtersToApply.apreensoes) ||
        (item.tipo === 'soltura' && filtersToApply.solturas);

      let dateMatch = true;
      if (filtersToApply.dataInicio || filtersToApply.dataFim) {
        const itemDate = new Date(item.data_iso);
        if (filtersToApply.dataInicio) {
          dateMatch = dateMatch && itemDate >= new Date(filtersToApply.dataInicio);
        }
        if (filtersToApply.dataFim) {
          dateMatch = dateMatch && itemDate <= new Date(filtersToApply.dataFim);
        }
      }

      return typeMatch && dateMatch;
    });

    // Remove existing sources and layers
    ['resgates', 'apreensoes', 'solturas'].forEach(tipo => {
      const heatmapId = `${tipo}-heatmap`;
      const pointsId = `${tipo}-points`;
      const sourceId = `${tipo}-source`;

      if (map.current!.getLayer(heatmapId)) {
        map.current!.removeLayer(heatmapId);
      }
      if (map.current!.getLayer(pointsId)) {
        map.current!.removeLayer(pointsId);
      }
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });

    // Add new sources and layers for each type with enhanced colors for better visibility
    const colors = {
      resgate: '#10B981', // Enhanced green for better contrast
      apreensao: '#3B82F6', // Blue
      soltura: '#EF4444'  // Red
    };

    const categoryLabels = {
      resgate: 'Resgate',
      apreensao: 'Apreensão', 
      soltura: 'Soltura'
    };

    Object.entries(colors).forEach(([tipo, color]) => {
      const typeData = filteredData.filter(item => item.tipo === tipo);
      
      if (typeData.length === 0) return;

      const sourceId = `${tipo}-source`;
      const heatmapId = `${tipo}-heatmap`;
      const pointsId = `${tipo}-points`;

      // Create GeoJSON source
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: typeData.map(item => ({
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

      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });

      // Add optimized heatmap layer with density-based visualization
      map.current!.addLayer({
        id: heatmapId,
        type: 'heatmap',
        source: sourceId,
        paint: {
          // Weight based on data density for better hotspot visualization
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'density'],
            0, 0.5,
            1, 1,
            5, 1.5
          ],
          // Enhanced intensity scaling
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0.4,
            6, 0.8,
            9, 1.2,
            12, 1.6,
            16, 2.0
          ],
          // Improved color gradient for better visibility
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, `${color}20`, // 20% opacity
            0.3, `${color}60`, // 60% opacity
            0.5, `${color}90`, // 90% opacity
            0.7, color,        // Full color
            0.9, `${color}ff`, // Full intensity
            1, '#ffffff'       // White hot
          ],
          // Adaptive radius for different zoom levels
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 8,
            6, 20,
            9, 35,
            12, 50,
            16, 65
          ],
          // Opacity control for overlapping layers
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0.7,
            9, 0.8,
            12, 0.6,
            16, 0.3
          ]
        }
      });

      // Add enhanced points layer for precise locations at high zoom
      map.current!.addLayer({
        id: pointsId,
        type: 'circle',
        source: sourceId,
        paint: {
          // Adaptive circle size
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 3,
            12, 6,
            16, 10
          ],
          'circle-color': color,
          // Smooth opacity transition
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0,
            9, 0.6,
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
          'circle-stroke-opacity': 0.8
        }
      });

      // Add click handler for points
      map.current!.on('click', pointsId, (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const props = feature.properties;
        
        if (!props) return;

        const formattedDate = format(new Date(props.data_iso), 'dd/MM/yyyy', { locale: ptBR });
        
        const categoryLabel = categoryLabels[props.tipo as keyof typeof categoryLabels] || props.tipo;
        const categoryColor = colors[props.tipo as keyof typeof colors] || '#666666';
        
        const popupContent = `
          <div class="text-sm space-y-2 max-w-xs">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${categoryColor}"></div>
              <strong>${categoryLabel}</strong>
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
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current!.on('mouseenter', pointsId, () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current!.on('mouseleave', pointsId, () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });
  }, []);

  // Debounced update function for better performance
  const debouncedUpdate = useCallback((newData: OcorrenciaData[], newFilters: HeatmapFilters) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateLayers(newData, newFilters);
    }, 150);
  }, [updateLayers]);

  // Update heatmap layers when data or filters change
  useEffect(() => {
    if (!map.current) return;

    if (data.length === 0) {
      // Clear all layers if no data
      ['resgates', 'apreensoes', 'solturas'].forEach(tipo => {
        const heatmapId = `${tipo}-heatmap`;
        const pointsId = `${tipo}-points`;
        const sourceId = `${tipo}-source`;

        if (map.current?.getLayer(heatmapId)) {
          map.current.removeLayer(heatmapId);
        }
        if (map.current?.getLayer(pointsId)) {
          map.current.removeLayer(pointsId);
        }
        if (map.current?.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      });
      return;
    }

    if (map.current.isStyleLoaded()) {
      debouncedUpdate(data, filters);
    } else {
      map.current.on('load', () => debouncedUpdate(data, filters));
    }

    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [data, filters, debouncedUpdate]);

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