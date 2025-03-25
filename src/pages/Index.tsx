
import React from 'react';
import Card from '@/components/Card';
import { 
  Clipboard, 
  PlusCircle, 
  List, 
  BarChart, 
  MapPin, 
  Table, 
  FileText,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium text-center text-fauna-blue mb-8 mt-4">
        Sistema de Gestão de Fauna
      </h1>
      
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Área Restrita SOI/BPMA</h2>
          <p className="text-gray-600 mb-6">
            Para acessar as funcionalidades do sistema, faça login com suas credenciais.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-fauna-blue hover:bg-fauna-blue/90"
          >
            <LogIn className="h-4 w-4" />
            Fazer Login
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Index;
