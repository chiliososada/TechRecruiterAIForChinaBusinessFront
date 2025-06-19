
import React from 'react';

interface CasesHeaderProps {
  pageTitle: string;
}

export const CasesHeader: React.FC<CasesHeaderProps> = ({ pageTitle }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight japanese-text">{pageTitle}</h2>
    </div>
  );
};
