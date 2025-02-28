
import React from 'react';
import Card from '@/components/Card';
import { 
  Clipboard, 
  PlusCircle, 
  List, 
  BarChart, 
  MapPin, 
  Table, 
  FileText 
} from 'lucide-react';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 p-4">
        <h2 className="text-2xl font-medium text-center text-fauna-blue mb-8 mt-4">
          Sistema de Gestão de Fauna
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Card 
            title="Cadastrar Resgate/Apreensão" 
            subtitle="Registre uma nova atividade" 
            icon={Clipboard} 
            to="/resgate-cadastro"
          />
          
          <Card 
            title="Cadastrar Fauna" 
            subtitle="Adicione uma nova espécie" 
            icon={PlusCircle} 
            to="/fauna-cadastro"
          />
          
          <Card 
            title="Fauna Cadastrada" 
            subtitle="Gerencie as espécies" 
            icon={List} 
            to="/fauna-cadastrada"
          />
          
          <Card 
            title="Dashboard" 
            subtitle="Visualize estatísticas" 
            icon={BarChart} 
            to="/dashboard"
          />
          
          <Card 
            title="Hotspots" 
            subtitle="Visualize pontos no mapa" 
            icon={MapPin} 
            to="/hotspots"
          />
          
          <Card 
            title="Lista de Registros" 
            subtitle="Visualize os registros de resgate/apreensão" 
            icon={Table} 
            to="/registros"
          />
          
          <Card 
            title="Relatórios" 
            subtitle="Filtrar dados para gerar relatórios" 
            icon={FileText} 
            to="/relatorios"
            className="sm:col-span-2 sm:w-1/2 mx-auto"
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
