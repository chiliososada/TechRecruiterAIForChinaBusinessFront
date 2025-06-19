
import React from 'react';
import { Engineer } from '../types';

interface CandidateContactInfoProps {
  engineer: Engineer;
}

export const CandidateContactInfo: React.FC<CandidateContactInfoProps> = ({ engineer }) => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <h4 className="text-sm font-medium mb-2 japanese-text">連絡先情報</h4>
      <p className="text-muted-foreground text-sm japanese-text">プライバシー保護のため、連絡先情報は表示されません</p>
    </div>
  );
};
