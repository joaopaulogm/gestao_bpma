import React, { useEffect, useRef, useState } from 'react';
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
      maxZoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update heatmap layers when data or filters change
  useEffect(() => {
    if (!map.current || !data.length) return;

    const updateLayers = () => {
      // Filter data based on active filters
      const filteredData = data.filter(item => {
        const typeMatch = 
          (item.tipo === 'resgate' && filters.resgates) ||
          (item.tipo === 'apreensao' && filters.apreensoes) ||
          (item.tipo === 'soltura' && filters.solturas);

        let dateMatch = true;
        if (filters.dataInicio || filters.dataFim) {
          const itemDate = new Date(item.data_iso);
          if (filters.dataInicio) {
            dateMatch = dateMatch && itemDate >= new Date(filters.dataInicio);
          }
          if (filters.dataFim) {
            dateMatch = dateMatch && itemDate <= new Date(filters.dataFim);
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

      // Add new sources and layers for each type
      const colors = {
        resgate: '#22C55E',
        apreensao: '#3B82F6',
        soltura: '#EF4444'
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

        // Add heatmap layer
        map.current!.addLayer({
          id: heatmapId,
          type: 'heatmap',
          source: sourceId,
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4, 0.6,
              8, 1.2,
              12, 1.8
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, `rgba(${hexToRgb(color)?.r || 0}, ${hexToRgb(color)?.g || 0}, ${hexToRgb(color)?.b || 0}, 0)`,
              0.2, color,
              0.4, color,
              0.6, color,
              0.8, color,
              1, '#ffffff'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              4, 10,
              8, 30,
              12, 45
            ]
          }
        });

        // Add points layer for higher zoom levels
        map.current!.addLayer({
          id: pointsId,
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 4,
              12, 8
            ],
            'circle-color': color,
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 0,
              8, 0.8,
              12, 1
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add click handler for points
        map.current!.on('click', pointsId, (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const props = feature.properties;
          
          if (!props) return;

          const formattedDate = format(new Date(props.data_iso), 'dd/MM/yyyy', { locale: ptBR });
          
          const popupContent = `
            <div class="text-sm">
              <div><strong>Tipo:</strong> ${props.tipo === 'resgate' ? 'Resgate' : props.tipo === 'apreensao' ? 'Apreensão' : 'Soltura'}</div>
              <div><strong>Município/UF:</strong> ${props.municipio}/${props.uf}</div>
              <div><strong>Data:</strong> ${formattedDate}</div>
              <div><strong>Fonte:</strong> ${props.fonte}</div>
            </div>
          `;

          new mapboxgl.Popup({ offset: 25 })
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
    };

    if (map.current.isStyleLoaded()) {
      updateLayers();
    } else {
      map.current.on('load', updateLayers);
    }
  }, [data, filters]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
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