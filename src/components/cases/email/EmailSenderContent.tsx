
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { CasesList } from './CasesList';
import { EmailSenderLayout } from './EmailSenderLayout';
import { FilterBar } from './FilterBar';
import { MailCase } from './types';
import { EmailTemplate } from './hooks/useEmailTemplates';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { CaseViewDialog } from '../detail/CaseViewDialog';

interface EmailSenderContentProps {
  isOtherCompanyMode: boolean;
  emailState: {
    selectAll: boolean;
    selectedCases: MailCase[];
    companyFilter: string;
    setCompanyFilter: (value: string) => void;
    techFilter: string;
    setTechFilter: (value: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    selectedTemplate: string;
    setSelectedTemplate: (template: string) => void;
    subject: string;
    setSubject: (subject: string) => void;
    emailBody: string;
    setEmailBody: (body: string) => void;
    sending: boolean;
    setSending: (sending: boolean) => void;
    signature: string;
    setSignature: (signature: string) => void;
    startDateFilter?: string;
    setStartDateFilter?: (value: string) => void;
    startDateOptions?: string[]; // Add start date options
  };
  engineerState: {
    selectedEngineers: any[];
  };
  caseData: {
    paginatedCases: MailCase[];
    totalPages: number;
    companyList: (string | null)[];
  };
  templates: EmailTemplate[];
  templatesLoading: boolean;
  handlers: {
    casesHandleSelectAll: () => void;
    casesHandleSelectCase: (id: string, rowId: string) => void;
    templateHandleChange: (templateId: string) => void;
    emailHandleEnhance: () => void;
    emailHandleSend: () => void;
    emailHandleTest?: () => void;
    engineerHandleOpen: () => void;
    engineerHandleRemove: (engineerId: string) => void;
    engineerHandleApply: () => void; // This now expects no parameters
    handleUnselectCase: (caseId: string, rowId: string) => void;
    handleSort?: (field: string, direction: 'asc' | 'desc') => void;
  };
}

export const EmailSenderContent: React.FC<EmailSenderContentProps> = ({
  isOtherCompanyMode,
  emailState,
  engineerState,
  caseData,
  templates,
  templatesLoading,
  handlers
}) => {
  const [companySearchTerm, setCompanySearchTerm] = React.useState('');
  const [selectedCase, setSelectedCase] = React.useState<MailCase | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  
  // Filter company list based on search term with extra validation
  const filteredCompanyList = React.useMemo(() => {
    // First filter out null, empty strings, and non-string values
    const validCompanies = caseData.companyList
      .filter(company => 
        company !== null && 
        company !== undefined &&
        company !== "" && 
        typeof company === 'string'
      )
      // Ensure we don't have duplicates
      .reduce<string[]>((acc, curr) => {
        if (!acc.includes(curr)) {
          acc.push(curr);
        }
        return acc;
      }, []);
    
    // Add a fallback company if the list is empty to avoid rendering issues
    if (validCompanies.length === 0) {
      validCompanies.push("未分類会社");
    }
    
    // Then filter based on search term
    if (!companySearchTerm) return validCompanies;
    
    return validCompanies.filter((company) => 
      company.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [caseData.companyList, companySearchTerm]);

  // Handle viewing a case
  const handleViewCase = (caseItem: MailCase) => {
    console.log("Viewing case details:", caseItem);
    setSelectedCase(caseItem);
    setIsDetailDialogOpen(true);
  };
  
  // Handle unselecting a specific row from the selected senders list
  const handleUnselectCase = (caseId: string, rowId: string) => {
    handlers.handleUnselectCase(caseId, rowId);
  };

  // Handle sorting (pass through to parent handler)
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    if (handlers.handleSort) {
      handlers.handleSort(field, direction);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-custom-blue-700/80 to-custom-blue-500/70 h-2"></div>
        <CardHeader className="pb-3 bg-gradient-to-b from-muted/50 to-transparent">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-custom-blue-600" />
            <CardTitle className="japanese-text text-xl font-bold text-primary flex items-center">
              一括メール送信
              <span className="text-xs bg-custom-blue-100 text-custom-blue-800 px-2 py-0.5 rounded-full ml-3 font-normal">
                他社案件
              </span>
            </CardTitle>
          </div>
          <CardDescription className="japanese-text text-md mt-2">
            案件送信者に一括でメールを送信します
          </CardDescription>
          
          {/* Company search input */}
          <div className="mt-4 mb-2">
            <div className="flex items-center border rounded-md border-input hover:border-primary/60 transition-colors bg-background px-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                placeholder="会社名で検索..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 japanese-text"
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <FilterBar 
            companyFilter={emailState.companyFilter}
            setCompanyFilter={emailState.setCompanyFilter}
            techFilter={emailState.techFilter}
            setTechFilter={emailState.setTechFilter}
            companyList={filteredCompanyList}
            startDateFilter={emailState.startDateFilter}
            setStartDateFilter={emailState.setStartDateFilter}
            startDateOptions={emailState.startDateOptions}
          />
        </CardHeader>
        <CardContent className="pt-6">
          {/* 送信者一覧 - 送信者を中心にした表示に変更 */}
          <CasesList
            paginatedCases={caseData.paginatedCases}
            selectedCases={emailState.selectedCases}
            handleSelectCase={handlers.casesHandleSelectCase}
            selectAll={emailState.selectAll}
            handleSelectAll={handlers.casesHandleSelectAll}
            currentPage={emailState.currentPage}
            setCurrentPage={emailState.setCurrentPage}
            totalPages={caseData.totalPages}
            showCompanyInfo={isOtherCompanyMode}
            onViewCase={handleViewCase}
            onSort={handleSort}
          />
          
          <EmailSenderLayout
            emailState={emailState}
            engineerState={engineerState}
            templates={templates}
            templatesLoading={templatesLoading}
            handleTemplateChange={handlers.templateHandleChange}
            handleEnhanceEmail={handlers.emailHandleEnhance}
            handleSendEmail={handlers.emailHandleSend}
            handleTestEmail={handlers.emailHandleTest}
            openEngineerDialog={handlers.engineerHandleOpen}
            removeSelectedEngineer={handlers.engineerHandleRemove}
            applyEngineerToTemplate={handlers.engineerHandleApply}
            isOtherCompanyMode={isOtherCompanyMode}
            handleUnselectCase={handleUnselectCase}
          />
        </CardContent>
      </Card>

      {/* Case detail dialog */}
      <CaseViewDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        caseItem={selectedCase}
      />
    </div>
  );
};
