
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className={`flex-1 p-2 sm:p-4 ${maxWidthClass} mx-auto w-full`}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="text-fauna-blue hover:opacity-80 focus:outline-none"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-medium text-fauna-blue">{title}</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
