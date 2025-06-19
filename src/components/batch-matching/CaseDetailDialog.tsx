
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CaseDetailProps {
  id?: string | number;
  name?: string;
  company?: string;
  location?: string;
  skills?: string[] | string;
  rate?: string;
  manager?: string;
  managerEmail?: string;
  detailDescription?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  workType?: string;
  experienceRequired?: string;
  budget?: string;
  matchScore?: number;
}

interface CaseDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseDetailProps | null;
}

export const CaseDetailDialog: React.FC<CaseDetailDialogProps> = ({
  isOpen,
  onClose,
  caseData
}) => {
  if (!caseData) return null;

  // Helper function for skill badges
  const renderSkills = (skills: string[] | string | undefined) => {
    if (!skills) return null;
    
    if (Array.isArray(skills)) {
      return skills.map((skill, index) => (
        <Badge key={index} variant="outline" className="bg-blue-50">{skill}</Badge>
      ));
    }
    
    return skills.split(',').map((skill, index) => (
      <Badge key={index} variant="outline" className="bg-blue-50">{skill.trim()}</Badge>
    ));
  };

  // Helper function to get priority badge color
  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl japanese-text">
            案件詳細: {caseData.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-medium">{caseData.name}</h3>
              <p className="text-sm text-gray-500">{caseData.company}</p>
            </div>
            
            {caseData.priority && (
              <Badge className={getPriorityBadgeClass(caseData.priority)}>
                {caseData.priority === 'high' && '優先度：高'}
                {caseData.priority === 'urgent' && '優先度：緊急'}
                {caseData.priority === 'medium' && '優先度：中'}
                {caseData.priority === 'low' && '優先度：低'}
                {!['high', 'urgent', 'medium', 'low'].includes(caseData.priority) && `優先度：${caseData.priority}`}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium japanese-text">勤務地</p>
              <p>{caseData.location || '未設定'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">勤務形態</p>
              <p>{caseData.workType || '未設定'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">単価</p>
              <p>{caseData.rate || caseData.budget || '未設定'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">必要経験</p>
              <p>{caseData.experienceRequired || '未設定'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium japanese-text">担当者</p>
            <p>{caseData.manager || '未設定'}</p>
            {caseData.managerEmail && (
              <p className="text-sm text-gray-500">{caseData.managerEmail}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium japanese-text">必要スキル</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {renderSkills(caseData.skills)}
            </div>
          </div>
          
          {caseData.detailDescription && (
            <div>
              <p className="text-sm font-medium japanese-text">詳細説明</p>
              <p className="whitespace-pre-wrap text-sm border p-3 rounded-md bg-muted/10">
                {caseData.detailDescription}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="japanese-text">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
