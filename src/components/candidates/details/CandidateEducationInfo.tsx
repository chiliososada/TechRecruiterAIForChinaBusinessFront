
import React from 'react';
import { Engineer } from '../types';

interface CandidateEducationInfoProps {
  engineer: Engineer;
}

export const CandidateEducationInfo: React.FC<CandidateEducationInfoProps> = ({ engineer }) => {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium japanese-text">学歴</h4>
        <p className="japanese-text">{engineer.education || '未設定'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">来日年度</h4>
        <p className="japanese-text">{engineer.arrivalYear || '未設定'}</p>
      </div>
    </>
  );
};
