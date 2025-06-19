

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Engineer } from '../types';

interface CandidateStatusProps {
  engineer: Engineer;
  onStatusChange: (value: string) => void;
}

export const CandidateStatus: React.FC<CandidateStatusProps> = ({ 
  engineer,
  onStatusChange
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2 japanese-text">ステータス</h4>
      <div className="flex flex-wrap gap-2">
        {Array.isArray(engineer.status) ? 
          engineer.status.map((status, idx) => (
            <Badge 
              key={idx}
              variant="outline" 
              className={`japanese-text ${
                status === '提案中' ? 'bg-blue-500 text-white' : 
                status === '事前面談' ? 'bg-orange-500 text-white' : 
                status === '面談' ? 'bg-green-500 text-white' : 
                status === '結果待ち' ? 'bg-purple-500 text-white' : 
                status === '契約中' ? 'bg-emerald-500 text-white' :
                status === '営業終了' ? 'bg-gray-500 text-white' : 
                status === 'アーカイブ' ? 'bg-slate-500 text-white' : ''
              }`}
            >
              {status}
            </Badge>
          )) : 
          <Badge variant="outline" className="japanese-text">
            {engineer.status}
          </Badge>
        }
      </div>
      <div className="mt-3">
        <Select
          onValueChange={onStatusChange}
          defaultValue="status_placeholder"
        >
          <SelectTrigger className="w-full japanese-text">
            <SelectValue placeholder="ステータスを更新" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status_placeholder" className="japanese-text">ステータスを選択</SelectItem>
            <SelectItem value="提案中" className="japanese-text">提案中</SelectItem>
            <SelectItem value="事前面談" className="japanese-text">事前面談</SelectItem>
            <SelectItem value="面談" className="japanese-text">面談</SelectItem>
            <SelectItem value="結果待ち" className="japanese-text">結果待ち</SelectItem>
            <SelectItem value="契約中" className="japanese-text">契約中</SelectItem>
            <SelectItem value="営業終了" className="japanese-text">営業終了</SelectItem>
            <SelectItem value="アーカイブ" className="japanese-text">アーカイブ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

