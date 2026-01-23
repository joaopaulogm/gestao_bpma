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
import NotificationsPopover from '@/components/NotificationsPopover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Inicia fechada
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false); // Permite fixar aberta
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, userRole, hasAccess, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // A sidebar está expandida se estiver fixada OU sendo hovereada
  const isExpanded = isPinned || isHovered;

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

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Link com tooltip para quando sidebar está colapsada
  const SidebarLink = ({ 
    to, 
    icon: Icon, 
    label, 
    indented = false 
  }: { 
    to: string; 
    icon: React.ElementType; 
    label: string; 
    indented?: boolean;
  }) => {
    const linkContent = (
      <Link 
        to={to} 
        className={cn(
          "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-150 min-h-[44px]",
          indented && isExpanded && "ml-3",
          isActive(to) 
            ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm" 
            : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-[0.98]"
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {isExpanded && <span className="truncate whitespace-nowrap">{label}</span>}
      </Link>
    );

    // Mostrar tooltip apenas quando sidebar está colapsada
    if (!isExpanded) {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  // Header de seção com ícone
  const SectionHeader = ({ 
    icon: Icon, 
    label 
  }: { 
    icon: React.ElementType; 
    label: string; 
  }) => {
    if (!isExpanded) {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center py-2 px-3 text-primary">
              <Icon className="h-5 w-5 flex-shrink-0" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div className="flex items-center gap-3 py-2 px-3 text-primary font-semibold">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="text-sm truncate whitespace-nowrap">{label}</span>
      </div>
    );
  };

  const sidebarContent = (
    <TooltipProvider>
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        {isExpanded && (
          <div className="flex-1 text-center overflow-hidden">
            <span className="font-bold text-lg whitespace-nowrap">Gestão - BPMA</span>
          </div>
        )}
        {!isMobile && (
          <button 
            onClick={togglePin} 
            className={cn(
              "p-2 rounded-lg hover:bg-sidebar-accent transition-colors flex-shrink-0",
              !isExpanded && "mx-auto"
            )}
            aria-label={isPinned ? "Desafixar menu" : "Fixar menu"}
          >
            {isPinned ? (
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
            <SidebarLink to="/inicio" icon={Home} label="Página Inicial" />
          </li>
        </ul>
        
        <Separator className="my-4 bg-sidebar-border" />
        
        {/* Área Restrita */}
        {!isAuthenticated ? (
          <div className="mb-2">
            <SectionHeader icon={Lock} label="Área Restrita" />
            <ul className="space-y-1 mt-1">
              <li>
                <SidebarLink to="/login" icon={LogIn} label="Fazer Login" indented />
              </li>
            </ul>
          </div>
        ) : (
          <>
            {/* Atividade Operacional - TODOS os usuários autenticados */}
            <div className="mb-2">
              <SectionHeader icon={Lock} label="Atividade Operacional" />
              
              <ul className="space-y-1 mt-1">
                <li>
                  <SidebarLink to="/resgate-cadastro" icon={Clipboard} label="Resgate de Fauna" indented />
                </li>
                <li>
                  <SidebarLink to="/crimes-ambientais" icon={Shield} label="Crimes Ambientais" indented />
                </li>
                <li>
                  <SidebarLink to="/crimes-comuns" icon={Shield} label="Crimes Comuns" indented />
                </li>
                <li>
                  <SidebarLink to="/material-apoio" icon={BookOpen} label="Material de Apoio" indented />
                </li>
                <li>
                  <SidebarLink to="/ranking" icon={Trophy} label="Ranking de Ocorrências" indented />
                </li>
              </ul>
            </div>

            {/* Seção Operacional - apenas secao_operacional ou admin */}
            {showSecaoOperacional && (
              <div className="mb-2">
                <SectionHeader icon={Briefcase} label="Seção Operacional" />
                <ul className="space-y-1 mt-1">
                  <li>
                    <SidebarLink to="/secao-operacional" icon={Briefcase} label="Menu Principal" indented />
                  </li>
                </ul>
              </div>
            )}
            
            {/* Seção de Pessoas - apenas secao_pessoas ou admin */}
            {showSecaoPessoas && (
              <div className="mb-2">
                <SectionHeader icon={Users} label="Seção de Pessoas" />
                <ul className="space-y-1 mt-1">
                  <li>
                    <SidebarLink to="/secao-pessoas" icon={Users} label="Menu Principal" indented />
                  </li>
                </ul>
              </div>
            )}
            
            {/* Seção de Logística - apenas secao_logistica ou admin */}
            {showSecaoLogistica && (
              <div className="mb-2">
                <SectionHeader icon={Wrench} label="Seção de Logística" />
                <ul className="space-y-1 mt-1">
                  <li>
                    <SidebarLink to="/secao-logistica" icon={Wrench} label="Menu Principal" indented />
                  </li>
                </ul>
              </div>
            )}
            
            {/* Administração - apenas admin */}
            {isAdmin && (
              <div className="mb-2">
                <SectionHeader icon={Settings} label="Administração" />
                <ul className="space-y-1 mt-1">
                  <li>
                    <SidebarLink to="/gerenciar-permissoes" icon={Settings} label="Gerenciar Permissões" indented />
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
          {/* Notificações e Perfil */}
          <div className={cn("flex items-center gap-2 mb-2", !isExpanded && "flex-col")}>
            <NotificationsPopover />
            {isExpanded ? (
              <Link 
                to="/perfil" 
                className={cn(
                  "flex-1 flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-150",
                  isActive('/perfil') 
                    ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm" 
                    : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <User className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Meu Perfil</span>
              </Link>
            ) : (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Link 
                    to="/perfil" 
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-xl transition-all duration-150",
                      isActive('/perfil') 
                        ? "bg-sidebar-active text-sidebar-active-foreground font-medium shadow-sm" 
                        : "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Meu Perfil</TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {isExpanded && user?.email && (
            <div className="mb-2 px-3 text-xs text-sidebar-foreground/70 truncate">
              {user.email}
            </div>
          )}
          
          {isExpanded ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          ) : (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sair</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </TooltipProvider>
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

  // Desktop: sidebar com hover-to-expand
  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-out flex flex-col border-r border-sidebar-border shadow-sm",
        isExpanded ? "w-64" : "w-[68px]"
      )}
      onMouseEnter={() => !isPinned && setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
