
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Flag, Cake, User, Calendar, ListChecks, MapPin } from 'lucide-react';

interface ProjectInfo {
  name: string;
  duration: string;
  role: string;
  startDate?: string;
  endDate?: string;
  workScope?: string[];
  nearestStation?: string;
}

interface CandidateDetailProps {
  id?: string | number;
  name?: string;
  company?: string;
  skills?: string[] | string;
  experience?: string;
  japaneseLevel?: string;
  englishLevel?: string;
  availableFrom?: string;
  preferredWorkLocation?: string;
  hourlyRate?: string;
  manager?: string;
  managerEmail?: string;
  bio?: string;
  projects?: ProjectInfo[];
  // New fields
  nationality?: string;
  age?: string;
  gender?: string;
}

interface CandidateDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateData: CandidateDetailProps | null;
}

export const CandidateDetailDialog: React.FC<CandidateDetailDialogProps> = ({
  isOpen,
  onClose,
  candidateData
}) => {
  if (!candidateData) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl japanese-text">
            技術者詳細: {candidateData.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium">{candidateData.name}</h3>
                <p className="text-sm text-gray-500">{candidateData.company}</p>
              </div>
              
              {candidateData.availableFrom && (
                <Badge className="bg-green-100 text-green-800">
                  {new Date(candidateData.availableFrom) > new Date() 
                    ? `${candidateData.availableFrom}から稼働可能` 
                    : '即日稼働可能'}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium japanese-text">経験年数</p>
                <p>{candidateData.experience || '未設定'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium japanese-text">希望勤務地</p>
                <p>{candidateData.preferredWorkLocation || '未設定'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium japanese-text">日本語レベル</p>
                <p>{candidateData.japaneseLevel || '未設定'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium japanese-text">英語レベル</p>
                <p>{candidateData.englishLevel || '未設定'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium japanese-text">単価</p>
                <p>{candidateData.hourlyRate || '未設定'}</p>
              </div>

              {/* New fields */}
              <div>
                <p className="text-sm font-medium japanese-text flex items-center gap-1">
                  <Flag className="h-4 w-4" />
                  国籍
                </p>
                <p>{candidateData.nationality || '未設定'}</p>
              </div>

              <div>
                <p className="text-sm font-medium japanese-text flex items-center gap-1">
                  <Cake className="h-4 w-4" />
                  年齢
                </p>
                <p>{candidateData.age || '未設定'}</p>
              </div>

              <div>
                <p className="text-sm font-medium japanese-text flex items-center gap-1">
                  <User className="h-4 w-4" />
                  性別
                </p>
                <p>{candidateData.gender || '未設定'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">担当者</p>
              <p>{candidateData.manager || '未設定'}</p>
              {candidateData.managerEmail && (
                <p className="text-sm text-gray-500">{candidateData.managerEmail}</p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">スキル</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {renderSkills(candidateData.skills)}
              </div>
            </div>
            
            {candidateData.bio && (
              <div>
                <p className="text-sm font-medium japanese-text">プロフィール</p>
                <p className="whitespace-pre-wrap text-sm border p-3 rounded-md bg-muted/10">
                  {candidateData.bio}
                </p>
              </div>
            )}
            
            {candidateData.projects && candidateData.projects.length > 0 && (
              <div>
                <p className="text-sm font-medium japanese-text mb-2">プロジェクト履歴</p>
                <div className="space-y-2">
                  {candidateData.projects.map((project, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <p className="font-medium">{project.name}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                        <div>
                          <span className="text-gray-500">期間：</span> {project.duration}
                        </div>
                        <div>
                          <span className="text-gray-500">役割：</span> {project.role}
                        </div>
                        
                        {/* New project fields */}
                        {project.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">開始日：</span> {project.startDate}
                          </div>
                        )}
                        
                        {project.endDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">終了日：</span> {project.endDate}
                          </div>
                        )}
                        
                        {project.workScope && project.workScope.length > 0 && (
                          <div className="col-span-2 flex items-start gap-1">
                            <ListChecks className="h-4 w-4 mt-0.5 text-gray-500" />
                            <div>
                              <span className="text-gray-500">作業範囲：</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {project.workScope.map((scope, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-green-50">
                                    {scope}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {project.nearestStation && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-500">最寄り駅：</span> {project.nearestStation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose} className="japanese-text">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
