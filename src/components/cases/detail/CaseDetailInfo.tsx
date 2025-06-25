
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Code, 
  Users, 
  Clock, 
  Languages, 
  Flag, 
  User, 
  CircleDollarSign, 
  FileCode, 
  MessageSquare,
  FileText
} from 'lucide-react';
import { MailCase } from '../email/types';
import { normalizeStatus } from '../utils/statusUtils';

interface CaseDetailInfoProps {
  selectedCase: MailCase;
}

export const CaseDetailInfo: React.FC<CaseDetailInfoProps> = ({ selectedCase }) => {
  // Ensure the case status is one of the valid values
  const normalizedStatus = normalizeStatus(selectedCase.status);
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
        <div className="flex space-x-2">
          <div className="bg-primary/10 p-2 rounded-md">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">会社名</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.company || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-cyan-100 p-2 rounded-md">
            <User className="h-4 w-4 text-cyan-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">担当者</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.manager || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-blue-100 p-2 rounded-md">
            <Users className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">連絡先</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.managerEmail || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-indigo-100 p-2 rounded-md">
            <Code className="h-4 w-4 text-indigo-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">必要経験</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.experience || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-purple-100 p-2 rounded-md">
            <Briefcase className="h-4 w-4 text-purple-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">勤務形態</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.workType || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-amber-100 p-2 rounded-md">
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">期間</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.duration || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-emerald-100 p-2 rounded-md">
            <Languages className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">日本語レベル</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.japanese || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-rose-100 p-2 rounded-md">
            <Flag className="h-4 w-4 text-rose-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">優先度</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.priority || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-green-100 p-2 rounded-md">
            <MapPin className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">勤務地</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.location}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-blue-100 p-2 rounded-md">
            <Calendar className="h-4 w-4 text-blue-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">参画期間</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.startDate || "未設定"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-amber-100 p-2 rounded-md">
            <MessageSquare className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">面談回数</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.interviewCount || "1"}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-green-100 p-2 rounded-md">
            <CircleDollarSign className="h-4 w-4 text-green-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">単価</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.budget}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className={`${selectedCase.foreignerAccepted ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-md`}>
            <Users className={`h-4 w-4 ${selectedCase.foreignerAccepted ? 'text-green-700' : 'text-red-700'}`} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">外国人採用</h4>
            <p className={`text-sm japanese-text px-2 py-1 rounded-sm ${selectedCase.foreignerAccepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {selectedCase.foreignerAccepted ? '可能' : '不可'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className={`${selectedCase.freelancerAccepted ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-md`}>
            <User className={`h-4 w-4 ${selectedCase.freelancerAccepted ? 'text-green-700' : 'text-red-700'}`} />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">個人事業者</h4>
            <p className={`text-sm japanese-text px-2 py-1 rounded-sm ${selectedCase.freelancerAccepted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {selectedCase.freelancerAccepted ? '可能' : '不可'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-purple-100 p-2 rounded-md">
            <CircleDollarSign className="h-4 w-4 text-purple-700" />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1 japanese-text">希望単価</h4>
            <p className="text-sm japanese-text bg-muted/20 px-2 py-1 rounded-sm">{selectedCase.desiredBudget || "未設定"}</p>
          </div>
        </div>
      </div>

      <div className="col-span-2 mt-2">
        <h4 className="text-sm font-medium mb-1 japanese-text flex items-center">
          <Code className="h-4 w-4 mr-1 text-blue-600" />
          スキル要件
        </h4>
        <div className="flex flex-wrap gap-1.5 bg-blue-50 p-2 rounded-md">
          {selectedCase.skills.map((skill, index) => (
            <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="col-span-2 mt-2">
        <h4 className="text-sm font-medium mb-1 japanese-text flex items-center">
          <FileCode className="h-4 w-4 mr-1 text-purple-600" />
          作業範囲
        </h4>
        <div className="flex flex-wrap gap-1.5 bg-purple-50 p-2 rounded-md">
          {selectedCase.processes && selectedCase.processes.length > 0 ? (
            selectedCase.processes.map((process, index) => (
              <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                {process}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">設定なし</span>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2 japanese-text flex items-center">
          <FileText className="h-4 w-4 mr-1 text-gray-600" />
          案件詳細
        </h4>
        <div className="bg-muted/20 rounded-md p-4 text-sm whitespace-pre-wrap japanese-text max-h-[300px] overflow-y-auto border border-muted">
          {selectedCase.detailDescription || "詳細情報はありません"}
        </div>
      </div>
    </>
  );
};
