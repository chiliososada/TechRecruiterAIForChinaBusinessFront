
import React from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const CandidateHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="japanese-text">技術者詳細</DialogTitle>
      <DialogDescription className="japanese-text">
        技術者の詳細情報を表示しています
      </DialogDescription>
    </DialogHeader>
  );
};
