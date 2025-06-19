
import React from 'react';
import { Engineer } from '../types';

interface CandidateWorkInfoProps {
  engineer: Engineer;
}

export const CandidateWorkInfo: React.FC<CandidateWorkInfoProps> = ({ engineer }) => {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium japanese-text">経験年数</h4>
        <p className="japanese-text">{engineer.experience}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">日本語レベル</h4>
        <p className="japanese-text">{engineer.japaneseLevel}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">英語レベル</h4>
        <p className="japanese-text">{engineer.englishLevel || '未設定'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">業務範囲</h4>
        <p className="japanese-text">{engineer.workScope || '未設定'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">業務経験</h4>
        <p className="japanese-text">{engineer.workExperience || '未設定'}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">稼働可能時期</h4>
        <p className="japanese-text">{engineer.availability}</p>
      </div>
    </>
  );
};
