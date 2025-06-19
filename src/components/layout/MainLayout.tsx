
import React from 'react';
import { Sidebar } from './Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';


interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (

    <div className="flex h-screen">
      <div className="fixed h-screen">
        <Sidebar />
      </div>
      <div className="ml-64 w-full">
        <main className="h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
