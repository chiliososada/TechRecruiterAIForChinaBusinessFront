
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { MatchResultItem } from './MatchResultItem';

interface MatchResultsListProps {
  results: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCaseDetail: (result: any) => void;
  onCandidateDetail: (result: any) => void;
  onSendMessage: (result: any) => void;
  onSaveToHistory: (result: any) => void;
}

export const MatchResultsList: React.FC<MatchResultsListProps> = ({
  results,
  currentPage,
  totalPages,
  onPageChange,
  onCaseDetail,
  onCandidateDetail,
  onSendMessage,
  onSaveToHistory
}) => {
  return (
    <div className="w-full">
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4 japanese-text">マッチング検索結果</h3>
          
          <div className="space-y-4">
            {results.map(result => (
              <MatchResultItem
                key={result.id}
                result={result}
                onCaseDetail={onCaseDetail}
                onCandidateDetail={onCandidateDetail}
                onSendMessage={onSendMessage}
                onSaveToHistory={onSaveToHistory}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
