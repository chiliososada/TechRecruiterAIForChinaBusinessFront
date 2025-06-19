

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterAreaProps {
  filterCaseAffiliation: string;
  setFilterCaseAffiliation: (value: string) => void;
  filterCandidateAffiliation: string;
  setFilterCandidateAffiliation: (value: string) => void;
  filterCaseStartDate: string;
  setFilterCaseStartDate: (value: string) => void;
  handleSearch: () => void;
}

export const FilterArea: React.FC<FilterAreaProps> = ({
  filterCaseAffiliation,
  setFilterCaseAffiliation,
  filterCandidateAffiliation,
  setFilterCandidateAffiliation,
  filterCaseStartDate,
  setFilterCaseStartDate,
  handleSearch
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border mb-6">
      <h3 className="text-lg font-medium mb-4 japanese-text">フィルター条件設定</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">案件の所属</label>
          <Select value={filterCaseAffiliation} onValueChange={setFilterCaseAffiliation}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder">選択してください</SelectItem>
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
              <SelectItem value="placeholder">選択してください</SelectItem>
              <SelectItem value="自社">自社</SelectItem>
              <SelectItem value="他社">他社</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium japanese-text">案件の開始時期</label>
          <input 
            type="month"
            value={filterCaseStartDate}
            onChange={(e) => setFilterCaseStartDate(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button 
          onClick={handleSearch} 
          className="japanese-text"
        >
          マッチング検索
        </Button>
      </div>
    </div>
  );
};

