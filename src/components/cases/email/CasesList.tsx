
import React, { useState } from 'react';
import { Table } from '@/components/ui/table';
import { MailCase } from './types';
import { CasesListHeader } from './components/CasesListHeader';
import { CasesListBody } from './components/CasesListBody';
import { CasesListPagination } from './components/CasesListPagination';
import { useSenderMapper } from './components/SenderMapper';

interface CasesListProps {
  paginatedCases: MailCase[];
  selectedCases: MailCase[]; 
  handleSelectCase: (id: string, rowId: string) => void;
  selectAll: boolean;
  handleSelectAll: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  showCompanyInfo?: boolean;
  onViewCase?: (caseItem: MailCase) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

export const CasesList: React.FC<CasesListProps> = ({
  paginatedCases,
  selectedCases,
  handleSelectCase,
  selectAll,
  handleSelectAll,
  currentPage,
  setCurrentPage,
  totalPages,
  showCompanyInfo = false,
  onViewCase,
  onSort
}) => {
  // Add state for sorting
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  // Use the custom hook to get flattened senders
  const { flattenedSenders } = useSenderMapper({ paginatedCases });

  // Handle sorting
  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortField(field);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(field, newDirection);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <CasesListHeader 
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          disabled={flattenedSenders.length === 0}
          showCompanyInfo={showCompanyInfo}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <CasesListBody 
          flattenedSenders={flattenedSenders}
          selectedCases={selectedCases}
          handleSelectCase={handleSelectCase}
          showCompanyInfo={showCompanyInfo}
          onViewCase={onViewCase}
        />
      </Table>
      
      <CasesListPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
