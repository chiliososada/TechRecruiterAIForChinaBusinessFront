
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterBarProps {
  companyFilter: string;
  setCompanyFilter: (filter: string) => void;
  techFilter: string;
  setTechFilter: (filter: string) => void;
  companyList: string[];
  startDateFilter?: string;
  setStartDateFilter?: (value: string) => void;
  startDateOptions?: string[]; // Add custom start date options
}

export const FilterBar: React.FC<FilterBarProps> = ({
  companyFilter,
  setCompanyFilter,
  techFilter,
  setTechFilter,
  companyList,
  startDateFilter,
  setStartDateFilter,
  startDateOptions = [] // Default to empty array if not provided
}) => {
  // Get unique start dates from the filterable cases or use provided options
  const standardDates = React.useMemo(() => {
    // Use provided options if available, otherwise default dates
    const dates = startDateOptions.length > 0 
      ? startDateOptions 
      : ['2025-06-01', '2025-06-15', '2025-07-01'];
    
    return ['all', ...dates];
  }, [startDateOptions]);

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="flex items-center space-x-2 flex-1">
        <div className="relative flex-1">
          <Select 
            value={companyFilter} 
            onValueChange={setCompanyFilter}
          >
            <SelectTrigger className="w-full japanese-text">
              <SelectValue placeholder="会社で絞り込み..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="japanese-text">すべての会社</SelectItem>
              {companyList.map((company, index) => (
                <SelectItem key={`${company}-${index}`} value={company} className="japanese-text">
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Add start date filter */}
        {setStartDateFilter && (
          <div className="relative flex-1">
            <Select 
              value={startDateFilter || 'all'} 
              onValueChange={setStartDateFilter}
            >
              <SelectTrigger className="w-full japanese-text">
                <SelectValue placeholder="開始日で絞り込み..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="japanese-text">すべての開始日</SelectItem>
                {standardDates.filter(date => date !== 'all').map((date) => (
                  <SelectItem key={date} value={date} className="japanese-text">
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-2 flex items-center">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="技術キーワードで検索..."
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="pl-8 japanese-text"
          />
        </div>
      </div>
    </div>
  );
};
