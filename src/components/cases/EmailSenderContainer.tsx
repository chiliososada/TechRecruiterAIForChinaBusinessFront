
import React, { useState, useEffect } from 'react';
import { EmailSenderContent } from './email/EmailSenderContent';
import { useEmailState } from './email/hooks/useEmailState';
import { useEngineerState } from './email/hooks/useEngineerState';
import { toast } from 'sonner';
import { EngineerSelectionDialog } from './email/EngineerSelectionDialog';
import { processCaseData } from './email/utils/dataProcessing';
import { MailCase } from './email/types';

interface EmailSenderContainerProps {
  mailCases: MailCase[];  // This receives filtered cases from the parent component
}

export function EmailSenderContainer({ mailCases }: EmailSenderContainerProps) {
  // Use custom hooks
  const emailState = useEmailState(mailCases); 
  const engineerState = useEngineerState(mailCases);
  
  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Log the incoming mailCases to debug
  useEffect(() => {
    console.log("EmailSenderContainer received filtered cases:", 
      mailCases.length, "cases");
  }, [mailCases]);
  
  // Apply filtering based on start date and sorting
  const filteredAndSortedCases = React.useMemo(() => {
    let sorted = [...mailCases];
    
    // Apply start date filter
    if (emailState.startDateFilter && emailState.startDateFilter !== 'all') {
      console.log("Applying startDate filter:", emailState.startDateFilter);
      sorted = sorted.filter(item => {
        return item.startDate === emailState.startDateFilter;
      });
    }
    
    // Apply sorting if requested
    if (sortField === 'startDate') {
      sorted.sort((a, b) => {
        const dateA = a.startDate || '';
        const dateB = b.startDate || '';
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;  // Empty dates go last
        if (!dateB) return -1;
        
        // Compare dates
        const comparison = dateA.localeCompare(dateB);
        // Apply direction
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return sorted;
  }, [mailCases, emailState.startDateFilter, sortField, sortDirection]);
  
  // Process case data for display
  const { paginatedCases, totalPages, companyList } = processCaseData(
    filteredAndSortedCases,
    emailState.companyFilter,
    emailState.techFilter,
    emailState.currentPage,
    10
  );
  
  // Extract all unique start dates for the filter dropdown
  const startDateOptions = React.useMemo(() => {
    const uniqueDates = new Set<string>();
    mailCases.forEach(caseItem => {
      if (caseItem.startDate) {
        uniqueDates.add(caseItem.startDate);
      }
    });
    return Array.from(uniqueDates).sort();
  }, [mailCases]);
  
  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    toast.info(`${field === 'startDate' ? '参画開始日' : field}で${direction === 'asc' ? '昇順' : '降順'}に並び替えました`);
  };
  
  // Handle selecting all cases
  const handleSelectAll = () => {
    if (emailState.selectAll) {
      // Deselect all
      emailState.setSelectedCases([]);
      emailState.setSelectAll(false);
      toast("全ての送信者の選択を解除しました");
    } else {
      // Select all visible cases
      const flattenedSenders: any[] = [];
      
      paginatedCases.forEach(caseItem => {
        if (caseItem.senders && Array.isArray(caseItem.senders) && caseItem.senders.length > 0) {
          caseItem.senders.forEach((sender, index) => {
            const senderEmail = sender.email || `${sender.name?.replace(/\s+/g, '').toLowerCase()}@example.com`;
            const rowId = `${caseItem.id}-${senderEmail}-${index}`;
            
            flattenedSenders.push({
              ...caseItem,
              selectedRowId: rowId,
              selectedSenderName: sender.name,
              selectedSenderEmail: sender.email,
              selectedSenderPosition: sender.position
            });
          });
        } else {
          const rowId = `${caseItem.id}-${caseItem.senderEmail || 'default'}-0`;
          flattenedSenders.push({
            ...caseItem,
            selectedRowId: rowId,
            selectedSenderName: caseItem.sender || caseItem.senderName || '',
            selectedSenderEmail: caseItem.senderEmail || '',
            selectedSenderPosition: ''
          });
        }
      });
      
      emailState.setSelectedCases(flattenedSenders);
      emailState.setSelectAll(true);
      toast(`${flattenedSenders.length}名の送信者を選択しました`);
    }
  };
  
  const handleSelectCase = (id: string, rowId: string) => {
    const caseToToggle = paginatedCases.find(c => c.id === id);
    if (!caseToToggle) return;
    
    const isAlreadySelected = emailState.selectedCases.some(c => 
      c.id === id && c.selectedRowId === rowId
    );
    
    const rowParts = rowId.split('-');
    const senderEmail = rowParts[1];
    const senderIndex = parseInt(rowParts[2]);
    
    if (isAlreadySelected) {
      const updatedCases = emailState.selectedCases.filter(c => 
        !(c.id === id && c.selectedRowId === rowId)
      );
      emailState.setSelectedCases(updatedCases);
      emailState.setSelectAll(false);
      toast("送信者の選択を解除しました");
    } else {
      let selectedSenderName = '';
      let selectedSenderEmail = '';
      let selectedSenderPosition = '';
      
      if (caseToToggle.senders && Array.isArray(caseToToggle.senders) && senderIndex < caseToToggle.senders.length) {
        const sender = caseToToggle.senders[senderIndex];
        selectedSenderName = sender.name || '';
        selectedSenderEmail = sender.email || '';
        selectedSenderPosition = sender.position || '';
      } else {
        selectedSenderName = caseToToggle.sender || caseToToggle.senderName || '';
        selectedSenderEmail = caseToToggle.senderEmail || '';
      }
      
      const updatedCase = { 
        ...caseToToggle,
        selectedRowId: rowId,
        selectedSenderName,
        selectedSenderEmail,
        selectedSenderPosition
      };
      
      emailState.setSelectedCases([...emailState.selectedCases, updatedCase]);
      toast("送信者を選択しました");
    }
  };
  
  const handleTemplateChange = (templateId: string) => {
    emailState.setSelectedTemplate(templateId);
    
    // Apply template logic here...
    // This is simplified; actual implementation would use proper template functions
    if (templateId === 'template-1') {
      emailState.setSubject('案件のご紹介');
      emailState.setEmailBody('いつもお世話になっております。\n\n新しい案件のご紹介です。\n\nご検討いただければ幸いです。');
    } else if (templateId === 'template-2') {
      emailState.setSubject('技術者のご提案');
      emailState.setEmailBody('いつもお世話になっております。\n\n技術者のご提案です。\n\nどうぞご検討ください。');
    } else {
      emailState.setSubject('');
      emailState.setEmailBody('');
    }
  };
  
  const handleEnhanceEmail = () => {
    if (!emailState.emailBody.trim()) {
      toast.error('メール本文を入力してください');
      return;
    }
    
    emailState.setSending(true);
    
    // Simulate AI enhancement
    setTimeout(() => {
      const enhancedBody = emailState.emailBody + '\n\n文章が最適化されました。';
      emailState.setEmailBody(enhancedBody);
      emailState.setSending(false);
      toast.success('メール本文が最適化されました');
    }, 1500);
  };
  
  const handleSendEmail = () => {
    if (emailState.selectedCases.length === 0) {
      toast.error('送信先が選択されていません');
      return;
    }
    
    if (!emailState.subject || !emailState.emailBody) {
      toast.error('件名または本文が入力されていません');
      return;
    }
    
    emailState.setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      toast.success(`${emailState.selectedCases.length}名にメールを送信しました`);
      emailState.setSelectedCases([]);
      emailState.setSelectAll(false);
      emailState.setSubject('');
      emailState.setEmailBody('');
      // Use setSelectedEngineers from engineerState
      engineerState.setSelectedEngineers([]);
      emailState.setSending(false);
    }, 2000);
  };
  
  const handleTestEmail = () => {
    if (!emailState.subject || !emailState.emailBody) {
      toast.error('件名または本文が入力されていません');
      return;
    }
    
    emailState.setSending(true);
    
    // Simulate sending test email
    setTimeout(() => {
      toast.success('テストメールを送信しました');
      emailState.setSending(false);
    }, 1500);
  };
  
  // Handle removing a case from the selected list
  const handleUnselectCase = (caseId: string, rowId: string) => {
    emailState.setSelectedCases(prev => 
      prev.filter(c => !(c.id === caseId && c.selectedRowId === rowId))
    );
  };
  
  // Modified to match the expected signature in EmailSenderContent
  const engineerHandleApply = () => {
    // We call engineerState.engineerHandleApply with the required parameters
    engineerState.engineerHandleApply(emailState.emailBody, emailState.setEmailBody);
  };
  
  // Combined handlers
  const handlers = {
    casesHandleSelectAll: handleSelectAll,
    casesHandleSelectCase: handleSelectCase,
    templateHandleChange: handleTemplateChange,
    emailHandleEnhance: handleEnhanceEmail,
    emailHandleSend: handleSendEmail,
    emailHandleTest: handleTestEmail,
    engineerHandleOpen: engineerState.openEngineerDialog,
    engineerHandleRemove: engineerState.removeEngineer,
    engineerHandleApply: engineerHandleApply, // Use our adapter function
    handleUnselectCase: emailState.handleUnselectCase,
    handleSort: handleSort
  };
  
  return (
    <>
      <EmailSenderContent
        isOtherCompanyMode={true}
        emailState={{
          ...emailState,
          startDateOptions: startDateOptions
        }}
        engineerState={engineerState}
        caseData={{
          paginatedCases,
          totalPages,
          companyList
        }}
        handlers={handlers}
      />
      
      <EngineerSelectionDialog
        isOpen={engineerState.isEngineerDialogOpen}
        onClose={engineerState.closeEngineerDialog}
        onSelect={engineerState.addEngineer}
      />
    </>
  );
}
