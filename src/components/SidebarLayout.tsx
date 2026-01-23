import React from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-background overflow-hidden safe-top safe-bottom">
      <Sidebar />
      <ScrollArea className={`flex-1 ${isMobile ? 'pt-14 sm:pt-16' : ''}`}>
        <div className="min-h-full">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarLayout;
