
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, User, Save } from 'lucide-react';

interface MatchResultItemProps {
  result: any;
  onCaseDetail: (result: any) => void;
  onCandidateDetail: (result: any) => void;
  onSendMessage: (result: any) => void;
  onSaveToHistory: (result: any) => void;
}

export const MatchResultItem: React.FC<MatchResultItemProps> = ({
  result,
  onCaseDetail,
  onCandidateDetail,
  onSendMessage,
  onSaveToHistory
}) => {
  return (
    <Card key={result.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-lg">{result.caseName}</h4>
            <p className="text-sm text-gray-700"><span className="font-medium">案件会社:</span> {result.caseCompany}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">案件担当者:</span> {result.caseManager}</p>
            <p className="text-sm text-gray-700 text-xs">{result.caseManagerEmail}</p>
            <div className="mt-1">
              <Badge className="bg-blue-100 text-blue-800">マッチング: {result.matchingRate}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-lg">{result.candidateName}</h4>
            <p className="text-sm text-gray-700"><span className="font-medium">所属会社:</span> {result.candidateCompany}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">所属担当者:</span> {result.affiliationManager}</p>
            <p className="text-sm text-gray-700 text-xs">{result.affiliationManagerEmail}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">スキル:</span> {result.skills.join(', ')}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">経験:</span> {result.experience}</p>
            
            {/* Technician information fields */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              <p className="text-sm text-gray-700"><span className="font-medium">国籍:</span> {result.nationality || '未設定'}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">年齢:</span> {result.age || '未設定'}</p>
              <p className="text-sm text-gray-700"><span className="font-medium">性別:</span> {result.gender || '未設定'}</p>
            </div>
          </div>
        </div>
        
        {/* Add matching reason */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
          <p className="font-medium text-blue-800">マッチング理由:</p>
          <p className="text-gray-700">{result.matchingReason}</p>
        </div>
        
        <div className="mt-3 flex justify-end space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            className="japanese-text"
            onClick={() => onCaseDetail(result)}
          >
            案件詳細
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className="japanese-text"
            onClick={() => onCandidateDetail(result)}
          >
            <User className="h-4 w-4 mr-1" />
            技術者詳細
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="japanese-text"
            onClick={() => onSaveToHistory(result)}
          >
            <Save className="h-4 w-4 mr-1" />
            履歴に保存
          </Button>
          <Button 
            size="sm" 
            className="japanese-text flex items-center"
            onClick={() => onSendMessage(result)}
          >
            <Mail className="h-4 w-4 mr-1" />
            メール送信
          </Button>
        </div>
        
        {result.memo && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
            <span className="font-medium">メモ:</span> {result.memo}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
