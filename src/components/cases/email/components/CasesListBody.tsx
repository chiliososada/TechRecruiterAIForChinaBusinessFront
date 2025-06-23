
import React, { useCallback } from 'react';
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
  console.log('CasesListBody re-render, selectedCases:', selectedCases.map(c => ({ id: c.id, selectedRowId: c.selectedRowId })));
  // Check if a sender row is selected - compare by row ID
  const isSenderRowSelected = useCallback((rowId: string) => {
    // Parse the rowId to get the case id (GUID format: 8-4-4-4-12)
    // The rowId format is: caseId-email-index
    // We need to extract the full GUID (first 5 parts when split by '-')
    const parts = rowId.split('-');
    const caseId = parts.slice(0, 5).join('-'); // Get the full GUID
    
    console.log(`=== Checking selection for rowId: ${rowId} ===`);
    console.log(`Case ID from rowId: ${caseId}`);
    console.log(`Selected cases details:`, selectedCases.map(c => ({
      id: c.id,
      selectedRowId: c.selectedRowId,
      idMatches: c.id === caseId,
      rowIdMatches: c.selectedRowId === rowId
    })));
    
    // Check if this specific row is selected by both case ID and row ID
    const isSelected = selectedCases.some(c => {
      const caseMatches = c.id === caseId;
      const rowMatches = c.selectedRowId === rowId;
      return caseMatches && rowMatches;
    });
    
    console.log(`Final result for ${rowId}: ${isSelected}`);
    return isSelected;
  }, [selectedCases]);

  return (
    <TableBody>
      {flattenedSenders.length === 0 ? (
        <TableRow>
          <TableCell colSpan={showCompanyInfo ? 8 : 6} className="text-center text-muted-foreground japanese-text">
            表示できる案件がありません
          </TableCell>
        </TableRow>
      ) : (
        flattenedSenders.map((item, index) => {
          const isSelected = isSenderRowSelected(item.rowId);
          return (
            <CasesListRow
              key={`${item.rowId}-${selectedCases.length}`}
              sender={item}
              isSelected={isSelected}
              handleSelectCase={handleSelectCase}
              showCompanyInfo={showCompanyInfo}
              onViewCase={onViewCase}
              index={index}
            />
          );
        })
      )}
    </TableBody>
  );
};
