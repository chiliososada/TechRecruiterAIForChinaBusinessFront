
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStatusBadgeColor } from '../utils/statusUtils';
import { MailCase } from '../email/types';

interface CaseDetailHeaderProps {
  selectedCase: MailCase;
  toggleEditMode: () => void;
}

export const CaseDetailHeader: React.FC<CaseDetailHeaderProps> = ({
  selectedCase,
  toggleEditMode,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <CardTitle className="text-xl japanese-text font-bold">{selectedCase.title}</CardTitle>
        <Button onClick={toggleEditMode} variant="ghost" size="sm" className="hover:bg-muted">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Badge className={`${getStatusBadgeColor(selectedCase.status)} px-2 py-1`}>
          <span className="japanese-text">{selectedCase.status}</span>
        </Badge>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="japanese-text">作成日: {selectedCase.createdAt}</span>
        </div>
      </div>
    </div>
  );
};
