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
  
  // All pages now use fluid responsive container
  const isWideLayout = location.pathname === '/registros' || 
                       location.pathname === '/hotspots' ||
                       location.pathname.startsWith('/dashboard') ||
                       location.pathname.startsWith('/secao-operacional') ||
                       location.pathname.startsWith('/comando');
  
  // Responsive fluid container instead of fixed widths
  const containerClass = isWideLayout 
    ? 'w-full max-w-[1600px] mx-auto' 
    : 'w-full max-w-5xl mx-auto';

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-hidden safe-top safe-bottom">
      <Header />
      
      <ScrollArea className="flex-1">
        <main className={`px-4 sm:px-6 md:px-8 lg:px-8 xl:px-12 py-3 md:py-4 ${containerClass}`}>
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
            <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold text-foreground tracking-tight truncate">{title}</h1>
          </div>
          
          {children}
        </main>
      </ScrollArea>
    </div>
  );
};

export default Layout;
