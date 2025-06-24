import React from 'react';
import { EngineerSelectionDialog, EngineerItem } from './EngineerSelectionDialog';
import { CandidateItem } from './types';

interface CandidateSelectionDialogProps {
  onSelect: (selectedCandidate: CandidateItem) => void;
}

export function CandidateSelectionDialog({ onSelect }: CandidateSelectionDialogProps) {
  
  // Convert EngineerItem to CandidateItem format
  const handleEngineerSelect = (engineer: EngineerItem) => {
    const candidateItem: CandidateItem = {
      id: engineer.id,
      name: engineer.name,
      skills: engineer.skills,
      companyType: engineer.companyType || '自社',
      companyName: engineer.companyName || '',
      source: '',
      japaneseLevel: engineer.japaneseLevel || '',
      experience: engineer.experience || '',
      availability: engineer.availability || '',
      status: engineer.status || ['未設定'],
      nationality: engineer.nationality,
      age: engineer.age,
      gender: engineer.gender,
      nearestStation: ''
    };
    
    onSelect(candidateItem);
  };

  return (
    <EngineerSelectionDialog onSelect={handleEngineerSelect} />
  );
}