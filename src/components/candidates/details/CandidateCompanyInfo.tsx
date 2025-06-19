
import React from 'react';
import { Engineer } from '../types';

interface CandidateCompanyInfoProps {
  engineer: Engineer;
  showCompanyName: boolean;
}

export const CandidateCompanyInfo: React.FC<CandidateCompanyInfoProps> = ({ 
  engineer, 
  showCompanyName 
}) => {
  if (!showCompanyName) return null;
  
  return (
    <div>
      <h4 className="text-sm font-medium japanese-text">所属会社</h4>
      <p className="japanese-text">{engineer.companyName || 'N/A'}</p>
    </div>
  );
};
