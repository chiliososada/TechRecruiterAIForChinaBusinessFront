
import { Engineer } from '@/components/cases/email/types'; // Use our local Engineer type
import { toast } from 'sonner';

export interface EngineerHandlersProps {
  openEngineerDialog: () => void;
  removeSelectedEngineer: (engineerId: string) => void;
  applyEngineerToTemplate: () => void;
  addSelectedEngineer?: (engineer: Engineer) => void;
}

export const createEngineerHandlers = (
  openDialog: () => void,
  removeEngineer: (engineerId: string) => void,
  applyEngineer: () => void,
  addEngineer?: (engineer: Engineer) => void
): EngineerHandlersProps => {
  return {
    openEngineerDialog: openDialog,
    removeSelectedEngineer: removeEngineer,
    applyEngineerToTemplate: applyEngineer,
    addSelectedEngineer: addEngineer
  };
};

// Open the engineer selection dialog
export const openEngineerDialog = (
  setIsDialogOpen: (isOpen: boolean) => void,
  setCurrentPage?: (page: number) => void,
  setFilter?: (filter: string) => void,
  setCompanyFilter?: (filter: string) => void
) => {
  // Reset pagination and filters if provided
  if (setCurrentPage) setCurrentPage(1);
  if (setFilter) setFilter('');
  if (setCompanyFilter) setCompanyFilter('all');
  
  // Open the dialog
  setIsDialogOpen(true);
};

// Toggle engineer selection
export const toggleEngineerSelection = (
  engineer: Engineer,
  selectedEngineers: Engineer[],
  setSelectedEngineers: (engineers: Engineer[]) => void
) => {
  // Check if engineer is already selected
  const isSelected = selectedEngineers.some(e => e.id === engineer.id);
  
  if (isSelected) {
    // Remove from selection
    setSelectedEngineers(selectedEngineers.filter(e => e.id !== engineer.id));
    toast.info(`${engineer.name} の選択を解除しました`);
  } else {
    // Add to selection
    setSelectedEngineers([...selectedEngineers, engineer]);
    toast.success(`${engineer.name} を選択しました`);
  }
};

// Remove engineer from selection
export const removeSelectedEngineer = (
  engineerId: string,
  selectedEngineers: Engineer[],
  setSelectedEngineers: (engineers: Engineer[]) => void
) => {
  const engineerToRemove = selectedEngineers.find(e => e.id === engineerId);
  setSelectedEngineers(selectedEngineers.filter(e => e.id !== engineerId));
  
  if (engineerToRemove) {
    toast.info(`${engineerToRemove.name} を除外しました`);
  }
};

// Apply engineer info to email template
export const applyEngineerToTemplate = (
  selectedEngineers: Engineer[],
  selectedCases: any[],
  setEmailBody: (body: string) => void,
  currentEmailBody: string
) => {
  if (selectedEngineers.length === 0) {
    toast.error('技術者が選択されていません');
    return;
  }
  
  if (selectedCases.length === 0) {
    toast.error('案件が選択されていません');
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
  
  // Fix: Use the current email body directly instead of a function
  setEmailBody(currentEmailBody + engineerInfo);
  toast.success('技術者情報をメール本文に反映しました');
};
