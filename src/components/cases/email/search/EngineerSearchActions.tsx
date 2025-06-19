
import React from 'react';
import { Button } from '@/components/ui/button';

interface EngineerSearchActionsProps {
  selectedEngineersCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const EngineerSearchActions: React.FC<EngineerSearchActionsProps> = ({
  selectedEngineersCount,
  onCancel,
  onConfirm
}) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="japanese-text"
      >
        キャンセル
      </Button>
      <Button 
        onClick={onConfirm}
        className="japanese-text"
      >
        {selectedEngineersCount}名の技術者を選択
      </Button>
    </div>
  );
};

