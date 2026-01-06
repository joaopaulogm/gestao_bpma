
import React from 'react';
import Header from './Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const maxWidthClass = (isRegistrosPage || isHotspotsPage) ? 'max-w-full lg:max-w-[95%]' : 'max-w-4xl';

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      <main className={`flex-1 p-5 sm:p-6 ${maxWidthClass} mx-auto w-full overflow-y-auto`}>
        <div className="flex items-center gap-3 mb-6">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-xl text-primary hover:bg-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.97] min-h-[44px] min-w-[44px]"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">{title}</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
