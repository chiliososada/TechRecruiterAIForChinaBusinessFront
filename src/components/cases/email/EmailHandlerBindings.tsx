
import React from 'react';
import { MailCase } from './types';
import { 
  handleSelectAll, 
  handleSelectCase
} from './utils/selection/caseSelectionHandlers';
import { 
  handleTemplateChange
} from './utils/template/templateHandlers';
import { 
  handleEnhanceEmail, 
  handleSendEmail,
  handleTestEmail
} from './utils/sending/emailSendingHandlers';
import { Engineer } from '@/components/cases/email/types';  // Use our local Engineer type
import { createEngineerHandlers } from './utils/engineerHandlers';

interface EmailHandlerBindingsProps {
  mailCases: MailCase[];
  caseData: {
    paginatedCases: MailCase[];
  };
  emailState: {
    selectAll: boolean;
    selectedCases: MailCase[];
    selectedTemplate: string;
    subject: string;
    emailBody: string;
    sending: boolean;
    setSelectedTemplate: (template: string) => void;
    setSubject: (subject: string) => void;
    setEmailBody: (body: string) => void;
    setSending: (sending: boolean) => void;
    setSelectedCases: (cases: MailCase[]) => void;
    setSelectAll: (value: boolean) => void;
    signature: string;
    setSignature: (signature: string) => void;
  };
  engineerState: {
    selectedEngineers: Engineer[];
    setSelectedEngineers: (engineers: Engineer[]) => void;
    setIsEngineerDialogOpen: (isOpen: boolean) => void;
    setEngineerCurrentPage: (page: number) => void;
    setEngineerFilter: (filter: string) => void;
    setEngineerCompanyFilter: (filter: string) => void;
  };
}

export const useEmailHandlerBindings = ({
  mailCases,
  caseData,
  emailState,
  engineerState
}: EmailHandlerBindingsProps) => {
  
  const casesHandleSelectAll = () => handleSelectAll(
    caseData.paginatedCases,
    emailState.selectAll,
    emailState.setSelectedCases,
    emailState.setSelectAll
  );

  const casesHandleSelectCase = (id: string, rowId: string) => handleSelectCase(
    id,
    rowId,
    emailState.selectedCases,
    caseData.paginatedCases,
    emailState.setSelectedCases,
    emailState.setSelectAll
  );

  const templateHandleChange = (templateId: string) => {
    console.log("Template change requested for ID:", templateId);
    handleTemplateChange(
      templateId,
      emailState.setSelectedTemplate,
      emailState.setSubject,
      emailState.setEmailBody
    );
  };

  const emailHandleEnhance = () => handleEnhanceEmail(
    emailState.emailBody,
    emailState.setSending,
    emailState.setEmailBody
  );

  const emailHandleSend = () => handleSendEmail(
    emailState.selectedCases,
    mailCases,
    emailState.subject,
    emailState.emailBody,
    emailState.setSending,
    emailState.setSelectedCases,
    emailState.setSelectAll,
    emailState.setSubject,
    emailState.setEmailBody,
    engineerState.setSelectedEngineers
  );

  const emailHandleTest = () => handleTestEmail(
    emailState.subject,
    emailState.emailBody,
    emailState.signature,
    emailState.setSending,
  );

  const engineerHandlers = createEngineerHandlers(
    () => {
      // Reset pagination and filters
      engineerState.setEngineerCurrentPage(1);
      engineerState.setEngineerFilter("");
      engineerState.setEngineerCompanyFilter("all");
      
      // Open the dialog
      engineerState.setIsEngineerDialogOpen(true);
    },
    (engineerId: string) => {
      // Remove engineer by ID
      const filteredEngineers = engineerState.selectedEngineers.filter(
        engineer => engineer.id !== engineerId
      );
      engineerState.setSelectedEngineers(filteredEngineers);
    },
    () => {
      if (engineerState.selectedEngineers.length === 0) {
        return;
      }
      
      // Format engineer skills
      const engineerSkills = engineerState.selectedEngineers
        .map(eng => Array.isArray(eng.skills) ? eng.skills.join(', ') : eng.skills)
        .filter(Boolean)
        .join('\n- ');
      
      // Get engineer names
      const engineerNames = engineerState.selectedEngineers
        .map(eng => eng.name)
        .join('、');
      
      // Append engineer info to email body
      const engineerInfo = `\n\n【ご提案する技術者】\n${engineerNames}\n\n【技術者のスキル】\n- ${engineerSkills}`;
      
      // Fix: Properly handle the callback for setEmailBody to accept a string
      const currentBody = emailState.emailBody;
      emailState.setEmailBody(currentBody + engineerInfo);
    }
  );

  // Updated to handle unselecting a specific row using rowId
  const handleUnselectCase = (caseId: string, rowId: string) => {
    const updatedCases = emailState.selectedCases.filter(
      item => !(item.id === caseId && item.selectedRowId === rowId)
    );
    
    emailState.setSelectedCases(updatedCases);
    
    // Check if all cases are now unselected
    if (updatedCases.length === 0) {
      emailState.setSelectAll(false);
    }
  };

  return {
    casesHandleSelectAll,
    casesHandleSelectCase,
    templateHandleChange,
    emailHandleEnhance,
    emailHandleSend,
    emailHandleTest,
    engineerHandleOpen: engineerHandlers.openEngineerDialog,
    engineerHandleToggle: (engineer: Engineer) => {
      // Simplified implementation
      const isSelected = engineerState.selectedEngineers.some(e => e.id === engineer.id);
      if (isSelected) {
        engineerState.setSelectedEngineers(
          engineerState.selectedEngineers.filter(e => e.id !== engineer.id)
        );
      } else {
        engineerState.setSelectedEngineers([...engineerState.selectedEngineers, engineer]);
      }
    },
    engineerHandleRemove: engineerHandlers.removeSelectedEngineer,
    engineerHandleApply: engineerHandlers.applyEngineerToTemplate,
    handleUnselectCase
  };
};
