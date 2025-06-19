
import React from 'react';
import { Engineer } from '../types';

interface CandidateNotesProps {
  engineer: Engineer;
}

export const CandidateNotes: React.FC<CandidateNotesProps> = ({ engineer }) => {
  return (
    <>
      <div className="col-span-2">
        <h4 className="text-sm font-medium japanese-text">自己アピール</h4>
        <p className="japanese-text">{engineer.selfPromotion || '未設定'}</p>
      </div>
      
      <div className="col-span-2">
        <h4 className="text-sm font-medium japanese-text">備考</h4>
        <p className="japanese-text">{engineer.remarks}</p>
      </div>
    </>
  );
};
