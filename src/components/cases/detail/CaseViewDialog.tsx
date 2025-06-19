
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MailCase } from '../email/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CaseViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: MailCase | null;
}

export const CaseViewDialog: React.FC<CaseViewDialogProps> = ({
  isOpen,
  onClose,
  caseItem,
}) => {
  if (!caseItem) return null;

  // Helper function to get appropriate badge variant based on status
  const getBadgeVariant = (status: string) => {
    if (status === "募集中") return "success";
    if (status === "募集終了") return "completed";
    return "default";
  };

  console.log("Showing case detail dialog with data:", caseItem);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="japanese-text">{caseItem.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant={getBadgeVariant(caseItem.status)} className="japanese-text">{caseItem.status}</Badge>
            <div className="text-sm text-muted-foreground">
              登録日: {caseItem.registeredAt 
                ? format(new Date(caseItem.registeredAt), 'yyyy年MM月dd日 HH:mm') 
                : '未登録'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1 japanese-text">会社名</div>
              <div>{caseItem.company || '未設定'}</div>
            </div>
            <div>
              <div className="font-medium mb-1 japanese-text">勤務地</div>
              <div>{caseItem.location}</div>
            </div>
            <div>
              <div className="font-medium mb-1 japanese-text">スキル</div>
              <div className="flex flex-wrap gap-1">
                {caseItem.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-1 japanese-text">予算</div>
              <div>{caseItem.budget}</div>
            </div>
          </div>

          {/* Multiple senders section */}
          <div>
            <div className="font-medium mb-1 japanese-text">送信者</div>
            {caseItem.senders && caseItem.senders.length > 0 ? (
              <div className="space-y-2">
                {caseItem.senders.map((sender, index) => (
                  <div key={index} className="text-sm">
                    <div>{sender.name}</div>
                    <div className="text-muted-foreground">{sender.email}</div>
                    {sender.position && (
                      <div className="text-xs text-muted-foreground">{sender.position}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm">
                {caseItem.sender || '未設定'}
                {caseItem.senderEmail && ` (${caseItem.senderEmail})`}
              </div>
            )}
          </div>

          <div>
            <div className="font-medium mb-1 japanese-text">登録方式</div>
            <div className={`px-2 py-0.5 rounded text-xs inline-flex 
              ${caseItem.registrationType === "自動（メール）" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
              {caseItem.registrationType || "手動"}
            </div>
          </div>

          {/* Case detail description section */}
          {caseItem.detailDescription && (
            <div>
              <div className="font-medium mb-1 japanese-text">案件詳細</div>
              <div className="whitespace-pre-wrap text-sm border p-3 rounded-md bg-muted/10">
                {caseItem.detailDescription}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="japanese-text">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaseViewDialog;
