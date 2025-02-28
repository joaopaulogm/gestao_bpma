
import React from 'react';
import Header from './Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

const Layout = ({ children, title, showBackButton = false }: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="text-fauna-blue hover:opacity-80 focus:outline-none"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl font-medium text-fauna-blue">{title}</h1>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
