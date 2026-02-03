import { Link } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoBpma from '@/assets/logo-bpma.svg';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewportCompact } from '@/hooks/use-viewport-compact';
import { navSections, getHomeCardItemsForSection } from '@/config/nav';
import type { NavItem } from '@/config/nav';
import type { AppRole } from '@/config/nav';
const CheckeredDivider = () => {
  const isMobile = useIsMobile();
  const count = isMobile ? 10 : 20;
  return <div className="flex gap-[2px] sm:gap-[3px]">
      {Array.from({
      length: count
    }).map((_, i) => <div key={`checkered-${i}`} className="flex flex-col gap-[2px] sm:gap-[3px]">
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 0 ? 'bg-primary' : 'bg-transparent'}`} />
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 ${i % 2 === 1 ? 'bg-primary' : 'bg-transparent'}`} />
        </div>)}
    </div>;
};
import type { ElementType } from 'react';
interface HomeCardProps {
  title: string;
  icon: ElementType;
  to: string;
}
const HomeCard = ({
  title,
  icon: Icon,
  to
}: HomeCardProps) => {
  return <Link to={to} className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl 
        bg-primary border border-primary/50
        shadow-[0_3px_0_0_#041230,0_4px_8px_rgba(0,0,0,0.3)]
        hover:shadow-[0_1px_0_0_#041230,0_3px_6px_rgba(0,0,0,0.2),0_0_12px_rgba(255,204,0,0.4)]
        hover:translate-y-[1px]
        active:shadow-[0_0px_0_0_#041230,0_1px_3px_rgba(0,0,0,0.1)]
        active:translate-y-[3px]
        transition-all duration-150 aspect-square w-[75%] mx-auto">
      <Icon className="w-[34%] h-[34%] text-accent shrink-0" />
      <span className="text-[clamp(10px,2.5vw,14px)] font-semibold text-center text-primary-foreground leading-tight break-words hyphens-auto px-1 line-clamp-2">{title}</span>
    </Link>;
};

const Index = () => {
  const { isAuthenticated, isAdmin, hasAccess } = useAuth();

  const showItem = (item: NavItem): boolean => {
    if (item.roles?.includes('guest')) return !isAuthenticated;
    if (item.roles?.includes('admin')) return isAdmin;
    if (item.roles?.length) return hasAccess(item.roles as AppRole[]);
    return true;
  };

  const compact = useViewportCompact();

  return (
    <div className={compact ? 'p-4 min-h-screen' : 'p-4 sm:p-6 md:p-6 lg:p-6 xl:p-8 min-h-screen'}>
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <div className="relative transition-all duration-300 hover:scale-105" style={{
          filter: `
                drop-shadow(0 2px 4px rgba(7, 29, 73, 0.4))
                drop-shadow(0 4px 8px rgba(7, 29, 73, 0.3))
                drop-shadow(0 8px 16px rgba(7, 29, 73, 0.2))
                drop-shadow(0 16px 32px rgba(7, 29, 73, 0.15))
                drop-shadow(0 0 0 1px rgba(7, 29, 73, 0.1))
              `
        }}>
            <img src={logoBpma} alt="Logo BPMA" className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 object-contain relative z-10" style={{
            filter: `
                  drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))
                  drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))
                `
          }} />
            <div className="absolute inset-0 rounded-full opacity-30 blur-2xl pointer-events-none" style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(7, 29, 73, 0.5) 0%, rgba(7, 29, 73, 0.2) 40%, transparent 70%)',
            transform: 'scale(1.3)',
            zIndex: 0
          }} />
            <div className="absolute inset-0 rounded-full opacity-40 blur-sm pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
            transform: 'scale(1.1)',
            zIndex: 1
          }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <CheckeredDivider />
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-[#071d49] whitespace-nowrap tracking-tight">
            Gestão - BPMA
          </h1>
          <CheckeredDivider />
        </div>
        <p className="text-muted-foreground text-base sm:text-lg px-4">Sistema de Gestão de Administrativa e Operacional</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {!isAuthenticated ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold px-1">
              <Lock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Área Restrita</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              <HomeCard title="Fazer Login" icon={LogIn} to="/login" />
            </div>
          </div>
        ) : (
          navSections
            .filter((sec) => sec.title !== 'Início')
            .map((sec) => {
              const cardItems = getHomeCardItemsForSection(sec.title).filter(showItem);
              if (cardItems.length === 0) return null;
              const SectionIcon = sec.icon;
              return (
                <div key={sec.title} className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 first:pt-0">
                  <div className="flex items-center gap-2 text-primary font-semibold px-1">
                    {SectionIcon && <SectionIcon className="h-4 w-4" />}
                    <span className="text-xs sm:text-sm">{sec.title}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {cardItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <HomeCard key={item.path} title={item.label} icon={Icon} to={item.path} />
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}

        {/* Footer with Legal Links */}
        <footer className="pt-8 pb-4 border-t border-border/30 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground">
            <Link to="/politica-privacidade" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/politica-cookies" className="hover:text-primary transition-colors">
              Política de Cookies
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/termos-uso" className="hover:text-primary transition-colors">
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