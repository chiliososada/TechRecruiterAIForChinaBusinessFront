
import React from 'react';
import { EmailForm } from './EmailForm';
import { EngineerSelection } from './EngineerSelection';
import { EmailTemplate } from './hooks/useEmailTemplates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailSenderLayoutProps {
  emailState: {
    selectedTemplate: string;
    setSelectedTemplate: (template: string) => void;
    subject: string;
    setSubject: (subject: string) => void;
    emailBody: string;
    setEmailBody: (body: string) => void;
    sending: boolean;
    selectedCases: any[];
    signature: string;
    setSignature: (signature: string) => void;
  };
  engineerState: {
    selectedEngineers: any[];
  };
  templates: EmailTemplate[];
  templatesLoading: boolean;
  handleTemplateChange: (templateId: string) => void;
  handleEnhanceEmail: () => void;
  handleSendEmail: () => void;
  handleTestEmail?: () => void;
  openEngineerDialog: () => void;
  removeSelectedEngineer: (engineerId: string) => void;
  applyEngineerToTemplate: () => void; // Changed to match the required signature
  isOtherCompanyMode: boolean;
  handleUnselectCase: (caseId: string, rowId: string) => void;
}

export const EmailSenderLayout: React.FC<EmailSenderLayoutProps> = ({
  emailState,
  engineerState,
  templates,
  templatesLoading,
  handleTemplateChange,
  handleEnhanceEmail,
  handleSendEmail,
  handleTestEmail, // Add test email handler
  openEngineerDialog,
  removeSelectedEngineer,
  applyEngineerToTemplate,
  isOtherCompanyMode,
  handleUnselectCase
}) => {
  // Group selected cases by company for better organization
  const selectedSendersByCompany = React.useMemo(() => {
    const groupedSenders: { [company: string]: { 
      name: string;
      email: string;
      caseId: string;
      caseTitle: string;
      rowId: string; // Ensure rowId is always present
    }[] } = {};
    
    emailState.selectedCases.forEach(caseItem => {
      const company = caseItem.company || '未指定の会社';
      
      if (!groupedSenders[company]) {
        groupedSenders[company] = [];
      }
      
      // Add sender with specific information from the selected row
      groupedSenders[company].push({
        name: caseItem.selectedSenderName || caseItem.sender || '',
        email: caseItem.selectedSenderEmail || caseItem.senderEmail || '',
        caseId: caseItem.id,
        caseTitle: caseItem.title,
        rowId: caseItem.selectedRowId || `${caseItem.id}-default-0`
      });
    });
    
    return groupedSenders;
  }, [emailState.selectedCases]);
  
  // Total count of selected senders
  const totalSelectedSenders = React.useMemo(() => {
    let count = 0;
    Object.values(selectedSendersByCompany).forEach(senders => {
      count += senders.length;
    });
    return count;
  }, [selectedSendersByCompany]);

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左カラム - 選択した送信者一覧 */}
      <div className="h-full">
        <Card className="h-full flex flex-col border-primary/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-custom-blue-300 to-custom-blue-200 h-1"></div>
          <CardHeader className="pb-3 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UsersRound className="h-4 w-4 text-custom-blue-600" />
                <CardTitle className="text-lg font-medium japanese-text">
                  選択した送信者
                </CardTitle>
              </div>
              <Badge 
                variant="secondary" 
                className="ml-2 bg-custom-blue-50 text-custom-blue-800 hover:bg-custom-blue-100"
              >
                {totalSelectedSenders}人
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2 flex-1 flex flex-col overflow-hidden">
            {totalSelectedSenders === 0 ? (
              <div className="text-sm text-muted-foreground japanese-text py-4 text-center border border-dashed rounded-md h-full flex items-center justify-center">
                送信者が選択されていません
              </div>
            ) : (
              <ScrollArea className="flex-1 pr-4" style={{ height: '500px', maxHeight: 'calc(100vh - 400px)' }}>
                {Object.entries(selectedSendersByCompany).map(([company, senders]) => (
                  <div key={company} className="mb-4">
                    <h4 className="font-semibold text-sm bg-gradient-to-r from-muted/90 to-muted/50 px-2 py-1 rounded mb-2 japanese-text flex items-center justify-between">
                      <span>{company}</span>
                      <Badge variant="outline" className="ml-1 text-xs">{senders.length}人</Badge>
                    </h4>
                    <div className="space-y-2">
                      {senders.map((sender, idx) => (
                        <div 
                          key={`${sender.rowId || sender.caseId + '-' + idx}`} 
                          className="flex items-center justify-between bg-muted/20 hover:bg-muted/30 transition-colors rounded-md p-2 text-sm border border-transparent hover:border-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{sender.name || '名前なし'}</div>
                            <div className="text-xs text-muted-foreground">{sender.email || 'メールなし'}</div>
                            <div className="text-xs japanese-text mt-1 text-custom-blue-700">{sender.caseTitle}</div>
                          </div>
                          <Button
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleUnselectCase(sender.caseId, sender.rowId)}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="sr-only">選択解除</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* メール設定部分 - 中央カラム */}
      <div className="lg:col-span-2">
        <EmailForm
          key="email-form-compose" // Force re-render to ensure compose tab is active
          emailTemplates={templates}
          templatesLoading={templatesLoading}
          selectedTemplate={emailState.selectedTemplate}
          handleTemplateChange={handleTemplateChange}
          subject={emailState.subject}
          setSubject={emailState.setSubject}
          emailBody={emailState.emailBody}
          setEmailBody={emailState.setEmailBody}
          signature={emailState.signature}
          setSignature={emailState.setSignature}
          handleEnhanceEmail={handleEnhanceEmail}
          handleSendEmail={handleSendEmail}
          handleTestEmail={handleTestEmail} // Pass the test email handler
          sending={emailState.sending}
          selectedCasesCount={totalSelectedSenders}
          hideOptimizationSection={isOtherCompanyMode}
        />

        {/* 技術者選択部分 - メールフォームの下に移動 */}
        <div className="mt-6">
          <EngineerSelection 
            selectedEngineers={engineerState.selectedEngineers}
            openEngineerDialog={openEngineerDialog}
            removeSelectedEngineer={removeSelectedEngineer}
            applyEngineerToTemplate={applyEngineerToTemplate}
            selectedCasesLength={totalSelectedSenders}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailSenderLayout;
