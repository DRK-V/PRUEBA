import React, { createContext, useState, useContext } from 'react';

type TabType = 'admin' | 'aux';

interface ArticlesContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const useArticlesContext = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticlesContext must be used within an ArticlesProvider');
  }
  return context;
};

export const ArticlesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('admin');

  return (
    <ArticlesContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ArticlesContext.Provider>
  );
};

