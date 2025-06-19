
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmailOptimizationCardProps {
  handleEnhanceEmail: () => void;
}

export const EmailOptimizationCard: React.FC<EmailOptimizationCardProps> = ({ 
  handleEnhanceEmail 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="japanese-text">メール取得の最適化</CardTitle>
        <CardDescription className="japanese-text">
          メール案件の取得精度と効率を向上させるための設定
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 japanese-text">優先キーワード設定</h4>
            <Input 
              placeholder="Java, エンジニア, 募集, 案件など（カンマ区切り）" 
              className="japanese-text"
            />
            <p className="text-xs text-muted-foreground mt-1 japanese-text">
              これらのキーワードを含むメールを優先的に処理します
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 japanese-text">優先送信者設定</h4>
            <Input 
              placeholder="tanaka@example.com, @techcompany.co.jp" 
              className="japanese-text"
            />
            <p className="text-xs text-muted-foreground mt-1 japanese-text">
              特定の送信者やドメインからのメールを優先的に処理します
            </p>
          </div>
          
          <Button className="mt-2 japanese-text" onClick={handleEnhanceEmail}>設定を保存</Button>
        </div>
      </CardContent>
    </Card>
  );
};

