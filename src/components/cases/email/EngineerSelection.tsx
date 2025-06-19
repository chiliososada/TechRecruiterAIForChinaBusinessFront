
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, User } from 'lucide-react';
import { Engineer } from './types'; // Fixed the import path

interface EngineerSelectionProps {
  selectedEngineers: Engineer[];
  openEngineerDialog: () => void;
  removeSelectedEngineer: (engineerId: string) => void;
  applyEngineerToTemplate: () => void;
  selectedCasesLength: number;
}

export const EngineerSelection: React.FC<EngineerSelectionProps> = ({
  selectedEngineers,
  openEngineerDialog,
  removeSelectedEngineer,
  applyEngineerToTemplate,
  selectedCasesLength
}) => {
  // Updated helper function to determine badge color based on status
  const getBadgeVariant = (status: string) => {
    if (status === "提案中") return "proposed";
    if (status === "事前面談") return "preliminary";
    if (status === "面談") return "interview";
    if (status === "結果待ち") return "waiting";
    if (status === "営業終了") return "completed";
    return "default"; // fallback
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between items-center">
        <Label className="japanese-text text-lg font-medium">技術者を選択</Label>
        <Button 
          onClick={openEngineerDialog} 
          variant="outline" 
          size="sm" 
          className="japanese-text"
        >
          <Search className="mr-2 h-4 w-4" />
          技術者を検索
        </Button>
      </div>

      {selectedEngineers.length > 0 ? (
        <div className="border rounded-md p-4 space-y-3">
          {selectedEngineers.map(engineer => (
            <div 
              key={engineer.id} 
              className="flex justify-between items-center bg-muted/50 p-2 rounded-md"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium japanese-text">{engineer.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground japanese-text">
                      {Array.isArray(engineer.skills) ? engineer.skills.join(", ") : engineer.skills} | {engineer.experience}
                    </p>
                    {Array.isArray(engineer.status) && engineer.status.length > 0 ? (
                      <Badge variant={getBadgeVariant(engineer.status[0]) as any} className="text-xs">
                        {engineer.status[0]}
                      </Badge>
                    ) : engineer.status ? (
                      <Badge variant={getBadgeVariant(engineer.status.toString()) as any} className="text-xs">
                        {engineer.status.toString()}
                      </Badge>
                    ) : null}
                    
                    {engineer.companyType === '他社' && engineer.companyName && (
                      <Badge variant="outline" className="text-xs">
                        {engineer.companyName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeSelectedEngineer(engineer.id)}
                className="h-8 w-8 p-0"
              >
                &times;
              </Button>
            </div>
          ))}

          <Button 
            onClick={applyEngineerToTemplate} 
            className="w-full japanese-text mt-2"
            variant="secondary"
            disabled={selectedCasesLength === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            選択した技術者を本文に反映
          </Button>
        </div>
      ) : (
        <div className="border rounded-md p-4 flex flex-col items-center justify-center h-[200px] text-center">
          <User className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
          <p className="text-muted-foreground japanese-text">技術者が選択されていません</p>
          <p className="text-xs text-muted-foreground japanese-text mt-1">
            「技術者を検索」ボタンをクリックして技術者を選択してください
          </p>
        </div>
      )}
    </div>
  );
};
