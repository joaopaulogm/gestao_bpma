
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { RegistroLocation } from '@/types/hotspots';

// Configuração do token do Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hb3BhdWxvZ20iLCJhIjoiY204NHZ4ODY0MmE0aTJ0cTE3ZWh3Z2lmcCJ9.P0DpsEES8FCV6jIobfqZVA';

interface HotspotMapProps {
  locations: RegistroLocation[];
}

const HotspotMap = ({ locations }: HotspotMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !locations.length) return;
    
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
        locations.forEach(location => {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${location.regiao_administrativa}</strong>`);
              
            new mapboxgl.Marker({ color: '#E03131' })
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map.current);
          }
        });
        
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
  }, [locations]);

  return <div ref={mapContainer} className="absolute inset-0 rounded-lg" />;
};

export default HotspotMap;
