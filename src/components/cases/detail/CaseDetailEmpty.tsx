
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const CaseDetailEmpty: React.FC = () => {
  return (
    <CardContent>
      <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
      <p className="text-muted-foreground japanese-text">案件を選択して詳細を表示</p>
    </CardContent>
  );
};
