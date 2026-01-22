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
  Settings,
  Gavel,
  HeartHandshake
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

import type { ElementType } from 'react';

interface HomeCardProps {
  title: string;
  icon: ElementType;
  to: string;
}

const HomeCard = ({ title, icon: Icon, to }: HomeCardProps) => {
  return (
    <Link 
      to={to}
      className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-5 aspect-square rounded-xl 
        bg-primary border border-primary/50 shadow-sm
        hover:shadow-[0_0_25px_rgba(255,204,0,0.5)] hover:-translate-y-1
        transition-all duration-200 active:scale-[0.97] min-h-[100px] sm:min-h-[120px]"
    >
      <div className="p-2 sm:p-3 rounded-xl bg-accent/10 shrink-0">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-accent" />
      </div>
      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center text-primary-foreground leading-tight break-words hyphens-auto px-1">{title}</span>
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
        <div className="flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <div 
            className="relative transition-all duration-300 hover:scale-105"
            style={{
              filter: `
                drop-shadow(0 2px 4px rgba(7, 29, 73, 0.4))
                drop-shadow(0 4px 8px rgba(7, 29, 73, 0.3))
                drop-shadow(0 8px 16px rgba(7, 29, 73, 0.2))
                drop-shadow(0 16px 32px rgba(7, 29, 73, 0.15))
                drop-shadow(0 0 0 1px rgba(7, 29, 73, 0.1))
              `,
            }}
          >
            <img 
              src={logoBpma} 
              alt="Logo BPMA" 
              className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain relative z-10"
              style={{
                filter: `
                  drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))
                  drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))
                `,
              }}
            />
            {/* Efeito de brilho sutil e auto-relevo */}
            <div 
              className="absolute inset-0 rounded-full opacity-30 blur-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(7, 29, 73, 0.5) 0%, rgba(7, 29, 73, 0.2) 40%, transparent 70%)',
                transform: 'scale(1.3)',
                zIndex: 0,
              }}
            />
            {/* Efeito de luz superior para auto-relevo */}
            <div 
              className="absolute inset-0 rounded-full opacity-40 blur-sm pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                transform: 'scale(1.1)',
                zIndex: 1,
              }}
            />
          </div>
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
                <HomeCard title="Crimes Comuns" icon={Gavel} to="/crimes-comuns" />
                <HomeCard title="Atividades de Prevenção" icon={HeartHandshake} to="/atividades-prevencao" />
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

        {/* Footer with Legal Links */}
        <footer className="pt-8 pb-4 border-t border-border/30 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground">
            <Link 
              to="/politica-privacidade" 
              className="hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/politica-cookies" 
              className="hover:text-primary transition-colors"
            >
              Política de Cookies
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/termos-uso" 
              className="hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-3">
            © {new Date().getFullYear()} BPMA - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
