
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RegistroLocation } from '@/types/hotspots';
import { supabase } from '@/integrations/supabase/client';
import HeatmapLegend from './HeatmapLegend';

interface HotspotMapProps {
  locations: RegistroLocation[];
}

const HotspotMap = ({ locations }: HotspotMapProps) => {
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

  useEffect(() => {
    if (!mapContainer.current || !locations.length || !mapboxToken) return;
    
    try {
      if (map.current) return;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-47.929, -15.779],
        zoom: 8
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        // Prepare data for heatmap
        const heatmapData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: locations.map(location => ({
            type: 'Feature' as const,
            properties: {
              origem: location.origem,
              regiao: location.regiao_administrativa,
              count: location.count
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]
            }
          }))
        };
        
        // Add source for heatmap data
        map.current.addSource('hotspots', {
          type: 'geojson',
          data: heatmapData
        });
        
        // Add heatmap layer for "Resgate" (blue tones)
        map.current.addLayer({
          id: 'heatmap-resgate',
          type: 'heatmap',
          source: 'hotspots',
          filter: ['==', ['get', 'origem'], 'Resgate'],
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, 6, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33, 102, 172, 0)',
              0.2, 'rgb(103, 169, 207)',
              0.4, 'rgb(209, 229, 240)',
              0.6, 'rgb(103, 169, 207)',
              0.8, 'rgb(33, 102, 172)',
              1, 'rgb(5, 48, 97)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
          }
        });
        
        // Add heatmap layer for "Apreensão" (green tones)
        map.current.addLayer({
          id: 'heatmap-apreensao',
          type: 'heatmap',
          source: 'hotspots',
          filter: ['==', ['get', 'origem'], 'Apreensão'],
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, 6, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 109, 44, 0)',
              0.2, 'rgb(65, 174, 118)',
              0.4, 'rgb(199, 233, 180)',
              0.6, 'rgb(65, 174, 118)',
              0.8, 'rgb(35, 139, 69)',
              1, 'rgb(0, 68, 27)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
          }
        });
        
        // Add circle layers for higher zoom levels
        map.current.addLayer({
          id: 'hotspots-point-resgate',
          type: 'circle',
          source: 'hotspots',
          filter: ['==', ['get', 'origem'], 'Resgate'],
          minzoom: 7,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, ['interpolate', ['linear'], ['get', 'count'], 1, 10, 6, 20], 16, ['interpolate', ['linear'], ['get', 'count'], 1, 40, 6, 80]],
            'circle-color': ['interpolate', ['linear'], ['get', 'count'], 1, 'rgb(103, 169, 207)', 6, 'rgb(33, 102, 172)'],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
          }
        });
        
        map.current.addLayer({
          id: 'hotspots-point-apreensao',
          type: 'circle',
          source: 'hotspots',
          filter: ['==', ['get', 'origem'], 'Apreensão'],
          minzoom: 7,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, ['interpolate', ['linear'], ['get', 'count'], 1, 10, 6, 20], 16, ['interpolate', ['linear'], ['get', 'count'], 1, 40, 6, 80]],
            'circle-color': ['interpolate', ['linear'], ['get', 'count'], 1, 'rgb(65, 174, 118)', 6, 'rgb(35, 139, 69)'],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1]
          }
        });
        
        // Add popups on click
        ['hotspots-point-resgate', 'hotspots-point-apreensao'].forEach(layerId => {
          map.current.on('click', layerId, (e) => {
            const feature = e.features?.[0];
            if (feature?.geometry.type === 'Point') {
              const coordinates = feature.geometry.coordinates.slice() as [number, number];
              const properties = feature.properties;
              
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
              
              new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(`
                  <div>
                    <strong>${properties?.regiao}</strong><br/>
                    Tipo: ${properties?.origem}<br/>
                    Ocorrências: ${properties?.count}
                  </div>
                `)
                .addTo(map.current);
            }
          });
          
          map.current.on('mouseenter', layerId, () => {
            map.current.getCanvas().style.cursor = 'pointer';
          });
          
          map.current.on('mouseleave', layerId, () => {
            map.current.getCanvas().style.cursor = '';
          });
        });
        
        // Fit bounds to show all points
        if (locations.length) {
          const bounds = new mapboxgl.LngLatBounds();
          
          locations.forEach(location => {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              bounds.extend([lng, lat]);
            }
          });
          
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 12
          });
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [locations, mapboxToken]);

  return (
    <div className="absolute inset-0 rounded-lg">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      <HeatmapLegend />
    </div>
  );
};

export default HotspotMap;
