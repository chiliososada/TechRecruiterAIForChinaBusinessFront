
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  CircleDollarSign, 
  Flag, 
  Users, 
  User, 
  Code, 
  FileText, 
  FileCode,
  MessageSquare
} from 'lucide-react';
import { MailCase } from '../email/types';
import { getDefaultProcesses } from '../utils/statusUtils';

interface CaseDetailFormProps {
  selectedCase: MailCase;
  editingCaseData: MailCase | null;
  toggleEditMode: () => void;
  handleEditChange: (field: string, value: any) => void;
  handleSaveEdit: () => void;
}

export const CaseDetailForm: React.FC<CaseDetailFormProps> = ({
  selectedCase,
  editingCaseData,
  toggleEditMode,
  handleEditChange,
  handleSaveEdit,
}) => {
  const processOptions = getDefaultProcesses();
  
  // Helper function to toggle process selection
  const toggleProcess = (process: string) => {
    if (!editingCaseData) return;
    
    const currentProcesses = editingCaseData.processes || [];
    const isSelected = currentProcesses.includes(process);
    
    const newProcesses = isSelected 
      ? currentProcesses.filter(p => p !== process)
      : [...currentProcesses, process];
    
    handleEditChange('processes', newProcesses);
  };

  // Helper function to get boolean value as string for Select component
  const getBooleanAsString = (value: boolean | undefined, fallback: boolean = false) => {
    return (value ?? fallback) ? "true" : "false";
  };

  // Helper function to get the current value with proper fallback
  const getCurrentValue = (field: keyof MailCase, fallback: any = '') => {
    return editingCaseData?.[field] ?? selectedCase[field] ?? fallback;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <Briefcase className="h-4 w-4 mr-1 text-gray-600" />
          案件名
        </label>
        <Input 
          value={getCurrentValue('title')} 
          onChange={(e) => handleEditChange('title', e.target.value)} 
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-gray-600" />
          参画開始日
        </label>
        <Input 
          type="date"
          value={getCurrentValue('startDate')} 
          onChange={(e) => handleEditChange('startDate', e.target.value)}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-600" />
          勤務地
        </label>
        <Input 
          value={getCurrentValue('location')} 
          onChange={(e) => handleEditChange('location', e.target.value)}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-1 text-gray-600" />
          単価
        </label>
        <Input 
          value={getCurrentValue('budget')} 
          onChange={(e) => handleEditChange('budget', e.target.value)}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-1 text-gray-600" />
          希望単価
        </label>
        <Input 
          value={getCurrentValue('desiredBudget')} 
          onChange={(e) => handleEditChange('desiredBudget', e.target.value)}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <MessageSquare className="h-4 w-4 mr-1 text-gray-600" />
          面談回数
        </label>
        <Input 
          type="number"
          min="1"
          value={getCurrentValue('interviewCount', '1')} 
          onChange={(e) => handleEditChange('interviewCount', e.target.value)}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <Flag className="h-4 w-4 mr-1 text-gray-600" />
          ステータス
        </label>
        <Select 
          value={getCurrentValue('status')}
          onValueChange={(value) => handleEditChange('status', value)}
        >
          <SelectTrigger className="border-primary/30 focus:border-primary">
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="募集中">募集中</SelectItem>
            <SelectItem value="募集完了">募集完了</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-600" />
          外国人採用
        </label>
        <Select 
          value={getBooleanAsString(getCurrentValue('foreignerAccepted', false))}
          onValueChange={(value) => handleEditChange('foreignerAccepted', value === "true")}
        >
          <SelectTrigger className="border-primary/30 focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">可能</SelectItem>
            <SelectItem value="false">不可</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <User className="h-4 w-4 mr-1 text-gray-600" />
          個人事業者
        </label>
        <Select 
          value={getBooleanAsString(getCurrentValue('freelancerAccepted', false))}
          onValueChange={(value) => handleEditChange('freelancerAccepted', value === "true")}
        >
          <SelectTrigger className="border-primary/30 focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">可能</SelectItem>
            <SelectItem value="false">不可</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-2 space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <Code className="h-4 w-4 mr-1 text-gray-600" />
          スキル要件（カンマ区切り）
        </label>
        <Input 
          value={(getCurrentValue('skills', [])).join(', ')} 
          onChange={(e) => handleEditChange('skills', e.target.value.split(',').map(s => s.trim()))}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      
      <div className="col-span-2 space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <FileCode className="h-4 w-4 mr-1 text-gray-600" />
          工程
        </label>
        <div className="grid grid-cols-2 gap-2 border rounded-md p-3 bg-muted/5">
          {processOptions.map((process) => (
            <div key={process} className="flex items-center space-x-2">
              <Checkbox 
                id={`process-${process}`} 
                checked={(getCurrentValue('processes', [])).includes(process)}
                onCheckedChange={() => toggleProcess(process)}
              />
              <Label htmlFor={`process-${process}`} className="text-sm japanese-text">
                {process}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="col-span-2 space-y-2">
        <label className="text-sm font-medium japanese-text flex items-center">
          <FileText className="h-4 w-4 mr-1 text-gray-600" />
          案件詳細
        </label>
        <Textarea 
          value={getCurrentValue('detailDescription')} 
          onChange={(e) => handleEditChange('detailDescription', e.target.value)}
          rows={8}
          className="border-primary/30 focus:border-primary"
        />
      </div>
      
      <div className="col-span-2 flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={toggleEditMode} className="border-gray-300">
          キャンセル
        </Button>
        <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
          保存
        </Button>
      </div>
    </div>
  );
};
