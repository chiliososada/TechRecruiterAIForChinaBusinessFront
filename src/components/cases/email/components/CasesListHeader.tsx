
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';

interface CasesListHeaderProps {
  selectAll: boolean;
  handleSelectAll: () => void;
  disabled: boolean;
  showCompanyInfo: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const CasesListHeader: React.FC<CasesListHeaderProps> = ({
  selectAll,
  handleSelectAll,
  disabled,
  showCompanyInfo,
  sortField,
  sortDirection,
  onSort
}) => {
  // Helper to render sort indicator
  const renderSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
      : <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };

  // Handle clicking on a sortable column
  const handleSortClick = (field: string) => {
    if (onSort) onSort(field);
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox 
            checked={selectAll && !disabled} 
            onCheckedChange={handleSelectAll}
            disabled={disabled}
          />
        </TableHead>
        <TableHead className="japanese-text">担当者名</TableHead>
        <TableHead className="japanese-text">担当者メール</TableHead>
        <TableHead className="japanese-text">案件名</TableHead>
        {showCompanyInfo && (
          <TableHead className="japanese-text">会社名</TableHead>
        )}
        <TableHead className="japanese-text">スキル要件</TableHead>
        <TableHead 
          className="japanese-text cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => handleSortClick('startDate')}
        >
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            参画開始日
            {renderSortIndicator('startDate')}
          </div>
        </TableHead>
        {showCompanyInfo && (
          <TableHead className="japanese-text">
            <div>登録方式</div>
            <div className="text-xs text-muted-foreground">登録時間</div>
          </TableHead>
        )}
        <TableHead className="japanese-text w-20">操作</TableHead>
      </TableRow>
    </TableHeader>
  );
};
