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
    if (!mapContainer.current || !mapboxToken) {
      console.log('Map initialization skipped - container or token not ready:', !!mapContainer.current, !!mapboxToken);
      return;
    }

    if (map.current) {
      console.log('Map already initialized');
      return;
    }

    console.log('Initializing Mapbox map with token:', mapboxToken);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-47.8822, -15.7942], // Distrito Federal center
      zoom: 8,
      minZoom: 6,
      maxZoom: 16,
      attributionControl: false
    });

    // Add attribution control in bottom right
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    console.log('Map initialized successfully');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update layers function
  const updateLayers = useCallback((dataToRender: OcorrenciaData[]) => {
    console.log('BrazilHeatmap updateLayers called with data:', dataToRender.length, 'items');
    console.log('Sample data:', dataToRender.slice(0, 3));
    
    if (!map.current) {
      console.log('Map not initialized yet');
      return;
    }
    
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

    if (dataToRender.length === 0) {
      console.log('No data to render, skipping layer creation');
      return;
    }

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

    console.log('Adding GeoJSON source with features:', geojson.features.length);
    console.log('Sample GeoJSON feature:', geojson.features[0]);
    
    try {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson
      });
      console.log('GeoJSON source added successfully');
    } catch (error) {
      console.error('Error adding GeoJSON source:', error);
      return;
    }

    // Add heatmap layer for rescue data with blue-to-red gradient
    try {
      console.log('Adding heatmap layer...');
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
          6, 1.0,
          8, 1.5,
          10, 2.0,
          12, 2.5,
          16, 3.0
        ],
        // Classic heatmap color gradient (blue to red)
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.1, 'rgba(33, 102, 172, 0.6)',  // Blue
          0.2, 'rgba(103, 169, 207, 0.7)', // Light blue
          0.4, 'rgba(209, 229, 240, 0.8)', // Very light blue
          0.6, 'rgba(253, 219, 199, 0.9)', // Light orange
          0.8, 'rgba(239, 138, 98, 1.0)',  // Orange
          1.0, 'rgba(178, 24, 43, 1.0)'    // Red
        ],
        // Optimized radius for DF region
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 20,
          8, 30,
          10, 45,
          12, 60,
          16, 80
        ],
        // Opacity control
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          6, 0.9,
          8, 0.8,
          12, 0.6,
          16, 0.3
        ]
      }
      });
      console.log('Heatmap layer added successfully');
    } catch (error) {
      console.error('Error adding heatmap layer:', error);
      return;
    }

    // Add points layer for precise locations at high zoom
    try {
      console.log('Adding points layer...');
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
      console.log('Points layer added successfully');
    } catch (error) {
      console.error('Error adding points layer:', error);
      return;
    }

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
    console.log('Data effect triggered with data:', data.length, 'items');
    console.log('Map current state:', !!map.current);
    
    if (!map.current) {
      console.log('No map instance, skipping data update');
      return;
    }

    if (data.length === 0) {
      console.log('No data available, clearing layers');
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

    console.log('Map style loaded status:', map.current.isStyleLoaded());
    
    if (map.current.isStyleLoaded()) {
      console.log('Style loaded, calling debouncedUpdate immediately');
      debouncedUpdate(data);
    } else {
      console.log('Style not loaded, waiting for load event');
      map.current.on('load', () => {
        console.log('Map load event fired, calling debouncedUpdate');
        debouncedUpdate(data);
      });
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