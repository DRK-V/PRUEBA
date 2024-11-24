'use client'

import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
};
