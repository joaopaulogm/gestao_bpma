import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-background border-b border-border/50">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMenu} 
            className="p-2.5 rounded-xl text-primary hover:bg-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.97] min-h-[44px] min-w-[44px]"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-primary text-lg font-semibold tracking-tight">Gestão de Dados do BPMA</h1>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="absolute top-16 left-0 w-64 bg-card shadow-lg z-50 border border-border rounded-r-xl overflow-hidden animate-fade-in">
          <ul className="py-2">
            {[
              { to: '/', label: 'Página Inicial' },
              { to: '/secao-operacional', label: 'Seção Operacional' },
              { to: '/material-apoio', label: 'Material de Apoio' },
              { to: '/ranking', label: 'Ranking de Ocorrências' },
            ].map((item) => (
              <li key={item.to}>
                <Link 
                  to={item.to} 
                  className="block px-6 py-3 text-foreground hover:bg-muted transition-all duration-150 min-h-[44px] flex items-center active:scale-[0.98]"
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
