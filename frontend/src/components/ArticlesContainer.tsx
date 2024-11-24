import React from 'react';
import { ArticlesProvider, useArticlesContext } from './ArticlesContext';
import { AdminArticles } from './adminArticles';
import { AuxArticles } from './AuxArticles';

const ArticlesContent = () => {
  const { activeTab } = useArticlesContext();

  return (
    <>
      {activeTab === 'admin' && <AdminArticles />}
      {activeTab === 'aux' && <AuxArticles />}
    </>
  );
};

export const ArticlesContainer = () => {
  return (
    <ArticlesProvider>
      <ArticlesContent />
    </ArticlesProvider>
  );
};

