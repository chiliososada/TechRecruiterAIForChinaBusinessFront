
import { useState } from 'react';

export const usePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [casesCurrentPage, setCasesCurrentPage] = useState(1);
  const itemsPerPage = 10;

  return {
    currentPage,
    setCurrentPage,
    casesCurrentPage,
    setCasesCurrentPage,
    itemsPerPage
  };
};
