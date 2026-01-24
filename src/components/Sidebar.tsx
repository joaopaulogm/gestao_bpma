import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
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
  User,
  BookOpen,
  Settings,
  Briefcase,
  Wrench,
  Trophy,
  Menu,
  X,
  ChevronDown,
  FileText,
  Search,
  PawPrint,
  Leaf,
  TreePine,
  List,
  BarChart3,
  MapPin,
  Package,
  FolderOpen,
  FileCheck,
  Calendar,
  Palmtree,
  Gift,
  UsersRound,
  Target,
  Camera,
  ClipboardList,
  UserMinus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import NotificationsPopover from '@/components/NotificationsPopover';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles?: (AppRole | 'guest')[];
  children?: NavItem[];
}

interface NavSection {
  title: string;
  icon?: LucideIcon;
  items: NavItem[];
}

const NAVY = '#071d49';
const GOLD = '#ffcc00';

const navSections: NavSection[] = [
  {
    title: 'Início',
    items: [{ path: '/inicio', label: 'Página Inicial', icon: Home }],
  },
  {
    title: 'Atividade Operacional',
    icon: Lock,
    items: [
      { path: '/login', label: 'Fazer Login', icon: LogIn, roles: ['guest'] },
      { path: '/resgate-cadastro', label: 'Resgate de Fauna', icon: Clipboard, roles: ['operador'] },
      { path: '/crimes-ambientais', label: 'Crimes Ambientais', icon: Shield, roles: ['operador'] },
      { path: '/crimes-comuns', label: 'Crimes Comuns', icon: Shield, roles: ['operador'] },
      {
        path: '/material-apoio',
        label: 'Material de Apoio',
        icon: BookOpen,
        roles: ['operador'],
        children: [
          { path: '/material-apoio/pop', label: 'POP', icon: FileText },
          { path: '/material-apoio/identificar-especie', label: 'Identificar Espécie', icon: Search },
          { path: '/material-apoio/manual-rap', label: 'Manual RAP', icon: BookOpen },
        ],
      },
      { path: '/ranking', label: 'Ranking de Ocorrências', icon: Trophy, roles: ['operador'] },
      { path: '/atividades-prevencao', label: 'Atividades Prevenção', icon: Shield, roles: ['operador'] },
    ],
  },
  {
    title: 'Seção Operacional',
    icon: Briefcase,
    items: [
      {
        path: '/secao-operacional',
        label: 'Seção Operacional',
        icon: Briefcase,
        roles: ['secao_operacional'],
        children: [
          { path: '/secao-operacional/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/secao-operacional/resgate-cadastro', label: 'Resgate', icon: Clipboard },
          { path: '/secao-operacional/crimes-ambientais', label: 'Crimes Ambientais', icon: Shield },
          { path: '/secao-operacional/crimes-comuns', label: 'Crimes Comuns', icon: Shield },
          { path: '/secao-operacional/atividades-prevencao', label: 'Atividades Prevenção', icon: Shield },
          { path: '/secao-operacional/fauna-cadastro', label: 'Fauna — Cadastrar', icon: PawPrint },
          { path: '/secao-operacional/fauna-cadastrada', label: 'Fauna — Cadastrada', icon: List },
          { path: '/secao-operacional/flora-cadastro', label: 'Flora — Cadastrar', icon: Leaf },
          { path: '/secao-operacional/flora-cadastrada', label: 'Flora — Cadastrada', icon: TreePine },
          { path: '/secao-operacional/registros-resgates', label: 'Registros — Resgates', icon: ClipboardList },
          { path: '/secao-operacional/registros-crimes-ambientais', label: 'Registros — Crimes Amb.', icon: List },
          { path: '/secao-operacional/registros-crimes-comuns', label: 'Registros — Crimes Comuns', icon: List },
          { path: '/secao-operacional/registros-prevencao', label: 'Registros — Prevenção', icon: List },
          { path: '/secao-operacional/registros-unificados', label: 'Registros Unificados', icon: FolderOpen },
          { path: '/secao-operacional/hotspots', label: 'Hotspots', icon: MapPin },
          { path: '/secao-operacional/bens-apreendidos', label: 'Bens Apreendidos', icon: Package },
          { path: '/secao-operacional/relatorios', label: 'Relatórios', icon: FileText },
          { path: '/secao-operacional/monitorar-raps', label: 'Monitorar RAPs', icon: Camera },
          { path: '/secao-operacional/controle-os', label: 'Controle OS', icon: FileCheck },
        ],
      },
    ],
  },
  {
    title: 'Seção Pessoas',
    icon: Users,
    items: [
      {
        path: '/secao-pessoas',
        label: 'Seção Pessoas',
        icon: Users,
        roles: ['secao_pessoas'],
        children: [
          { path: '/secao-pessoas/efetivo', label: 'Efetivo', icon: UsersRound },
          { path: '/secao-pessoas/equipes', label: 'Equipes', icon: Users },
          { path: '/secao-pessoas/escalas', label: 'Escalas', icon: Calendar },
          { path: '/secao-pessoas/afastamentos', label: 'Afastamentos', icon: UserMinus },
          { path: '/secao-pessoas/licencas', label: 'Licenças', icon: FileCheck },
          { path: '/secao-pessoas/ferias', label: 'Férias', icon: Palmtree },
          { path: '/secao-pessoas/abono', label: 'Abono', icon: Gift },
          { path: '/secao-pessoas/campanha', label: 'Campanha', icon: Target },
        ],
      },
    ],
  },
  {
    title: 'Seção Logística',
    icon: Wrench,
    items: [
      { path: '/secao-logistica', label: 'Seção Logística', icon: Wrench, roles: ['secao_logistica'] },
    ],
  },
  {
    title: 'Administração',
    icon: Settings,
    items: [
      { path: '/gerenciar-permissoes', label: 'Gerenciar Permissões', icon: Settings, roles: ['admin'] },
    ],
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 36, opacity: 0 });
  const navRef = useRef<HTMLElement | null>(null);
  const { isAuthenticated, isAdmin, hasAccess, user, logout, hasGoogleLink } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setIsMobileOpen(!isMobileOpen);
    else setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && path !== '/inicio' && location.pathname.startsWith(path + '/'));

  const showItem = (item: NavItem): boolean => {
    if (item.roles?.includes('guest')) return !isAuthenticated;
    if (item.roles?.includes('admin')) return isAdmin;
    if (item.roles?.length) return hasAccess(item.roles as AppRole[]);
    return true;
  };

  const toggleOpen = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isChildActive = (path: string) =>
    path !== '/' && (location.pathname === path || location.pathname.startsWith(path + '/'));

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const pathname = location.pathname;
    const links = nav.querySelectorAll<HTMLAnchorElement>('a[data-path]');
    let best: { el: HTMLAnchorElement; path: string } | null = null;
    for (const el of links) {
      const path = el.getAttribute('data-path') || '';
      const match = pathname === path || (path !== '/' && path !== '/inicio' && pathname.startsWith(path + '/'));
      if (match && (!best || path.length > best.path.length)) best = { el, path };
    }
    if (!best) {
      setIndicatorStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const linkRect = best.el.getBoundingClientRect();
    const top = linkRect.top - navRect.top + nav.scrollTop;
    const height = linkRect.height;
    setIndicatorStyle({ top, height, opacity: 1 });
  }, [location.pathname, openKeys, isOpen, isMobile]);

  const NavLink = ({ item, isChild = false }: { item: NavItem; isChild?: boolean }) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        data-path={item.path}
        className={cn(
          'sidebar-nav-link group relative flex items-center gap-3 py-2.5 pl-3 pr-4 min-h-[44px] rounded-r-2xl transition-all duration-300 ease-out',
          isChild && 'pl-6',
          active && 'sidebar-nav-link--active'
        )}
      >
        <span
          className={cn(
            'absolute inset-y-0 left-0 rounded-r-2xl transition-all duration-300 ease-out sidebar-blob',
            active ? 'bg-[#ffcc00]/25' : 'bg-[#ffcc00]/0 group-hover:bg-[#ffcc00]/15'
          )}
          aria-hidden
        />
        <span className="relative z-10 flex items-center gap-3 min-w-0">
          <Icon className={cn('h-5 w-5 flex-shrink-0 transition-colors duration-200', active ? 'text-[#ffcc00]' : 'text-white/90 group-hover:text-[#ffcc00]')} />
          {(isOpen || isMobile) && <span className="truncate text-sm font-medium text-white/95 group-hover:text-white">{item.label}</span>}
        </span>
      </Link>
    );
  };

  const renderItem = (item: NavItem, isChild = false) => {
    if (!showItem(item)) return null;

    if (item.children?.length) {
      const hasVisibleChild = item.children.some((c) => showItem(c));
      if (!hasVisibleChild) return null;

      const key = item.path;
      const childActive = isChildActive(item.path);
      const isOpenCollapse = openKeys.has(key) || childActive;
      const showSub = isOpen || isMobile;

      return (
        <li key={item.path} className="list-none">
          <Collapsible open={isOpenCollapse} onOpenChange={() => toggleOpen(key)}>
            <div className="flex items-center rounded-r-2xl">
              <div className="flex-1 min-w-0">
                <NavLink item={item} />
              </div>
              {showSub && (
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'p-2 mr-1 rounded-lg text-white/70 hover:text-[#ffcc00] hover:bg-white/5 transition-all duration-200 flex-shrink-0',
                      isOpenCollapse && 'text-[#ffcc00]'
                    )}
                    aria-label={isOpenCollapse ? 'Recolher' : 'Expandir'}
                  >
                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isOpenCollapse && 'rotate-180')} />
                  </button>
                </CollapsibleTrigger>
              )}
            </div>
            {showSub && (
              <CollapsibleContent>
                <ul className="mt-0.5 space-y-0.5 pl-0 overflow-hidden animate-in slide-in-from-top-1 duration-200">
                  {item.children.filter(showItem).map((ch) => (
                    <li key={ch.path} className="list-none">
                      <NavLink item={ch} isChild />
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            )}
          </Collapsible>
        </li>
      );
    }

    return (
      <li key={item.path} className="list-none">
        <NavLink item={item} isChild={isChild} />
      </li>
    );
  };

  const sidebarContent = (
    <TooltipProvider>
      <div className="relative flex flex-col h-full pl-1">
        <div className="flex items-center justify-between p-4 flex-shrink-0">
          {(isOpen || isMobile) && (
            <div className="flex-1 text-center">
              <span className="font-bold text-lg text-white">Gestão - BPMA</span>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-white/80 hover:text-[#ffcc00] hover:bg-white/10 transition-all duration-200 flex-shrink-0"
              aria-label={isOpen ? 'Colapsar menu' : 'Expandir menu'}
            >
              {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-xl text-white/80 hover:text-[#ffcc00] hover:bg-white/10 transition-all"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-3 pr-2 relative sidebar-nav">
          <span
            className="absolute left-0 w-1 rounded-r-md bg-[#ffcc00] z-20 transition-[top,height,opacity] duration-300 ease-out"
            style={{ top: indicatorStyle.top, height: indicatorStyle.height, opacity: indicatorStyle.opacity }}
            aria-hidden
          />
          <div className="pl-2 space-y-4">
            {navSections.map((sec) => {
              const visibleItems = sec.items.filter(showItem);
              if (!visibleItems.length) return null;
              return (
                <div key={sec.title} className="space-y-1">
                  {(isOpen || isMobile) && (
                    <div className="flex items-center gap-2 py-1.5 px-3">
                      {sec.icon && <sec.icon className="h-4 w-4 text-[#ffcc00]/90 flex-shrink-0" />}
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{sec.title}</span>
                    </div>
                  )}
                  <ul className="space-y-0.5">
                    {visibleItems.map((item) => renderItem(item))}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>

        {isAuthenticated && (
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            {/* Banner de vinculação Google quando não vinculado */}
            {!hasGoogleLink && (isOpen || isMobile) && (
              <Link
                to="/perfil"
                className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                           border border-blue-400/30 hover:border-blue-400/50 transition-all group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-300">Vincular Google</p>
                  <p className="text-[10px] text-white/50 truncate">Login mais rápido</p>
                </div>
                <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-[#ffcc00]/20 text-[#ffcc00]">
                  Recomendado
                </span>
              </Link>
            )}
            
            <div className={cn('flex items-center gap-2 mb-2', !(isOpen || isMobile) && 'justify-center')}>
              <NotificationsPopover />
              {(isOpen || isMobile) ? (
                <Link
                  to="/perfil"
                  className={cn(
                    'flex-1 flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative',
                    isActive('/perfil') ? 'bg-[#ffcc00]/20 text-[#ffcc00]' : 'text-white/90 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Meu Perfil</span>
                  {!hasGoogleLink && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </Link>
              ) : (
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Link
                      to="/perfil"
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-xl transition-all relative',
                        isActive('/perfil') ? 'bg-[#ffcc00]/20 text-[#ffcc00]' : 'text-white/90 hover:bg-white/10'
                      )}
                    >
                      <User className="h-5 w-5" />
                      {!hasGoogleLink && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Meu Perfil {!hasGoogleLink && '• Vincular Google'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {(isOpen || isMobile) && user?.email && (
              <div className="mb-2 px-3 text-xs text-white/60 truncate">{user.email}</div>
            )}
            {(isOpen || isMobile) ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-white/90 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
                    className="w-full text-white/90 hover:text-red-300 hover:bg-red-500/10"
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
      </div>
    </TooltipProvider>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-xl shadow-lg transition-all hover:scale-105"
          style={{ background: NAVY, color: GOLD }}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setIsMobileOpen(false)} />
        )}
        <aside
          className={cn(
            'fixed top-0 left-0 h-screen z-50 flex flex-col w-72 shadow-2xl transition-transform duration-300 ease-out rounded-r-2xl overflow-hidden',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ background: NAVY }}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'h-screen flex flex-col transition-[width] duration-300 ease-out overflow-hidden rounded-r-2xl relative',
        isOpen ? 'w-72' : 'w-[4.5rem]'
      )}
      style={{ background: NAVY }}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
