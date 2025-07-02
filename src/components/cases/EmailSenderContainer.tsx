
import React, { useState, useEffect } from 'react';
import { EmailSenderContent } from './email/EmailSenderContent';
import { useEmailState } from './email/hooks/useEmailState';
import { useEngineerState } from './email/hooks/useEngineerState';
import { useBulkEmailTemplates } from './email/hooks/useEmailTemplates';
import { applyTemplateWithEngineers } from './email/utils/templateProcessor';
import { toast } from 'sonner';
import { EngineerSelectionDialog } from './email/EngineerSelectionDialog';
import { processCaseData } from './email/utils/dataProcessing';
import { MailCase } from './email/types';
import { sendTestEmail, sendIndividualEmail } from '@/utils/backend-api';
import { useAuth } from '@/contexts/AuthContext';
import { emailTemplateService } from '@/services/emailTemplateService';
import { attachmentService, AttachmentInfo } from '@/services/attachmentService';

interface EmailSenderContainerProps {
  mailCases: MailCase[];  // This receives filtered cases from the parent component
}

export function EmailSenderContainer({ mailCases }: EmailSenderContainerProps) {
  // Use custom hooks
  const emailState = useEmailState(mailCases); 
  const engineerState = useEngineerState(mailCases);
  const { templates, loading: templatesLoading, error: templatesError } = useBulkEmailTemplates();
  const { user, currentTenant } = useAuth();
  
  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Force re-render key to ensure EmailForm shows compose tab when container mounts
  const [mountKey] = useState(() => `email-container-${Date.now()}`);
  
  // 添付ファイル関連の状態
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState<Set<string>>(new Set());
  
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
  
  const handleTemplateChange = async (templateId: string) => {
    emailState.setSelectedTemplate(templateId);
    
    if (templateId === 'no-template') {
      emailState.setSubject('');
      emailState.setEmailBody('');
      emailState.setSignature('');
      return;
    }
    
    // Find the selected template
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (!selectedTemplate) {
      console.warn('Template not found:', templateId);
      return;
    }

    try {
      // Apply template with current engineers (if any)
      const { subject, body, signature } = applyTemplateWithEngineers(
        selectedTemplate,
        engineerState.selectedEngineers
      );
      
      emailState.setSubject(subject);
      emailState.setEmailBody(body);
      emailState.setSignature(signature);
      
      // Update template usage count
      if (currentTenant?.id) {
        await emailTemplateService.incrementUsageCount(templateId, currentTenant.id);
      }
      
      toast.success('テンプレートを適用しました');
    } catch (error) {
      console.error('Template application error:', error);
      toast.error('テンプレートの適用に失敗しました');
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

  // 履歴書添付機能
  const handleAttachResume = async (engineerId: string, engineerName: string, resumeUrl: string) => {
    if (!currentTenant?.id) {
      toast.error('テナント情報が見つかりません');
      return;
    }

    // 既に同じエンジニアの履歴書が添付されているかチェック
    const existingAttachment = attachments.find(att => att.engineerId === engineerId);
    if (existingAttachment) {
      toast.warning(`${engineerName}の履歴書は既に添付されています`);
      return;
    }

    // アップロード開始
    setUploadingAttachments(prev => new Set([...prev, engineerId]));

    try {
      const attachmentInfo = await attachmentService.uploadResumeFromSupabase(
        currentTenant.id,
        engineerId,
        engineerName,
        resumeUrl
      );

      setAttachments(prev => [...prev, attachmentInfo]);
      toast.success(`${engineerName}の履歴書を添付しました`);
    } catch (error) {
      console.error('Resume attachment error:', error);
      toast.error(error instanceof Error ? error.message : '履歴書の添付に失敗しました');
    } finally {
      setUploadingAttachments(prev => {
        const newSet = new Set(prev);
        newSet.delete(engineerId);
        return newSet;
      });
    }
  };

  // 添付ファイル削除機能
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast.info('添付ファイルを削除しました');
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

      // 添付ファイルがある場合は添付ファイル付きメール送信を使用
      if (attachments.length > 0) {
        const attachmentIds = attachments.map(att => att.id);
        const attachmentFilenames = attachments.map(att => att.filename);
        const result = await attachmentService.sendEmailWithAttachments(
          currentTenant!.id,
          {
            to: toEmails,
            subject: emailState.subject,
            body: emailState.emailBody, // Use emailBody directly since signature is handled in the service
            signature: emailState.signature
          },
          attachmentIds,
          attachmentFilenames
        );
        
        if (result.status === 'success') {
          toast.success(`${toEmails.length}名に添付ファイル付きメールを送信しました（キューID: ${result.queue_id}）`);
        } else {
          toast.error(result.message || 'メール送信に失敗しました');
        }
      } else {
        // 通常のメール送信
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
        } else {
          toast.error(result.message || 'メール送信に失敗しました');
        }
      }

      // Clear form after successful send (for both attachment and regular emails)
      emailState.setSelectedCases([]);
      emailState.setSelectAll(false);
      emailState.setSubject('');
      emailState.setEmailBody('');
      engineerState.setSelectedEngineers([]);
      setAttachments([]); // Clear attachments
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
    if (engineerState.selectedEngineers.length === 0) {
      toast.error('技術者が選択されていません');
      return;
    }

    // Check if we have a template selected
    const selectedTemplate = templates.find(t => t.id === emailState.selectedTemplate);
    
    if (selectedTemplate) {
      // Use template with engineer data
      try {
        const { subject, body, signature } = applyTemplateWithEngineers(
          selectedTemplate,
          engineerState.selectedEngineers
        );
        
        emailState.setSubject(subject);
        emailState.setEmailBody(body);
        emailState.setSignature(signature);
        
        toast.success('技術者情報をテンプレートに適用しました');
      } catch (error) {
        console.error('Template application error:', error);
        toast.error('技術者情報の適用に失敗しました');
      }
    } else {
      // Fallback to old behavior if no template is selected
      engineerState.engineerHandleApply(emailState.emailBody, emailState.setEmailBody);
    }
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
    handleSort: handleSort,
    // 添付ファイル関連のハンドラー
    handleAttachResume: handleAttachResume,
    handleRemoveAttachment: handleRemoveAttachment
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
        engineerState={{
          selectedEngineers: engineerState.selectedEngineers
        }}
        caseData={{
          paginatedCases,
          totalPages,
          companyList
        }}
        templates={templates}
        templatesLoading={templatesLoading}
        handlers={handlers}
        attachments={attachments}
        uploadingAttachments={uploadingAttachments}
      />
      
      <EngineerSelectionDialog
        isOpen={engineerState.isEngineerDialogOpen}
        onClose={engineerState.closeEngineerDialog}
        onSelect={engineerState.addEngineer}
      />
    </>
  );
}
