
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Clipboard, 
  PlusCircle, 
  List, 
  BarChart, 
  MapPin, 
  Table, 
  FileText, 
  LogOut,
  Home,
  Lock,
  ChevronLeft,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`h-screen bg-white border-r border-fauna-border transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <h1 className="text-fauna-blue text-lg font-medium">Gestão de Fauna</h1>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-fauna-blue p-1 rounded hover:bg-fauna-light focus:outline-none"
        >
          {isOpen ? (
            <ChevronLeft size={24} />
          ) : (
            <ChevronRight size={24} />
          )}
        </button>
      </div>
      
      <Separator />
      
      {/* Public Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <Link 
          to="/" 
          className={`flex items-center gap-3 py-2 px-3 rounded-md ${
            isActive('/') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
          } transition-colors mb-2`}
        >
          <Home size={20} />
          {isOpen && <span>Página Inicial</span>}
        </Link>
        
        {/* Cadastrar Resgate/Apreensão - Public */}
        <Link 
          to="/resgate-cadastro" 
          className={`flex items-center gap-3 py-2 px-3 rounded-md ${
            isActive('/resgate-cadastro') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
          } transition-colors mb-2`}
        >
          <Clipboard size={20} />
          {isOpen && <span>Cadastrar Resgate/Apreensão</span>}
        </Link>
        
        <Separator className="my-4" />
        
        {/* Restricted Area Section */}
        <div className="mb-2">
          <div className={`flex items-center gap-3 py-2 px-3 text-fauna-blue font-medium`}>
            <Lock size={20} />
            {isOpen && <span>Área Restrita SOI/BPMA</span>}
          </div>
          
          {!isAuthenticated ? (
            <Link 
              to="/login" 
              className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                isActive('/login') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
              } transition-colors ml-3`}
            >
              <LogIn size={20} />
              {isOpen && <span>Fazer Login</span>}
            </Link>
          ) : (
            <>
              <Link 
                to="/fauna-cadastro" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/fauna-cadastro') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <PlusCircle size={20} />
                {isOpen && <span>Cadastrar Fauna</span>}
              </Link>
              
              <Link 
                to="/fauna-cadastrada" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/fauna-cadastrada') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <List size={20} />
                {isOpen && <span>Fauna Cadastrada</span>}
              </Link>
              
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/dashboard') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <BarChart size={20} />
                {isOpen && <span>Dashboard</span>}
              </Link>
              
              <Link 
                to="/hotspots" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/hotspots') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <MapPin size={20} />
                {isOpen && <span>Hotspots</span>}
              </Link>
              
              <Link 
                to="/registros" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/registros') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <Table size={20} />
                {isOpen && <span>Lista de Registros</span>}
              </Link>
              
              <Link 
                to="/relatorios" 
                className={`flex items-center gap-3 py-2 px-3 rounded-md ${
                  isActive('/relatorios') ? 'bg-fauna-light text-fauna-blue' : 'text-gray-700 hover:bg-fauna-light hover:text-fauna-blue'
                } transition-colors ml-3`}
              >
                <FileText size={20} />
                {isOpen && <span>Relatórios</span>}
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* User Info & Logout */}
      {isAuthenticated && (
        <div className="p-4 border-t border-fauna-border">
          {isOpen && (
            <div className="mb-2 px-3 text-sm text-gray-600 truncate">
              {user?.email}
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" />
            {isOpen && "Sair"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
