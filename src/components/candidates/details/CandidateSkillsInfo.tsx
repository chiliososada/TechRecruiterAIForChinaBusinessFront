
import React from 'react';
import { Engineer } from '../types';

interface CandidateSkillsInfoProps {
  engineer: Engineer;
}

export const CandidateSkillsInfo: React.FC<CandidateSkillsInfoProps> = ({ engineer }) => {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium japanese-text">スキル</h4>
        <p className="japanese-text">{engineer.skills && engineer.skills.join(', ')}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">資格</h4>
        <p className="japanese-text">{engineer.certifications ? (Array.isArray(engineer.certifications) ? engineer.certifications.join(', ') : engineer.certifications) : '未設定'}</p>
      </div>
    </>
  );
};
