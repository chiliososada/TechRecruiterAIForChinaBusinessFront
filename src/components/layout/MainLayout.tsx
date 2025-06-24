
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <div className={cn(
        "fixed h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </div>
      <div className={cn(
        "w-full transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        <main className="h-screen overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
