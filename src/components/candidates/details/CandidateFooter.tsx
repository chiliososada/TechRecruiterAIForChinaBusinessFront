
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';

interface CandidateFooterProps {
  onClose: () => void;
  onEditClick: () => void;
}

export const CandidateFooter: React.FC<CandidateFooterProps> = ({ 
  onClose, 
  onEditClick 
}) => {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose} className="japanese-text">
        閉じる
      </Button>
      <Button onClick={onEditClick} className="japanese-text">
        <Edit className="mr-2 h-4 w-4" />
        編集
      </Button>
    </DialogFooter>
  );
};
