
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaseItem {
  id: string;
  title: string;
  client: string;
  skills?: string[];
  experience?: string;
  budget?: string;
  location?: string;
  workType?: string;
  priority?: string;
  description?: string;
  detailDescription?: string;
  companyType?: string;
}

interface CaseDetailDisplayProps {
  caseData: CaseItem;
}

export function CaseDetailDisplay({ caseData }: CaseDetailDisplayProps) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-lg japanese-text">{caseData.title}</h4>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">選択済み</Badge>
          </div>
          
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium japanese-text">クライアント:</p>
              <p className="japanese-text">{caseData.client}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium japanese-text">所属:</p>
              <p className="japanese-text">{caseData.companyType || '未設定'}</p>
            </div>
          </div>
          
          {caseData.description && (
            <div>
              <p className="text-sm font-medium japanese-text">概要:</p>
              <p className="japanese-text text-sm text-muted-foreground">{caseData.description}</p>
            </div>
          )}
          
          {caseData.detailDescription && (
            <div>
              <p className="text-sm font-medium japanese-text">詳細説明:</p>
              <p className="japanese-text text-sm text-muted-foreground">{caseData.detailDescription}</p>
            </div>
          )}
          
          {caseData.skills && caseData.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium japanese-text">必要スキル:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(caseData.skills) ? caseData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {skill}
                  </Badge>
                )) : <Badge variant="outline" className="bg-blue-50">{caseData.skills}</Badge>}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            {caseData.experience && (
              <div>
                <p className="text-sm font-medium japanese-text">必要経験年数:</p>
                <p className="japanese-text">{caseData.experience}年以上</p>
              </div>
            )}
            
            {caseData.budget && (
              <div>
                <p className="text-sm font-medium japanese-text">予算範囲:</p>
                <p className="japanese-text">{caseData.budget}万円</p>
              </div>
            )}
            
            {caseData.location && (
              <div>
                <p className="text-sm font-medium japanese-text">勤務地:</p>
                <p className="japanese-text">{caseData.location}</p>
              </div>
            )}
            
            {caseData.workType && (
              <div>
                <p className="text-sm font-medium japanese-text">勤務形態:</p>
                <p className="japanese-text">{caseData.workType}</p>
              </div>
            )}
            
            {caseData.priority && (
              <div>
                <p className="text-sm font-medium japanese-text">優先度:</p>
                <p className="japanese-text">
                  {caseData.priority === 'low' && '低'}
                  {caseData.priority === 'medium' && '中'}
                  {caseData.priority === 'high' && '高'}
                  {caseData.priority === 'urgent' && '緊急'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
