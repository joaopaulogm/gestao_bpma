import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clipboard, 
  LogIn, 
  Shield,
  BookOpen,
  Lock,
  Trophy,
  Briefcase,
  Users,
  Wrench,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoBpma from '@/assets/logo-bpma.svg';

const CheckeredDivider = () => (
  <div className="flex gap-[3px]">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-[3px]">
        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i % 2 === 0 ? 'bg-[#071d49]' : 'bg-transparent'}`} />
        <div className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i % 2 === 1 ? 'bg-[#071d49]' : 'bg-transparent'}`} />
      </div>
    ))}
  </div>
);

interface HomeCardProps {
  title: string;
  icon: React.ElementType;
  to: string;
}

const HomeCard: React.FC<HomeCardProps> = ({ title, icon: Icon, to }) => {
  return (
    <Link 
      to={to}
      className="flex flex-col items-center justify-center gap-3 p-4 aspect-square rounded-xl 
        bg-[#071d49] backdrop-blur-md border-2 border-[#ffcc00]/40
        hover:scale-105 hover:border-[#ffcc00] hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] 
        transition-all duration-300 shadow-lg"
    >
      <Icon className="h-8 w-8 text-[#ffcc00]" />
      <span className="text-xs font-medium text-center text-white leading-tight">{title}</span>
    </Link>
  );
};

const Index = () => {
  const { isAuthenticated, isAdmin, hasAccess } = useAuth();
  
  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-32 h-32 rounded-full bg-[#071d49] flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,204,0,0.6)] cursor-pointer overflow-hidden">
          <img src={logoBpma} alt="Logo BPMA" className="h-40 w-40 object-contain" />
        </div>
        <div className="flex items-center justify-center gap-4 mb-3">
          <CheckeredDivider />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground whitespace-nowrap">
            Gestão - BPMA
          </h1>
          <CheckeredDivider />
        </div>
        <p className="text-muted-foreground text-base">
          Sistema de gestão de ocorrências e dados ambientais
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Restricted Area */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold px-1">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Atividade Operacional</span>
          </div>
          
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <HomeCard 
                title="Fazer Login" 
                icon={LogIn} 
                to="/login"
              />
            </div>
          ) : (
            <>
              {/* Operador level - all authenticated users */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <HomeCard title="Resgate de Fauna" icon={Clipboard} to="/resgate-cadastro" />
                <HomeCard title="Crimes Ambientais" icon={Shield} to="/crimes-ambientais" />
                <HomeCard title="Material de Apoio" icon={BookOpen} to="/material-apoio" />
                <HomeCard title="Ranking de Ocorrências" icon={Trophy} to="/ranking" />
              </div>
              
              {/* Section-based access */}
              {(hasAccess(['secao_operacional']) || hasAccess(['secao_pessoas']) || hasAccess(['secao_logistica']) || isAdmin) && (
                <div className="pt-4">
                  <div className="flex items-center gap-2 text-primary font-semibold px-1 mb-4">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Seções Administrativas</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hasAccess(['secao_operacional']) && (
                      <HomeCard title="Seção Operacional" icon={Briefcase} to="/secao-operacional" />
                    )}
                    {hasAccess(['secao_pessoas']) && (
                      <HomeCard title="Seção de Pessoas" icon={Users} to="/secao-pessoas" />
                    )}
                    {hasAccess(['secao_logistica']) && (
                      <HomeCard title="Seção de Logística" icon={Wrench} to="/secao-logistica" />
                    )}
                    {isAdmin && (
                      <HomeCard title="Gerenciar Permissões" icon={Settings} to="/gerenciar-permissoes" />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
