
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CompanyTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export const CompanyTypeDropdown: React.FC<CompanyTypeDropdownProps> = ({
  value,
  onChange
}) => {
  // Ensure we have a valid default value
  const safeValue = value || 'all';
  
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="companyType" className="japanese-text">所属会社</Label>
      <Select value={safeValue} onValueChange={onChange}>
        <SelectTrigger id="companyType" className="w-full japanese-text">
          <SelectValue placeholder="所属会社" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all" className="japanese-text">全て</SelectItem>
          <SelectItem value="own" className="japanese-text">自社</SelectItem>
          <SelectItem value="other" className="japanese-text">他社</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanyTypeDropdown;
