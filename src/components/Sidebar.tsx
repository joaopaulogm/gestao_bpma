
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
  LogIn,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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

  const linkClasses = (path: string, indented = false) => cn(
    "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200",
    indented && "ml-3",
    isActive(path) 
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
  );

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col border-r border-sidebar-border",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {isOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-sm">SOI</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">BPMA</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">Gestão de Dados</span>
            </div>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors flex-shrink-0"
          aria-label={isOpen ? "Colapsar menu" : "Expandir menu"}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          <li>
            <Link to="/" className={linkClasses('/')}>
              <Home className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="truncate">Página Inicial</span>}
            </Link>
          </li>
          
          <li>
            <Link to="/resgate-cadastro" className={linkClasses('/resgate-cadastro')}>
              <Clipboard className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="truncate">Resgate de Fauna</span>}
            </Link>
          </li>
          
          <li>
            <Link to="/crimes-ambientais" className={linkClasses('/crimes-ambientais')}>
              <Shield className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="truncate">Crimes Ambientais</span>}
            </Link>
          </li>
        </ul>
        
        <Separator className="my-4 bg-sidebar-border" />
        
        {/* Restricted Area */}
        <div className="mb-2">
          <div className="flex items-center gap-3 py-2 px-3 text-sidebar-primary font-medium">
            <Lock className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="text-sm truncate">Área Restrita</span>}
          </div>
          
          <ul className="space-y-1 mt-1">
            {!isAuthenticated ? (
              <li>
                <Link to="/login" className={linkClasses('/login', true)}>
                  <LogIn className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span className="truncate">Fazer Login</span>}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/fauna-cadastro" className={linkClasses('/fauna-cadastro', true)}>
                    <PlusCircle className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Cadastrar Fauna</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/fauna-cadastrada" className={linkClasses('/fauna-cadastrada', true)}>
                    <List className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Fauna Cadastrada</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/dashboard" className={linkClasses('/dashboard', true)}>
                    <BarChart className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Dashboard</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/hotspots" className={linkClasses('/hotspots', true)}>
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Hotspots</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/registros" className={linkClasses('/registros', true)}>
                    <Table className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Lista de Registros</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/relatorios" className={linkClasses('/relatorios', true)}>
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    {isOpen && <span className="truncate">Relatórios</span>}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      
      {/* User Info & Logout */}
      {isAuthenticated && (
        <div className="p-3 border-t border-sidebar-border">
          {isOpen && user?.email && (
            <div className="mb-2 px-3 text-xs text-sidebar-foreground/70 truncate">
              {user.email}
            </div>
          )}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {isOpen && "Sair"}
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
