
import { useState } from 'react';
import { toast } from '@/hooks/toast';

export const useCaseFilters = () => {
  // State for filtering
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [techKeyword, setTechKeyword] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  
  // Email date range filters
  const [emailDateFrom, setEmailDateFrom] = useState("");
  const [emailDateTo, setEmailDateTo] = useState("");

  // Reset date filters
  const resetDateFilters = () => {
    setEmailDateFrom("");
    setEmailDateTo("");
    setStartDateFrom("");
    setStartDateTo("");
    setDateRange("");
    toast({
      title: "フィルターをリセットしました",
      description: "日付フィルターがクリアされました",
    });
  };

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    techKeyword,
    setTechKeyword,
    dateRange,
    setDateRange,
    startDateFrom,
    setStartDateFrom,
    startDateTo,
    setStartDateTo,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    emailDateFrom,
    setEmailDateFrom,
    emailDateTo,
    setEmailDateTo,
    resetDateFilters
  };
};
