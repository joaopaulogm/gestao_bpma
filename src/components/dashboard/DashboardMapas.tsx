
import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl
} from 'react-leaflet';
import { MapDataPoint } from '@/types/hotspots';
import ChartCard from './ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix the marker icon issue in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const resgateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const apreensaoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const solturaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DashboardMapasProps {
  dataOrigem: MapDataPoint[];
  dataSoltura: MapDataPoint[];
}

const DashboardMapas = ({ dataOrigem, dataSoltura }: DashboardMapasProps) => {
  const [activeTab, setActiveTab] = useState('origem');
  
  // Centro do mapa (Brasília, DF)
  const center: [number, number] = [-15.7801, -47.9292];
  
  // Filtrar apenas pontos válidos
  const validDataOrigem = dataOrigem.filter(
    point => isValidCoordinate(point.latitude, point.longitude)
  );
  
  const validDataSoltura = dataSoltura.filter(
    point => isValidCoordinate(point.latitude, point.longitude)
  );
  
  function isValidCoordinate(lat: string, lng: string): boolean {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 &&
           longitude >= -180 && longitude <= 180;
  }
  
  const getMarkerIcon = (tipo: string) => {
    switch (tipo) {
      case 'Resgate de Fauna':
        return resgateIcon;
      case 'Apreensão':
        return apreensaoIcon;
      case 'Soltura':
        return solturaIcon;
      default:
        return new L.Icon.Default();
    }
  };

  const renderMarkers = (data: MapDataPoint[]) => {
    return data.map((point, index) => {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return null;
      
      return (
        <Marker 
          key={`${point.id}-${index}`} 
          position={[lat, lng]}
          icon={getMarkerIcon(point.tipo)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-medium">{point.nome_popular}</h3>
              <div className="text-xs mt-1">
                <Badge 
                  variant="outline" 
                  className={`mt-1 ${
                    point.tipo === 'Resgate de Fauna' ? 'bg-green-50 text-green-700 border-green-200' :
                    point.tipo === 'Apreensão' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {point.tipo}
                </Badge>
                <p className="mt-1">Quantidade: {point.quantidade}</p>
                <p className="mt-1 text-gray-500">
                  Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-xl mx-auto bg-slate-50 p-1 rounded-xl">
          <TabsTrigger 
            value="origem" 
            className="data-[state=active]:bg-white data-[state=active]:text-amber-600"
          >
            Mapa de Origem
          </TabsTrigger>
          <TabsTrigger 
            value="soltura" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
          >
            Mapa de Soltura
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="origem">
          <ChartCard title="Localizações de Origem" subtitle="Onde os animais foram encontrados">
            {validDataOrigem.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">Sem dados de localização</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Não há coordenadas geográficas válidas para exibir no mapa.
                </p>
              </div>
            ) : (
              <div style={{ height: '500px', width: '100%' }}>
                <MapContainer 
                  center={center} 
                  zoom={10} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ZoomControl position="bottomright" />
                  {renderMarkers(validDataOrigem)}
                </MapContainer>
                
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Resgate de Fauna</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                    <span>Apreensão</span>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </TabsContent>
        
        <TabsContent value="soltura">
          <ChartCard title="Localizações de Soltura" subtitle="Onde os animais foram soltos">
            {validDataSoltura.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">Sem dados de soltura</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Não há coordenadas geográficas de soltura válidas para exibir no mapa.
                </p>
              </div>
            ) : (
              <div style={{ height: '500px', width: '100%' }}>
                <MapContainer 
                  center={center} 
                  zoom={10} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ZoomControl position="bottomright" />
                  {renderMarkers(validDataSoltura)}
                </MapContainer>
                
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span>Local de Soltura</span>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardMapas;
