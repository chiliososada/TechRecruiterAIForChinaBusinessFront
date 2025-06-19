
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Briefcase, Calendar, Filter, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CaseListTable } from './CaseListTable';
import { CaseDetail } from './CaseDetail';
import { Pagination } from '@/components/ui/pagination';
import { MailCase } from '../email/types';
import { toast } from '@/hooks/toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, addMonths, startOfMonth, parse, isValid, isSameMonth, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CaseListProps {
  filteredCases: MailCase[];
  selectedCase: MailCase | null;
  setSelectedCase: (caseItem: MailCase) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  foreignerFilter: string;
  setForeignerFilter: (filter: string) => void;
  dateRange: string;
  setDateRange: (date: string) => void;
  resetDateFilters: () => void;
  casesCurrentPage: number;
  setCasesCurrentPage: (page: number) => void;
  totalCasesPages: number;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  editingCaseData: MailCase | null;
  setEditingCaseData: (caseItem: MailCase | null) => void;
  handleEditChange: (field: string, value: any) => void;
  handleSaveEdit: () => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void; // Add sort handlers from parent
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const CaseList: React.FC<CaseListProps> = ({
  filteredCases,
  selectedCase,
  setSelectedCase,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  foreignerFilter,
  setForeignerFilter,
  dateRange,
  setDateRange,
  resetDateFilters,
  casesCurrentPage,
  setCasesCurrentPage,
  totalCasesPages,
  editMode,
  setEditMode,
  editingCaseData,
  setEditingCaseData,
  handleEditChange,
  handleSaveEdit,
  onSort,
  sortField = "startDate",
  sortDirection = "asc"
}) => {
  const itemsPerPage = 10;
  
  // New state for date filter option
  const [dateFilterOption, setDateFilterOption] = useState<string>("none");
  
  // Handle date filter option change
  const handleDateFilterOptionChange = (value: string) => {
    setDateFilterOption(value);
    
    // Set appropriate date based on option
    const today = new Date();
    
    switch(value) {
      case "immediate":
        // Today
        setDateRange(format(today, 'yyyy-MM-dd'));
        break;
      case "thisMonth":
        // First day of current month
        setDateRange(format(startOfMonth(today), 'yyyy-MM-dd'));
        break;
      case "nextMonth":
        // First day of next month
        setDateRange(format(startOfMonth(addMonths(today, 1)), 'yyyy-MM-dd'));
        break;
      case "none":
      default:
        setDateRange("");
        break;
    }
  };
  
  // Reset date option when date is manually changed
  useEffect(() => {
    if (!dateRange) {
      setDateFilterOption("none");
    }
  }, [dateRange]);

  // Handle sorting - forward to parent component
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    if (onSort) {
      onSort(field, direction);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 bg-muted/5 border-b">
        <CardTitle className="japanese-text flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-primary" />
          案件一覧
        </CardTitle>
        <CardDescription className="japanese-text">
          登録済みの案件一覧と詳細を表示します
        </CardDescription>
        
        {/* Redesigned filter section */}
        <div className="mt-6 space-y-5 rounded-lg border p-4 bg-white shadow-sm">
          {/* Search and status filter - first row */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="case-search" className="text-sm font-medium japanese-text flex items-center">
                <Search className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                検索
              </Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="case-search"
                  placeholder="案件名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="japanese-text pl-9 border-muted focus:border-primary transition-colors"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48 space-y-1.5">
              <Label htmlFor="status-filter" className="text-sm font-medium japanese-text flex items-center">
                <Badge variant="outline" className="h-3.5 mr-1.5 py-0 text-muted-foreground">募集状態</Badge>
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" className="japanese-text border-muted focus:border-primary transition-colors">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="japanese-text">すべて</SelectItem>
                  <SelectItem value="募集中" className="japanese-text">募集中</SelectItem>
                  <SelectItem value="募集完了" className="japanese-text">募集完了</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48 space-y-1.5">
              <Label htmlFor="foreigner-filter" className="text-sm font-medium japanese-text flex items-center">
                <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                外国人
              </Label>
              <Select value={foreignerFilter} onValueChange={setForeignerFilter}>
                <SelectTrigger id="foreigner-filter" className="japanese-text border-muted focus:border-primary transition-colors">
                  <SelectValue placeholder="外国人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="japanese-text">すべて</SelectItem>
                  <SelectItem value="accepted" className="japanese-text">可</SelectItem>
                  <SelectItem value="notAccepted" className="japanese-text">不可</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Date filter - second row */}
          <div className="space-y-3">
            <Label className="text-sm font-medium japanese-text flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              参画開始日
            </Label>
            
            <div className="flex flex-wrap gap-4">
              <RadioGroup 
                value={dateFilterOption} 
                onValueChange={handleDateFilterOptionChange} 
                className="flex flex-wrap gap-x-5 gap-y-2"
              >
                <div className="flex items-center space-x-2 bg-muted/10 px-3 py-1.5 rounded-md">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="japanese-text text-sm cursor-pointer">即日</Label>
                </div>
                <div className="flex items-center space-x-2 bg-muted/10 px-3 py-1.5 rounded-md">
                  <RadioGroupItem value="thisMonth" id="thisMonth" />
                  <Label htmlFor="thisMonth" className="japanese-text text-sm cursor-pointer">本月内</Label>
                </div>
                <div className="flex items-center space-x-2 bg-muted/10 px-3 py-1.5 rounded-md">
                  <RadioGroupItem value="nextMonth" id="nextMonth" />
                  <Label htmlFor="nextMonth" className="japanese-text text-sm cursor-pointer">来月開始可能</Label>
                </div>
                <div className="flex items-center space-x-2 bg-muted/10 px-3 py-1.5 rounded-md">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="japanese-text text-sm cursor-pointer">指定なし</Label>
                </div>
              </RadioGroup>
              
              <div className="flex flex-1 items-center gap-2 mt-1">
                <div className="relative flex-1">
                  <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      if (e.target.value) {
                        setDateFilterOption("none");
                      }
                    }}
                    className="pl-9 border-muted focus:border-primary transition-colors"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetDateFilters}
                  className="japanese-text border-muted hover:bg-muted/20 transition-colors whitespace-nowrap"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  リセット
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 案件一覧テーブル（左側 - 1/2幅） */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-md h-full flex flex-col">
              <CaseListTable 
                paginatedCases={filteredCases} 
                selectedCase={selectedCase} 
                onSelectCase={setSelectedCase}
                onSort={handleSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              
              {/* 案件一覧のページネーション */}
              <div className="mt-4 flex justify-center">
                <Pagination 
                  currentPage={casesCurrentPage} 
                  totalPages={totalCasesPages} 
                  onPageChange={setCasesCurrentPage} 
                />
              </div>
            </div>
          </div>
          
          {/* 案件詳細表示部分（右側 - 1/2幅） */}
          <div className="lg:w-1/2">
            <CaseDetail 
              selectedCase={selectedCase}
              editMode={editMode}
              setEditMode={setEditMode}
              editingCaseData={editingCaseData}
              handleEditChange={handleEditChange}
              handleSaveEdit={handleSaveEdit}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
