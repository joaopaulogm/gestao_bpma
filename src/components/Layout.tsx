import React from 'react';
import Header from './Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

const Layout = ({ children, title, showBackButton = false }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use wider layout for registros and hotspots pages
  const isRegistrosPage = location.pathname === '/registros';
  const isHotspotsPage = location.pathname === '/hotspots';
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard');
  const maxWidthClass = (isRegistrosPage || isHotspotsPage || isDashboardPage) 
    ? 'max-w-full lg:max-w-[98%] xl:max-w-[95%]' 
    : 'max-w-4xl';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-hidden safe-top safe-bottom">
      <Header />
      
      <ScrollArea className="flex-1">
        <main className={`p-3 sm:p-4 md:p-6 ${maxWidthClass} mx-auto w-full`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 sm:p-2.5 rounded-xl text-primary hover:bg-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.97] touch-target flex-shrink-0"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground tracking-tight truncate">{title}</h1>
          </div>
          
          {children}
        </main>
      </ScrollArea>
    </div>
  );
};

export default Layout;
