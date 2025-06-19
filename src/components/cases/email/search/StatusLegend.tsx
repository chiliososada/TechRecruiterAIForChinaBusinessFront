
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const StatusLegend: React.FC = () => {
  // Updated status types with their Japanese names and badge variants to match talent management
  const statusTypes = [
    { name: '提案中', variant: 'proposed', description: '企業に提案中のエンジニア' },
    { name: '事前面談', variant: 'preliminary', description: '事前面談予定のエンジニア' },
    { name: '面談', variant: 'interview', description: '面談中のエンジニア' },
    { name: '結果待ち', variant: 'waiting', description: '面談結果待ちのエンジニア' },
    { name: '営業終了', variant: 'completed', description: '営業活動が終了したエンジニア' },
  ];

  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-muted-foreground mb-2 japanese-text">ステータス凡例:</p>
      <div className="flex flex-wrap gap-2">
        {statusTypes.map((status, index) => (
          <div key={index} className="flex items-center">
            <Badge 
              variant={status.variant as any} 
              className="japanese-text text-xs font-medium mr-1"
            >
              {status.name}
            </Badge>
            <span className="text-xs text-muted-foreground japanese-text hidden sm:inline">
              {status.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
