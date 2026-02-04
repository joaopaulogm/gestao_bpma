/// <reference path="../vite-env.d.ts" />
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ao trocar de rota (ex: clicar em Seção Logística na sidebar), rolar a área de conteúdo para o topo
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden safe-top safe-bottom">
      <Sidebar />
      <ScrollArea ref={scrollRef} className={`flex-1 ${isMobile ? 'pt-14 sm:pt-16' : ''}`}>
        <div className="min-h-full">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarLayout;
