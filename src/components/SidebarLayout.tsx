import React from 'react';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
