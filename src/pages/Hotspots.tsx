
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const Hotspots = () => {
  return (
    <Layout title="Hotspots" showBackButton>
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-200 rounded-lg relative min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-fauna-blue mx-auto" />
                <h3 className="text-lg font-medium">Mapa de Hotspots</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  O mapa de hotspots será implementado com integração a serviços de mapeamento como Google Maps ou Leaflet.
                </p>
                <p className="text-sm text-fauna-blue">
                  Esta funcionalidade estará disponível em breve.
                </p>
              </div>
              
              {/* Marcadores simulados para demonstração */}
              <div className="absolute top-1/4 left-1/4">
                <MapPin className="h-6 w-6 text-red-500" />
              </div>
              <div className="absolute top-1/3 right-1/3">
                <MapPin className="h-6 w-6 text-red-500" />
              </div>
              <div className="absolute bottom-1/4 right-1/4">
                <MapPin className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-fauna-blue mb-2">Área de Maior Incidência</h3>
              <p className="text-sm text-gray-700">Região Central - SP</p>
              <p className="text-sm text-gray-500 mt-1">32 ocorrências registradas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-fauna-blue mb-2">Segundo Hotspot</h3>
              <p className="text-sm text-gray-700">Zona Norte - SP</p>
              <p className="text-sm text-gray-500 mt-1">28 ocorrências registradas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-fauna-blue mb-2">Terceiro Hotspot</h3>
              <p className="text-sm text-gray-700">Região Metropolitana</p>
              <p className="text-sm text-gray-500 mt-1">24 ocorrências registradas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Hotspots;
