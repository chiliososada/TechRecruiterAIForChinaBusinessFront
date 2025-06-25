

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';

interface FilterAreaProps {
  filterCaseAffiliation: string;
  setFilterCaseAffiliation: (value: string) => void;
  filterCandidateAffiliation: string;
  setFilterCandidateAffiliation: (value: string) => void;
  filterCaseStartDate: string;
  setFilterCaseStartDate: (value: string) => void;
  minScore: number;
  setMinScore: (value: number) => void;
  handleSearch: () => void;
  isLoading: boolean;
}

export const FilterArea: React.FC<FilterAreaProps> = ({
  filterCaseAffiliation,
  setFilterCaseAffiliation,
  filterCandidateAffiliation,
  setFilterCandidateAffiliation,
  filterCaseStartDate,
  setFilterCaseStartDate,
  minScore,
  setMinScore,
  handleSearch,
  isLoading
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-medium mb-4 japanese-text">フィルター条件設定</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">案件の所属</label>
          <Select value={filterCaseAffiliation} onValueChange={setFilterCaseAffiliation}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="自社">自社</SelectItem>
              <SelectItem value="他社">他社</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">技術者の所属</label>
          <Select value={filterCandidateAffiliation} onValueChange={setFilterCandidateAffiliation}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="自社">自社</SelectItem>
              <SelectItem value="他社">他社</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">案件開始時期</label>
          <Input 
            type="date"
            value={filterCaseStartDate}
            onChange={(e) => setFilterCaseStartDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">スコア閾値 ({Math.round(minScore * 100)}%)</label>
          <Input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={minScore}
            onChange={(e) => setMinScore(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button 
          onClick={handleSearch} 
          className="japanese-text"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              マッチング処理中...
            </>
          ) : (
            'マッチング検索'
          )}
        </Button>
      </div>
    </div>
  );
};

