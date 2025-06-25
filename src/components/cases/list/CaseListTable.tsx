
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, Calendar, Briefcase, Code, CircleDollarSign, FileCode, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { MailCase } from '../email/types';
import { getStatusBadgeColor, normalizeStatus } from '../utils/statusUtils';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

interface CaseListTableProps {
  paginatedCases: MailCase[];
  selectedCase: MailCase | null;
  onSelectCase: (caseItem: MailCase) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const CaseListTable: React.FC<CaseListTableProps> = ({ 
  paginatedCases, 
  selectedCase, 
  onSelectCase,
  onSort,
  sortField,
  sortDirection
}) => {
  const location = useLocation();
  // Make sure we correctly detect the other company view
  const isOtherCompany = location.pathname.includes('/company/other');
  
  console.log('=== DEBUG: CaseListTable render ===');
  console.log('Paginated cases received (titles):', paginatedCases.map(c => ({ id: c.id, title: c.title })));
  console.log('Selected case:', selectedCase ? { id: selectedCase.id, title: selectedCase.title } : null);

  // Check if there's a mismatch between the selected case and the case data in the list
  if (selectedCase) {
    const caseInList = paginatedCases.find(c => c.id === selectedCase.id);
    if (caseInList) {
      console.log('=== DEBUG: Data comparison for selected case ===');
      console.log('Selected case title (right side):', selectedCase.title);
      console.log('Same case in list title (left side):', caseInList.title);
      console.log('Titles match:', selectedCase.title === caseInList.title);
    }
  }

  // Handler for clicking on a sortable column header
  const handleSortClick = (field: string) => {
    if (!onSort) return;
    
    // If clicking the same field, toggle direction
    if (field === sortField) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for a new field
      onSort(field, 'asc');
    }
  };

  // Helper to render sort indicator
  const renderSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
      : <ArrowDown className="ml-1 h-4 w-4 inline" />;
  };

  return (
    <div className="rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="japanese-text font-medium">案件名</TableHead>
            {isOtherCompany && (
              <TableHead className="japanese-text font-medium">会社名</TableHead>
            )}
            <TableHead 
              className="japanese-text font-medium cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => handleSortClick('startDate')}
            >
              <div className="flex items-center">
                参画開始日
                {renderSortIndicator('startDate')}
              </div>
            </TableHead>
            <TableHead className="japanese-text font-medium">勤務地</TableHead>
            <TableHead className="japanese-text font-medium">スキル要件</TableHead>
            <TableHead className="japanese-text font-medium">作業範囲</TableHead>
            <TableHead className="japanese-text font-medium">面談回数</TableHead>
            <TableHead className="japanese-text font-medium">予算</TableHead>
            <TableHead className="japanese-text font-medium">外国人</TableHead>
            <TableHead className="japanese-text font-medium">ステータス</TableHead>
            <TableHead className="japanese-text font-medium">希望単価</TableHead>
            <TableHead className="japanese-text font-medium">個人事業者</TableHead>
            {isOtherCompany && (
              <TableHead className="japanese-text font-medium">元データ</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCases.map((item) => {
            // Ensure the case status is one of the valid values
            const normalizedStatus = normalizeStatus(item.status);
            
            console.log(`=== DEBUG: Rendering table row for case ${item.id} ===`);
            console.log(`Title: "${item.title}"`);
            console.log(`Is selected: ${selectedCase?.id === item.id}`);
            
            return (
              <TableRow 
                key={item.id} 
                className={`${selectedCase?.id === item.id ? "bg-primary/5 border-l-4 border-l-primary" : ""} hover:bg-muted/20 transition-colors`}
                onClick={() => onSelectCase(item)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell className="font-medium japanese-text">{item.title}</TableCell>
                {isOtherCompany && (
                  <TableCell className="japanese-text">{item.company || "-"}</TableCell>
                )}
                <TableCell className="japanese-text text-sm">
                  {item.startDate ? (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item.startDate}</span>
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell className="japanese-text text-sm">
                  <div className="flex items-center space-x-1">
                    {item.location.includes('リモート') ? <Home className="h-3.5 w-3.5 text-blue-500" /> : <Briefcase className="h-3.5 w-3.5 text-gray-500" />}
                    <span>{item.location}</span>
                  </div>
                </TableCell>
                <TableCell className="japanese-text text-sm">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {item.skills.slice(0, 2).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50 text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {item.skills.length > 2 && (
                      <Badge variant="outline" className="bg-gray-100 text-xs">
                        +{item.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="japanese-text text-sm">
                  <div className="flex items-center space-x-1">
                    <FileCode className="h-3.5 w-3.5 text-purple-600" />
                    <span>{item.processes?.slice(0, 1).join(', ') || '-'}</span>
                    {(item.processes?.length || 0) > 1 && (
                      <Badge variant="outline" className="bg-purple-50 text-xs">
                        +{(item.processes?.length || 0) - 1}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="japanese-text text-sm text-center">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                    <span>{item.interviewCount || '1'}</span>
                  </div>
                </TableCell>
                <TableCell className="japanese-text text-sm">
                  <div className="flex items-center space-x-1">
                    <CircleDollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span>{item.budget}</span>
                  </div>
                </TableCell>
                <TableCell className="japanese-text text-sm text-center">
                  <Badge variant={item.foreignerAccepted ? "outline" : "destructive"} className={`px-1.5 min-w-[24px] ${item.foreignerAccepted ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                    {item.foreignerAccepted ? '◯' : '✕'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(normalizedStatus)}>
                    <span className="japanese-text">{normalizedStatus}</span>
                  </Badge>
                </TableCell>
                <TableCell className="japanese-text text-sm">
                  {item.desiredBudget ? (
                    <div className="flex items-center space-x-1">
                      <CircleDollarSign className="h-3.5 w-3.5 text-purple-600" />
                      <span>{item.desiredBudget}</span>
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell className="japanese-text text-sm text-center">
                  <Badge variant={item.freelancerAccepted ? "outline" : "destructive"} className={`px-1.5 min-w-[24px] ${item.freelancerAccepted ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                    {item.freelancerAccepted ? '◯' : '✕'}
                  </Badge>
                </TableCell>
                {isOtherCompany && (
                  <TableCell className="japanese-text">
                    <div className={`px-2 py-0.5 rounded text-xs inline-flex 
                      ${item.registrationType === "自動（メール）" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {item.registrationType || "手動"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.registeredAt ? format(new Date(item.registeredAt), 'yyyy-MM-dd HH:mm') : '-'}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
