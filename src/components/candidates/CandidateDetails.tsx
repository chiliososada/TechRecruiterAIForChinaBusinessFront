
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Engineer } from './types';

import { CandidateHeader } from './details/CandidateHeader';
import { CandidateBasicInfo } from './details/CandidateBasicInfo';
import { CandidateCompanyInfo } from './details/CandidateCompanyInfo';
import { CandidatePersonalInfo } from './details/CandidatePersonalInfo';
import { CandidateEducationInfo } from './details/CandidateEducationInfo';
import { CandidateContactInfo } from './details/CandidateContactInfo';
import { CandidateSkillsInfo } from './details/CandidateSkillsInfo';
import { CandidateWorkInfo } from './details/CandidateWorkInfo';
import { CandidateRegistrationInfo } from './details/CandidateRegistrationInfo';
import { CandidateNotes } from './details/CandidateNotes';
import { CandidateStatus } from './details/CandidateStatus';
import { CandidateRecommendation } from './details/CandidateRecommendation';
import { CandidateFooter } from './details/CandidateFooter';

interface CandidateDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engineer: Engineer | null;
  onStatusChange: (value: string) => void;
  onEditClick: () => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({
  open,
  onOpenChange,
  engineer,
  onStatusChange,
  onEditClick
}) => {
  if (!engineer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <CandidateHeader />
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <CandidateBasicInfo engineer={engineer} />
            
            <CandidateCompanyInfo 
              engineer={engineer} 
              showCompanyName={engineer.companyType === '他社'} 
            />
            
            <CandidatePersonalInfo engineer={engineer} />
            
            <CandidateEducationInfo engineer={engineer} />
            
            <CandidateContactInfo engineer={engineer} />
            
            <CandidateSkillsInfo engineer={engineer} />
            
            <CandidateWorkInfo engineer={engineer} />
            
            <CandidateRegistrationInfo engineer={engineer} />
            
            <CandidateNotes engineer={engineer} />
          </div>
          
          <CandidateStatus 
            engineer={engineer}
            onStatusChange={onStatusChange}
          />
          
          <CandidateRecommendation engineer={engineer} />
          
          <CandidateFooter 
            onClose={() => onOpenChange(false)}
            onEditClick={onEditClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
