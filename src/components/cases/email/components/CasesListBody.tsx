
import React from 'react';
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { CasesListRow } from './CasesListRow';
import { MailCase } from '../types';

interface CasesListBodyProps {
  flattenedSenders: {
    caseId: string;
    caseTitle: string;
    company: string;
    keyTechnologies: string;
    sender: string;
    email: string;
    position?: string;
    registrationType?: string;
    registeredAt?: string;
    originalCase: MailCase;
    rowId: string;
    startDate?: string; // Add startDate property
  }[];
  selectedCases: MailCase[];
  handleSelectCase: (id: string, rowId: string) => void;
  showCompanyInfo: boolean;
  onViewCase?: (caseItem: MailCase) => void;
}

export const CasesListBody: React.FC<CasesListBodyProps> = ({
  flattenedSenders,
  selectedCases,
  handleSelectCase,
  showCompanyInfo,
  onViewCase
}) => {
  // Check if a sender row is selected - compare by row ID
  const isSenderRowSelected = (rowId: string) => {
    // Parse the rowId to get the case id
    const caseId = rowId.split('-')[0];
    // Check if this specific row is selected
    return selectedCases.some(c => c.id === caseId && c.selectedRowId === rowId);
  };

  return (
    <TableBody>
      {flattenedSenders.length === 0 ? (
        <TableRow>
          <TableCell colSpan={showCompanyInfo ? 8 : 6} className="text-center text-muted-foreground japanese-text">
            表示できる案件がありません
          </TableCell>
        </TableRow>
      ) : (
        flattenedSenders.map((item, index) => (
          <CasesListRow
            key={item.rowId || `${item.caseId}-${item.sender}-${index}`}
            sender={item}
            isSelected={isSenderRowSelected(item.rowId)}
            handleSelectCase={handleSelectCase}
            showCompanyInfo={showCompanyInfo}
            onViewCase={onViewCase}
            index={index}
          />
        ))
      )}
    </TableBody>
  );
};
