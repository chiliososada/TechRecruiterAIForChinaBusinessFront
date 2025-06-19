
import React from 'react';
import { Engineer } from '../types';

interface CandidateRegistrationInfoProps {
  engineer: Engineer;
}

export const CandidateRegistrationInfo: React.FC<CandidateRegistrationInfoProps> = ({ engineer }) => {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium japanese-text">登録日</h4>
        <p className="japanese-text">{engineer.registeredAt}</p>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">更新日</h4>
        <p className="japanese-text">{engineer.updatedAt}</p>
      </div>
    </>
  );
};
