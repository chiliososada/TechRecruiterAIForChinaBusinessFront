
import React from 'react';
import { Pagination } from '@/components/ui/pagination';

interface EngineerSearchPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const EngineerSearchPagination: React.FC<EngineerSearchPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-center">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default EngineerSearchPagination;
