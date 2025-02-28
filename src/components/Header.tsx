
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMenu} 
            className="text-fauna-blue focus:outline-none"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-fauna-blue text-xl font-medium">Gestão dos Dados de Fauna</h1>
        </div>
      </div>
      
      {/* Dotted line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-fauna-blue to-transparent opacity-30" />
      
      {isMenuOpen && (
        <nav className="absolute top-16 left-0 w-64 bg-white shadow-lg z-50 border-r border-fauna-border h-screen animate-fade-in">
          <ul className="py-4">
            <li>
              <Link 
                to="/" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Página Inicial
              </Link>
            </li>
            <li>
              <Link 
                to="/resgate-cadastro" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Cadastrar Resgate/Apreensão
              </Link>
            </li>
            <li>
              <Link 
                to="/fauna-cadastro" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Cadastrar Fauna
              </Link>
            </li>
            <li>
              <Link 
                to="/fauna-cadastrada" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Fauna Cadastrada
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/hotspots" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Hotspots
              </Link>
            </li>
            <li>
              <Link 
                to="/registros" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Lista de Registros
              </Link>
            </li>
            <li>
              <Link 
                to="/relatorios" 
                className="block px-6 py-3 hover:bg-fauna-light text-fauna-blue"
                onClick={toggleMenu}
              >
                Relatórios
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
