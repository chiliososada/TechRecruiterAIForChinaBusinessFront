
import { useState } from 'react';
import { Engineer } from '../types';
import { toast } from 'sonner';

export const useEngineerState = (mailCases: any[] = []) => {
  const [selectedEngineers, setSelectedEngineers] = useState<Engineer[]>([]);
  const [isEngineerDialogOpen, setIsEngineerDialogOpen] = useState(false);
  const [engineerCurrentPage, setEngineerCurrentPage] = useState(1);
  const [engineerFilter, setEngineerFilter] = useState('');
  const [engineerCompanyFilter, setEngineerCompanyFilter] = useState('all');

  // For opening the engineer selection dialog
  const openEngineerDialog = () => {
    setIsEngineerDialogOpen(true);
  };

  // For closing the engineer selection dialog
  const closeEngineerDialog = () => {
    setIsEngineerDialogOpen(false);
  };

  // For adding an engineer to the selected list
  const addEngineer = (engineer: Engineer) => {
    const isAlreadySelected = selectedEngineers.some(e => e.id === engineer.id);
    if (!isAlreadySelected) {
      setSelectedEngineers(prev => [...prev, engineer]);
    }
  };

  // For removing an engineer from the selected list
  const removeEngineer = (engineerId: string) => {
    setSelectedEngineers(prev => prev.filter(engineer => engineer.id !== engineerId));
  };
  
  // For applying engineer info to the email template
  const engineerHandleApply = (emailBody: string, setEmailBody: (body: string) => void) => {
    if (selectedEngineers.length === 0) {
      toast.error('技術者が選択されていません');
      return;
    }
    
    // Format engineer skills
    const engineerSkills = selectedEngineers
      .map(eng => {
        if (Array.isArray(eng.skills)) {
          return eng.skills.join(', ');
        } else if (typeof eng.skills === 'string') {
          return eng.skills;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n- ');
    
    // Get engineer names
    const engineerNames = selectedEngineers
      .map(eng => eng.name)
      .join('、');
    
    // Append engineer info to email body
    const engineerInfo = `\n\n【ご提案する技術者】\n${engineerNames}\n\n【技術者のスキル】\n- ${engineerSkills}`;
    
    setEmailBody(emailBody + engineerInfo);
    toast.success('技術者情報をメール本文に反映しました');
  };

  return {
    selectedEngineers,
    setSelectedEngineers,
    isEngineerDialogOpen,
    setIsEngineerDialogOpen,
    engineerCurrentPage,
    setEngineerCurrentPage,
    engineerFilter,
    setEngineerFilter,
    engineerCompanyFilter,
    setEngineerCompanyFilter,
    openEngineerDialog,
    closeEngineerDialog,
    addEngineer,
    removeEngineer,
    engineerHandleApply
  };
};
