
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BatchMatchingTab3Props {
  savedMatchingHistory: any[];
}

export function BatchMatchingTab3({ savedMatchingHistory = [] }: BatchMatchingTab3Props) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  // Function to handle viewing details of a saved matching
  const handleViewDetail = (history: any) => {
    setSelectedHistory(history);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6">
      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b japanese-text">マッチング結果履歴</h3>
        
        {savedMatchingHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 japanese-text">
              マッチング結果履歴はまだありません。検索結果から「履歴に保存」ボタンをクリックして保存してください。
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">保存日時</TableHead>
                <TableHead className="japanese-text">案件名</TableHead>
                <TableHead className="japanese-text">技術者名</TableHead>
                <TableHead className="japanese-text">マッチ率</TableHead>
                <TableHead className="japanese-text">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedMatchingHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.date}</TableCell>
                  <TableCell>{history.result.caseName}</TableCell>
                  <TableCell>{history.result.candidateName}</TableCell>
                  <TableCell>{history.result.matchingRate}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="japanese-text"
                      onClick={() => handleViewDetail(history)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="japanese-text">
              マッチング詳細 - {selectedHistory?.date}
            </DialogTitle>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case details */}
                <Card className="p-4">
                  <h4 className="font-medium text-lg mb-2">案件情報</h4>
                  <p><span className="font-medium">案件名:</span> {selectedHistory.result.caseName}</p>
                  <p><span className="font-medium">会社名:</span> {selectedHistory.result.caseCompany}</p>
                  <p><span className="font-medium">担当者:</span> {selectedHistory.result.caseManager}</p>
                  <p><span className="font-medium">担当者メール:</span> {selectedHistory.result.caseManagerEmail}</p>
                </Card>
                
                {/* Candidate details */}
                <Card className="p-4">
                  <h4 className="font-medium text-lg mb-2">技術者情報</h4>
                  <p><span className="font-medium">技術者名:</span> {selectedHistory.result.candidateName}</p>
                  <p><span className="font-medium">所属会社:</span> {selectedHistory.result.candidateCompany}</p>
                  <p><span className="font-medium">担当者:</span> {selectedHistory.result.affiliationManager}</p>
                  <p><span className="font-medium">担当者メール:</span> {selectedHistory.result.affiliationManagerEmail}</p>
                  <p><span className="font-medium">スキル:</span> {selectedHistory.result.skills.join(', ')}</p>
                  <p><span className="font-medium">経験年数:</span> {selectedHistory.result.experience}</p>
                </Card>
              </div>
              
              {/* Matching details */}
              <Card className="p-4">
                <h4 className="font-medium text-lg mb-2">マッチング詳細</h4>
                <p><span className="font-medium">マッチング率:</span> {selectedHistory.result.matchingRate}</p>
                <p><span className="font-medium">マッチング理由:</span> {selectedHistory.result.matchingReason}</p>
                {selectedHistory.result.memo && (
                  <p><span className="font-medium">メモ:</span> {selectedHistory.result.memo}</p>
                )}
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
