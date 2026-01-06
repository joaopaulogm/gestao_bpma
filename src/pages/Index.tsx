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
import { useIsMobile } from '@/hooks/use-mobile';

const CheckeredDivider = () => {
  const isMobile = useIsMobile();
  const count = isMobile ? 10 : 20;
  
  return (
    <div className="flex gap-[2px] sm:gap-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-[2px] sm:gap-[3px]">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 0 ? 'bg-primary' : 'bg-transparent'}`} />
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 1 ? 'bg-primary' : 'bg-transparent'}`} />
        </div>
      ))}
    </div>
  );
};

interface HomeCardProps {
  title: string;
  icon: React.ElementType;
  to: string;
}

const HomeCard: React.FC<HomeCardProps> = ({ title, icon: Icon, to }) => {
  return (
    <Link 
      to={to}
      className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 aspect-square rounded-xl 
        bg-card border border-border shadow-sm
        hover:shadow-md hover:-translate-y-1
        transition-all duration-250 active:scale-[0.97] min-h-[120px]"
    >
      <div className="p-3 rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-center text-foreground leading-tight line-clamp-2">{title}</span>
    </Link>
  );
};

const Index = () => {
  const { isAuthenticated, isAdmin, hasAccess } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-card border border-border shadow-sm flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-all duration-250 hover:shadow-md overflow-hidden">
          <img src={logoBpma} alt="Logo BPMA" className="h-20 w-20 sm:h-28 sm:w-28 object-contain" />
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <CheckeredDivider />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground whitespace-nowrap tracking-tight">
            Gestão - BPMA
          </h1>
          <CheckeredDivider />
        </div>
        <p className="text-muted-foreground text-base sm:text-lg px-4">
          Sistema de gestão de ocorrências e dados ambientais
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Restricted Area */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-primary font-semibold px-1">
            <Lock className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Atividade Operacional</span>
          </div>
          
          {!isAuthenticated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              <HomeCard 
                title="Fazer Login" 
                icon={LogIn} 
                to="/login"
              />
            </div>
          ) : (
            <>
              {/* Operador level - all authenticated users */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                <HomeCard title="Resgate de Fauna" icon={Clipboard} to="/resgate-cadastro" />
                <HomeCard title="Crimes Ambientais" icon={Shield} to="/crimes-ambientais" />
                <HomeCard title="Material de Apoio" icon={BookOpen} to="/material-apoio" />
                <HomeCard title="Ranking de Ocorrências" icon={Trophy} to="/ranking" />
              </div>
              
              {/* Section-based access */}
              {(hasAccess(['secao_operacional']) || hasAccess(['secao_pessoas']) || hasAccess(['secao_logistica']) || isAdmin) && (
                <div className="pt-3 sm:pt-4">
                  <div className="flex items-center gap-2 text-primary font-semibold px-1 mb-3 sm:mb-4">
                    <Settings className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Seções Administrativas</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
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
