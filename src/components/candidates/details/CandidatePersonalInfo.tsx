
import React from 'react';
import { Flag, Cake, User, Train } from 'lucide-react';
import { Engineer } from '../types';

interface CandidatePersonalInfoProps {
  engineer: Engineer;
}

export const CandidatePersonalInfo: React.FC<CandidatePersonalInfoProps> = ({ engineer }) => {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium japanese-text">国籍</h4>
        <div className="flex items-center">
          <Flag className="h-4 w-4 mr-2" />
          <p className="japanese-text">{engineer.nationality || '未設定'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">年齢</h4>
        <div className="flex items-center">
          <Cake className="h-4 w-4 mr-2" />
          <p className="japanese-text">{engineer.age || '未設定'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">性別</h4>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          <p className="japanese-text">{engineer.gender || '未設定'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium japanese-text">最寄駅</h4>
        <div className="flex items-center">
          <Train className="h-4 w-4 mr-2" />
          <p className="japanese-text">{engineer.nearestStation || '未設定'}</p>
        </div>
      </div>
    </>
  );
};
