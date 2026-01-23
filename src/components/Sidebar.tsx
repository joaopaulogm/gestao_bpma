import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Clipboard, 
  LogOut,
  Home,
  Lock,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Shield,
  Users,
  BookOpen,
  Settings,
  Briefcase,
  Wrench,
  Trophy,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, userRole, hasAccess, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Determinar quais seções mostrar com base no role
  const showSecaoOperacional = isAdmin || userRole === 'secao_operacional';
  const showSecaoPessoas = isAdmin || userRole === 'secao_pessoas';
  const showSecaoLogistica = isAdmin || userRole === 'secao_logistica';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const linkClasses = (path: string, indented = false) => cn(
    "flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-150 min-h-[44px]", // Apple touch target
    indented && "ml-3",
    isActive(path) 
      ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm" 
      : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-[0.98]"
  );

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {(isOpen || isMobile) && (
          <div className="flex-1 text-center">
            <span className="font-bold text-lg">Gestão - BPMA</span>
          </div>
        )}
        {!isMobile && (
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
        )}
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors flex-shrink-0"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          <li>
            <Link to="/inicio" className={linkClasses('/inicio')}>
              <Home className="h-5 w-5 flex-shrink-0" />
              {(isOpen || isMobile) && <span className="truncate">Página Inicial</span>}
            </Link>
          </li>
        </ul>
        
        <Separator className="my-4 bg-sidebar-border" />
        
        {/* Área Restrita */}
        {!isAuthenticated ? (
          <div className="mb-2">
            <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
              <Lock className="h-5 w-5 flex-shrink-0" />
              {(isOpen || isMobile) && <span className="text-sm truncate">Área Restrita</span>}
            </div>
            <ul className="space-y-1 mt-1">
              <li>
                <Link to="/login" className={linkClasses('/login', true)}>
                  <LogIn className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="truncate">Fazer Login</span>}
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <>
            {/* Atividade Operacional - TODOS os usuários autenticados */}
            <div className="mb-2">
              <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
                <Lock className="h-5 w-5 flex-shrink-0" />
                {(isOpen || isMobile) && <span className="text-sm truncate">Atividade Operacional</span>}
              </div>
              
              <ul className="space-y-1 mt-1">
                <li>
                  <Link to="/resgate-cadastro" className={linkClasses('/resgate-cadastro', true)}>
                    <Clipboard className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || isMobile) && <span className="truncate">Resgate de Fauna</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/crimes-ambientais" className={linkClasses('/crimes-ambientais', true)}>
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || isMobile) && <span className="truncate">Crimes Ambientais</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/crimes-comuns" className={linkClasses('/crimes-comuns', true)}>
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || isMobile) && <span className="truncate">Crimes Comuns</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/material-apoio" className={linkClasses('/material-apoio', true)}>
                    <BookOpen className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || isMobile) && <span className="truncate">Material de Apoio</span>}
                  </Link>
                </li>
                
                <li>
                  <Link to="/ranking" className={linkClasses('/ranking', true)}>
                    <Trophy className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || isMobile) && <span className="truncate">Ranking de Ocorrências</span>}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Seção Operacional - apenas secao_operacional ou admin */}
            {showSecaoOperacional && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
                  <Briefcase className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="text-sm truncate">Seção Operacional</span>}
                </div>
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link to="/secao-operacional" className={linkClasses('/secao-operacional', true)}>
                      <Briefcase className="h-5 w-5 flex-shrink-0" />
                      {(isOpen || isMobile) && <span className="truncate">Menu Principal</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Seção de Pessoas - apenas secao_pessoas ou admin */}
            {showSecaoPessoas && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="text-sm truncate">Seção de Pessoas</span>}
                </div>
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link to="/secao-pessoas" className={linkClasses('/secao-pessoas', true)}>
                      <Users className="h-5 w-5 flex-shrink-0" />
                      {(isOpen || isMobile) && <span className="truncate">Menu Principal</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Seção de Logística - apenas secao_logistica ou admin */}
            {showSecaoLogistica && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
                  <Wrench className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="text-sm truncate">Seção de Logística</span>}
                </div>
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link to="/secao-logistica" className={linkClasses('/secao-logistica', true)}>
                      <Wrench className="h-5 w-5 flex-shrink-0" />
                      {(isOpen || isMobile) && <span className="truncate">Menu Principal</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Administração - apenas admin */}
            {isAdmin && (
              <div className="mb-2">
                <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  {(isOpen || isMobile) && <span className="text-sm truncate">Administração</span>}
                </div>
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link to="/gerenciar-permissoes" className={linkClasses('/gerenciar-permissoes', true)}>
                      <Settings className="h-5 w-5 flex-shrink-0" />
                      {(isOpen || isMobile) && <span className="truncate">Gerenciar Permissões</span>}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </nav>
      
      {/* User Info & Logout */}
      {isAuthenticated && (
        <div className="p-3 border-t border-sidebar-border">
          {/* Link para Perfil */}
          <Link 
            to="/perfil" 
            className={cn(
              "flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-150 mb-2",
              isActive('/perfil') 
                ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm" 
                : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <User className="h-5 w-5 flex-shrink-0" />
            {(isOpen || isMobile) && <span className="truncate">Meu Perfil</span>}
          </Link>
          
          {(isOpen || isMobile) && user?.email && (
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
            {(isOpen || isMobile) && "Sair"}
          </Button>
        </div>
      )}
    </>
  );

  // Mobile: render hamburger button and overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger button */}
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        
        {/* Mobile drawer */}
        <aside 
          className={cn(
            "fixed top-0 left-0 h-screen bg-sidebar text-sidebar-foreground z-50 flex flex-col border-r border-sidebar-border transition-transform duration-200 ease-out w-72 shadow-lg",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: normal sidebar
  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground transition-all duration-200 ease-out flex flex-col border-r border-sidebar-border",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
