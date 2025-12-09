
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clipboard, 
  LogIn, 
  Shield,
  PlusCircle,
  List,
  BarChart,
  MapPin,
  Table,
  FileText,
  Package,
  Leaf,
  Users,
  BookOpen,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  title: string;
  icon: React.ElementType;
  to: string;
}

const HomeCard: React.FC<HomeCardProps> = ({ title, icon: Icon, to }) => {
  return (
    <Link 
      to={to}
      className="flex items-center gap-3 py-3 px-4 rounded-lg bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 border border-sidebar-border"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium truncate">{title}</span>
    </Link>
  );
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Gestão de Dados do BPMA
        </h1>
        <p className="text-muted-foreground text-base">
          Sistema de gestão de ocorrências e dados ambientais
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Public Section */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <HomeCard 
              title="Resgate de Fauna" 
              icon={Clipboard} 
              to="/resgate-cadastro"
            />
            <HomeCard 
              title="Crimes Ambientais" 
              icon={Shield} 
              to="/crimes-ambientais"
            />
          </div>
        </div>
        
        {/* Restricted Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sidebar-primary font-medium px-1">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Área Restrita</span>
          </div>
          
          {!isAuthenticated ? (
            <HomeCard 
              title="Fazer Login" 
              icon={LogIn} 
              to="/login"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <HomeCard title="Cadastrar Fauna" icon={PlusCircle} to="/fauna-cadastro" />
              <HomeCard title="Fauna Cadastrada" icon={List} to="/fauna-cadastrada" />
              <HomeCard title="Dashboard" icon={BarChart} to="/dashboard" />
              <HomeCard title="Hotspots" icon={MapPin} to="/hotspots" />
              <HomeCard title="Lista de Registros" icon={Table} to="/registros" />
              <HomeCard title="Relatórios" icon={FileText} to="/relatorios" />
              <HomeCard title="Bens Apreendidos" icon={Package} to="/bens-apreendidos" />
              <HomeCard title="Cadastrar Flora" icon={Leaf} to="/flora-cadastro" />
              <HomeCard title="Flora Cadastrada" icon={List} to="/flora-cadastrada" />
              <HomeCard title="Efetivo BPMA" icon={Users} to="/efetivo" />
              <HomeCard title="POP Ambiental" icon={BookOpen} to="/pop" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
