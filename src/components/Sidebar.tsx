import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Clipboard,
  LogOut,
  Lock,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Menu,
  X,
  ChevronDown,
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
import { navSections } from '@/config/nav';
import type { NavItem } from '@/config/nav';
import type { AppRole } from '@/config/nav';

const NAVY = '#071d49';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  /** Seções que o usuário fechou manualmente; permite recolher mesmo com filho ativo */
  const [forceClosed, setForceClosed] = useState<Set<string>>(() => new Set());
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 36, opacity: 0 });
  const navRef = useRef<HTMLElement | null>(null);
  const sidebarContentRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, isAdmin, hasAccess, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setForceClosed((prev) => {
      let changed = false;
      const next = new Set(prev);
      next.forEach((key) => {
        if (!(location.pathname === key || location.pathname.startsWith(key + '/'))) {
          next.delete(key);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Oculta nós do DOM cujo texto corresponda a um padrão específico (conteúdo sensível).
  useEffect(() => {
    const root = sidebarContentRef.current;
    if (!root) return;
    const matcher = /n[ãa]o se trata de uma quest[aã]o de/i;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodesToHide: HTMLElement[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const text = node.textContent?.trim() || '';
      if (text && matcher.test(text)) {
        const parent = node.parentElement;
        if (parent && !nodesToHide.includes(parent)) nodesToHide.push(parent);
      }
    }
    nodesToHide.forEach((el) => {
      el.style.display = 'none';
    });
  }, [isOpen, isMobile, isMobileOpen, user?.email]);

  const toggleSidebar = () => {
    if (isMobile) setIsMobileOpen(!isMobileOpen);
    else setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && path !== '/area-do-operador' && location.pathname.startsWith(path + '/'));

  // ADMIN vê todos os itens do menu (hasAccess já retorna true para admin).
  const showItem = (item: NavItem): boolean => {
    if (item.roles?.includes('guest')) return !isAuthenticated;
    if (item.roles?.includes('admin')) return isAdmin;
    if (item.roles?.length) return hasAccess(item.roles as AppRole[]);
    return true;
  };

  const setSectionOpen = (key: string, open: boolean) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (open) {
        next.add(key);
        setForceClosed((f) => {
          const n = new Set(f);
          n.delete(key);
          return n;
        });
      } else {
        next.delete(key);
        setForceClosed((f) => new Set(f).add(key));
      }
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
      const match = pathname === path || (path !== '/' && path !== '/area-do-operador' && pathname.startsWith(path + '/'));
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
      const userClosed = forceClosed.has(key);
      const isOpenCollapse = (openKeys.has(key) || childActive) && !userClosed;
      const showSub = isOpen || isMobile;

      return (
        <li key={item.path} className="list-none">
          <Collapsible open={isOpenCollapse} onOpenChange={(open) => setSectionOpen(key, open)}>
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
      <div ref={sidebarContentRef} className="relative flex flex-col h-full pl-1">
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
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Meu Perfil
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
          style={{ background: NAVY, color: '#ffcc00' }}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        {isMobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setIsMobileOpen(false)} />
        )}
        <aside
          className={cn(
            'fixed top-0 left-0 h-screen z-50 flex flex-col w-64 xl:w-72 shadow-2xl transition-transform duration-300 ease-out rounded-r-2xl overflow-hidden',
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
        isOpen ? 'w-64 xl:w-72' : 'w-[4.5rem]'
      )}
      style={{ background: NAVY }}
    >
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
