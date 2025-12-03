
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMenu} 
            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-primary text-lg font-semibold">Gestão de Dados do BPMA</h1>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="absolute top-16 left-0 w-64 bg-card shadow-xl z-50 border border-border rounded-r-xl overflow-hidden animate-fade-in">
          <ul className="py-2">
            {[
              { to: '/', label: 'Página Inicial' },
              { to: '/resgate-cadastro', label: 'Cadastrar Resgate/Apreensão' },
              { to: '/crimes-ambientais', label: 'Crimes Ambientais' },
              { to: '/fauna-cadastro', label: 'Cadastrar Fauna' },
              { to: '/fauna-cadastrada', label: 'Fauna Cadastrada' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/hotspots', label: 'Hotspots' },
              { to: '/registros', label: 'Lista de Registros' },
              { to: '/relatorios', label: 'Relatórios' },
            ].map((item) => (
              <li key={item.to}>
                <Link 
                  to={item.to} 
                  className="block px-6 py-2.5 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
