
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Engineer } from '../types';

interface CandidateBasicInfoProps {
  engineer: Engineer;
}

export const CandidateBasicInfo: React.FC<CandidateBasicInfoProps> = ({ engineer }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium japanese-text">氏名</h4>
        <p className="japanese-text">{engineer.name}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">区分</h4>
        <div className="flex items-center gap-2">
          <Badge 
            variant={engineer.companyType === "自社" ? "default" : "secondary"} 
            className="japanese-text"
          >
            {engineer.companyType}
          </Badge>
          {engineer.source === "メール" && (
            <Badge variant="outline" className="japanese-text">メール</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
