
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Engineer } from '../types';

import { EngineerSearchForm } from './EngineerSearchForm';
import { EngineerList } from './EngineerList';
import { EngineerSearchPagination } from './EngineerSearchPagination';
import { EngineerSearchActions } from './EngineerSearchActions';
import { StatusLegend } from './StatusLegend';

interface EngineerSearchDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  paginatedEngineers: Engineer[];
  selectedEngineers: Engineer[];
  toggleEngineerSelection: (engineer: Engineer) => void;
  engineerFilter: string;
  setEngineerFilter: (filter: string) => void;
  engineerCurrentPage: number;
  setEngineerCurrentPage: (page: number) => void;
  totalEngineerPages: number;
  filteredEngineersLength: number;
  engineerCompanyFilter?: string;
  setEngineerCompanyFilter?: (filter: string) => void;
  showCompanyType?: boolean;
}

export const EngineerSearchDialog: React.FC<EngineerSearchDialogProps> = ({
  isOpen,
  setIsOpen,
  paginatedEngineers,
  selectedEngineers,
  toggleEngineerSelection,
  engineerFilter,
  setEngineerFilter,
  engineerCurrentPage,
  setEngineerCurrentPage,
  totalEngineerPages,
  filteredEngineersLength,
  engineerCompanyFilter = 'all',
  setEngineerCompanyFilter,
  showCompanyType = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="japanese-text">技術者を検索して選択</DialogTitle>
          <DialogDescription className="japanese-text">
            案件に紹介する技術者を検索して選択してください
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <EngineerSearchForm 
            engineerFilter={engineerFilter}
            setEngineerFilter={setEngineerFilter}
            engineerCompanyFilter={engineerCompanyFilter}
            setEngineerCompanyFilter={setEngineerCompanyFilter}
            showCompanyType={showCompanyType}
          />
          
          <StatusLegend />
          
          <EngineerList 
            paginatedEngineers={paginatedEngineers}
            selectedEngineers={selectedEngineers}
            toggleEngineerSelection={toggleEngineerSelection}
            filteredEngineersLength={filteredEngineersLength}
          />
          
          <EngineerSearchPagination 
            currentPage={engineerCurrentPage}
            totalPages={totalEngineerPages}
            setCurrentPage={setEngineerCurrentPage}
          />
          
          <EngineerSearchActions
            selectedEngineersCount={selectedEngineers.length}
            onCancel={() => setIsOpen(false)}
            onConfirm={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
