
import React, { useState, useEffect } from 'react';
import { EmailSenderContent } from './email/EmailSenderContent';
import { useEmailState } from './email/hooks/useEmailState';
import { useEngineerState } from './email/hooks/useEngineerState';
import { toast } from 'sonner';
import { EngineerSelectionDialog } from './email/EngineerSelectionDialog';
import { processCaseData } from './email/utils/dataProcessing';
import { MailCase } from './email/types';
import { sendTestEmail, sendIndividualEmail } from '@/utils/backend-api';
import { useAuth } from '@/contexts/AuthContext';

interface EmailSenderContainerProps {
  mailCases: MailCase[];  // This receives filtered cases from the parent component
}

export function EmailSenderContainer({ mailCases }: EmailSenderContainerProps) {
  // Use custom hooks
  const emailState = useEmailState(mailCases); 
  const engineerState = useEngineerState(mailCases);
  const { user } = useAuth();
  
  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Force re-render key to ensure EmailForm shows compose tab when container mounts
  const [mountKey] = useState(() => `email-container-${Date.now()}`);
  
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
    console.log(`=== handleSelectCase called ===`);
    console.log('Case ID:', id);
    console.log('Row ID:', rowId);
    console.log('Current selected cases:', emailState.selectedCases.map(c => ({ id: c.id, rowId: c.selectedRowId })));
    
    const caseToToggle = paginatedCases.find(c => c.id === id);
    if (!caseToToggle) return;
    
    const isAlreadySelected = emailState.selectedCases.some(c => 
      c.id === id && c.selectedRowId === rowId
    );
    
    console.log('Is already selected:', isAlreadySelected);
    
    const rowParts = rowId.split('-');
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
      console.log('Added case, new selected cases:', [...emailState.selectedCases, updatedCase].map(c => ({ id: c.id, rowId: c.selectedRowId })));
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
  
  const handleSendEmail = async () => {
    if (emailState.selectedCases.length === 0) {
      toast.error('送信先が選択されていません');
      return;
    }
    
    if (!emailState.subject || !emailState.emailBody) {
      toast.error('件名または本文が入力されていません');
      return;
    }

    if (!user) {
      toast.error('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }
    
    emailState.setSending(true);
    
    try {
      // Prepare email list from selected cases
      const toEmails: string[] = [];
      const relatedProjectIds: string[] = [];
      
      emailState.selectedCases.forEach(caseItem => {
        if (caseItem.selectedSenderEmail) {
          toEmails.push(caseItem.selectedSenderEmail);
          // Add project ID if available
          if (caseItem.id) {
            relatedProjectIds.push(caseItem.id);
          }
        }
      });

      if (toEmails.length === 0) {
        toast.error('有効なメールアドレスが見つかりません');
        return;
      }

      // Prepare email content with signature if provided
      const fullBody = emailState.signature ? `${emailState.emailBody}\n\n${emailState.signature}` : emailState.emailBody;

      const result = await sendIndividualEmail({
        to_emails: toEmails,
        subject: emailState.subject,
        body_text: fullBody,
        body_html: fullBody.replace(/\n/g, '<br>'), // Simple text to HTML conversion
        metadata: {
          case_count: emailState.selectedCases.length,
          project_ids: relatedProjectIds,
          engineer_ids: engineerState.selectedEngineers.map(eng => eng.id),
          sent_from: 'bulk_email_interface'
        }
      }, user);

      if (result.success) {
        toast.success(`${toEmails.length}名にメールを送信しました（キューID: ${result.data?.queue_id}）`);
        
        // Clear form after successful send
        emailState.setSelectedCases([]);
        emailState.setSelectAll(false);
        emailState.setSubject('');
        emailState.setEmailBody('');
        engineerState.setSelectedEngineers([]);
      } else {
        toast.error(result.message || 'メール送信に失敗しました');
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('メール送信中にエラーが発生しました');
    } finally {
      emailState.setSending(false);
    }
  };
  
  const handleTestEmail = async () => {
    if (!emailState.subject || !emailState.emailBody) {
      toast.error('件名または本文が入力されていません');
      return;
    }
    
    // Check if user is available
    if (!user) {
      toast.error('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }
    
    emailState.setSending(true);
    
    try {
      // Send test email using the backend API with user info from context
      const result = await sendTestEmail(
        emailState.subject,
        emailState.emailBody,
        emailState.signature,
        user // Pass user from auth context
      );
      
      if (result.success) {
        toast.success('テストメールを送信しました。受信箱をご確認ください。');
      } else {
        toast.error(result.message || 'テストメール送信に失敗しました');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('テストメール送信中にエラーが発生しました');
    } finally {
      emailState.setSending(false);
    }
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
        key={mountKey} // Force re-render when container mounts
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
