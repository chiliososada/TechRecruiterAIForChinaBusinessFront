
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Engineer } from '../types';

interface EngineerListProps {
  paginatedEngineers: Engineer[];
  selectedEngineers: Engineer[];
  toggleEngineerSelection: (engineer: Engineer) => void;
  filteredEngineersLength: number;
}

export const EngineerList: React.FC<EngineerListProps> = ({
  paginatedEngineers,
  selectedEngineers,
  toggleEngineerSelection,
  filteredEngineersLength
}) => {
  // Updated function to determine badge variant based on status
  const getBadgeVariant = (status: string | string[]) => {
    const statusString = Array.isArray(status) ? status[0] : status;
    
    if (statusString === "提案中") return "proposed";
    if (statusString === "事前面談") return "preliminary";
    if (statusString === "面談") return "interview";
    if (statusString === "結果待ち") return "waiting";
    if (statusString === "営業終了") return "completed";
    return "default"; // fallback
  };
  
  // Helper function to safely convert skills to a string
  const formatSkills = (skills: string | string[] | undefined): string => {
    if (!skills) return '';
    if (Array.isArray(skills)) return skills.join(', ');
    return skills;
  };
  
  // Filter out inactive engineers - only show active ones
  const activeEngineers = paginatedEngineers.filter(engineer => {
    // 如果工程师数据中没有 isActive 字段，默认显示；如果有该字段，只显示 isActive 为 true 的
    return engineer.isActive !== false;
  });
  
  return (
    <div className="space-y-2">
      {activeEngineers.map(engineer => {
        const isSelected = selectedEngineers.some(e => e.id === engineer.id);
        const badgeVariant = getBadgeVariant(engineer.status || '');
        
        return (
          <div 
            key={engineer.id}
            onClick={() => toggleEngineerSelection(engineer)}
            className={`p-3 rounded-md flex items-center justify-between cursor-pointer border 
              ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
          >
            <div className="space-y-1">
              <p className="font-medium japanese-text">{engineer.name}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="japanese-text mr-2">スキル:</span>
                <span className="japanese-text">{formatSkills(engineer.skills)}</span>
              </div>
              <div className="flex items-center text-xs">
                <span className="japanese-text mr-2">経験:</span>
                <span className="japanese-text">{engineer.experience}</span>
                <span className="mx-2">|</span>
                <Badge variant={badgeVariant as any} className="japanese-text text-xs font-medium">
                  {Array.isArray(engineer.status) ? engineer.status[0] : engineer.status}
                </Badge>
                {engineer.companyType && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="japanese-text">{engineer.companyType}</span>
                  </>
                )}
              </div>
            </div>
            
            <Checkbox 
              checked={isSelected}
              className="pointer-events-none"
            />
          </div>
        );
      })}
      
      {activeEngineers.length === 0 && filteredEngineersLength === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground japanese-text">検索条件に一致する技術者がいません</p>
        </div>
      )}
    </div>
  );
};
