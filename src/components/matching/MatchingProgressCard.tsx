
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader } from 'lucide-react';

interface MatchingProgressCardProps {
  progress: number;
  isInProgress: boolean;
  completionMessage: string;
  processingMessage: string;
}

export function MatchingProgressCard({ 
  progress, 
  isInProgress, 
  completionMessage,
  processingMessage
}: MatchingProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="japanese-text">マッチング進捗</CardTitle>
        <CardDescription className="japanese-text">
          AIによるマッチング処理の進捗状況
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium japanese-text">マッチング処理</span>
            <span className="text-sm font-medium japanese-text">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {isInProgress ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm japanese-text">{processingMessage}</span>
            </div>
            <div className="text-sm text-muted-foreground japanese-text">
              マッチング中も他の機能を使用できます。処理が完了するとお知らせします。
            </div>
          </div>
        ) : progress === 100 ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-500 japanese-text">マッチング完了!</span>
            </div>
            <div className="text-sm text-muted-foreground japanese-text">
              {completionMessage}。下記の結果をご確認ください。
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm japanese-text">「マッチングを開始」ボタンを押して処理を開始してください</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
