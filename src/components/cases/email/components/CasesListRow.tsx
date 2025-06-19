
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MailCase } from '../types';

interface CasesListRowProps {
  sender: {
    caseId: string;
    caseTitle: string;
    company: string;
    keyTechnologies: string;
    sender: string;
    email: string;
    position?: string;
    registrationType?: string;
    registeredAt?: string;
    startDate?: string; // Add startDate property
    originalCase: MailCase;
    rowId: string;
  };
  isSelected: boolean;
  handleSelectCase: (id: string, rowId: string) => void;
  showCompanyInfo: boolean;
  onViewCase?: (caseItem: MailCase) => void;
  index: number;
}

export const CasesListRow: React.FC<CasesListRowProps> = ({
  sender,
  isSelected,
  handleSelectCase,
  showCompanyInfo,
  onViewCase,
  index
}) => {
  // Handle selection of a specific sender row using rowId
  const handleSelect = () => {
    handleSelectCase(sender.caseId, sender.rowId);
  };

  // Handle row click for selection
  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row selection when clicking on buttons or checkboxes
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('[role="checkbox"]'))
    ) {
      return;
    }
    handleSelect();
  };

  return (
    <TableRow 
      key={sender.rowId || `${sender.caseId}-${sender.sender}-${index}`}
      onClick={handleRowClick}
      className={`cursor-pointer ${isSelected ? 'bg-primary/5' : ''} hover:bg-muted/20`}
    >
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={handleSelect}
        />
      </TableCell>
      <TableCell className="font-medium japanese-text">
        {sender.sender || '送信者なし'}
        {sender.position && (
          <span className="ml-1 text-xs text-muted-foreground">({sender.position})</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {sender.email || '-'}
      </TableCell>
      <TableCell className="japanese-text">{sender.caseTitle}</TableCell>
      {showCompanyInfo && (
        <TableCell className="japanese-text">{sender.company}</TableCell>
      )}
      <TableCell className="japanese-text">{sender.keyTechnologies}</TableCell>
      <TableCell className="japanese-text text-sm">
        {sender.startDate ? (
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span>{sender.startDate}</span>
          </div>
        ) : '-'}
      </TableCell>
      {showCompanyInfo && (
        <TableCell className="japanese-text">
          <div className={`px-2 py-0.5 rounded text-xs inline-flex 
            ${sender.registrationType === "自動（メール）" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
            {sender.registrationType || "手動"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {sender.registeredAt && format(new Date(sender.registeredAt), 'yyyy-MM-dd HH:mm')}
          </div>
        </TableCell>
      )}
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewCase) onViewCase(sender.originalCase);
          }}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">詳細を見る</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};
