
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EngineerSearchFormProps {
  engineerFilter: string;
  setEngineerFilter: (filter: string) => void;
  engineerCompanyFilter?: string;
  setEngineerCompanyFilter?: (filter: string) => void;
  showCompanyType?: boolean;
}

export const EngineerSearchForm: React.FC<EngineerSearchFormProps> = ({ 
  engineerFilter, 
  setEngineerFilter,
  engineerCompanyFilter = 'all',
  setEngineerCompanyFilter,
  showCompanyType = true
}) => {
  return (
    <div className="space-y-4 mb-4">
      <div>
        <Label htmlFor="engineer-search" className="japanese-text mb-2 block">技術者を検索</Label>
        <Input
          id="engineer-search"
          className="japanese-text"
          placeholder="名前、スキルで検索..."
          value={engineerFilter}
          onChange={(e) => setEngineerFilter(e.target.value)}
        />
      </div>
      
      {showCompanyType && setEngineerCompanyFilter && (
        <div>
          <Label htmlFor="company-type" className="japanese-text mb-2 block">所属会社</Label>
          <Select 
            value={engineerCompanyFilter} 
            onValueChange={setEngineerCompanyFilter}
          >
            <SelectTrigger id="company-type" className="w-full japanese-text">
              <SelectValue placeholder="所属会社を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="japanese-text">全て</SelectItem>
              <SelectItem value="自社" className="japanese-text">自社</SelectItem>
              <SelectItem value="他社" className="japanese-text">他社</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
