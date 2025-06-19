
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MailCase } from './types';
import { Badge } from '@/components/ui/badge';
import { Calendar, CircleDollarSign, Briefcase, MapPin, Clock, Code } from 'lucide-react';

interface CaseDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  caseItem: MailCase | null;
}

export const CaseDetailDialog: React.FC<CaseDetailDialogProps> = ({
  isOpen,
  setIsOpen,
  caseItem,
}) => {
  if (!caseItem) return null;

  const registrationDate = caseItem.registeredAt 
    ? format(new Date(caseItem.registeredAt), 'yyyy年MM月dd日 HH:mm')
    : '未登録';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl japanese-text">{caseItem.title}</DialogTitle>
          <DialogDescription className="japanese-text text-sm text-muted-foreground">
            {caseItem.company || '会社名なし'} - ID: {caseItem.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Registration info and status */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground japanese-text">登録日時</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="font-medium japanese-text">{registrationDate}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground japanese-text">登録方式</p>
                <div className={`px-2 py-1 rounded-md text-sm inline-flex 
                  ${caseItem.registrationType === "自動（メール）" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                  {caseItem.registrationType || "手動"}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground japanese-text">ステータス</p>
                <Badge className="japanese-text">{caseItem.status}</Badge>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium japanese-text">基本情報</h3>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">参画開始日</p>
                  <p className="japanese-text">{caseItem.startDate || '未定'}</p>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">勤務地</p>
                  <p className="japanese-text">{caseItem.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">稼働期間</p>
                  <p className="japanese-text">{caseItem.duration || '未定'}</p>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">稼働時間</p>
                  <p className="japanese-text">{caseItem.workType || '未定'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium japanese-text">予算情報</h3>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <CircleDollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">予算</p>
                  <p className="japanese-text">{caseItem.budget}</p>
                </div>
              </div>
              {caseItem.desiredBudget && (
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <CircleDollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm japanese-text">希望単価</p>
                    <p className="japanese-text">{caseItem.desiredBudget}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Code className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">外国人</p>
                  <Badge variant={caseItem.foreignerAccepted ? "outline" : "destructive"} className={`px-1.5 min-w-[24px] ${caseItem.foreignerAccepted ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                    {caseItem.foreignerAccepted ? '◯' : '✕'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                <Code className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm japanese-text">個人事業者</p>
                  <Badge variant={caseItem.freelancerAccepted ? "outline" : "destructive"} className={`px-1.5 min-w-[24px] ${caseItem.freelancerAccepted ? 'bg-green-100 text-green-800 border-green-200' : ''}`}>
                    {caseItem.freelancerAccepted ? '◯' : '✕'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-2">
            <h3 className="font-medium japanese-text">スキル要件</h3>
            <div className="flex flex-wrap gap-1.5">
              {caseItem.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {skill}
                </Badge>
              ))}
            </div>
            {caseItem.keyTechnologies && (
              <div className="mt-2">
                <p className="text-sm japanese-text">キー技術:</p>
                <p className="japanese-text">{caseItem.keyTechnologies}</p>
              </div>
            )}
          </div>

          {/* Sender Information */}
          <div className="space-y-2">
            <h3 className="font-medium japanese-text">送信者情報</h3>
            {caseItem.senders && caseItem.senders.length > 0 ? (
              <div className="divide-y">
                {caseItem.senders.map((sender, index) => (
                  <div key={index} className="py-2">
                    <p className="font-medium japanese-text">{sender.name}</p>
                    <p className="text-sm text-muted-foreground">{sender.email}</p>
                    {sender.position && <p className="text-xs text-muted-foreground japanese-text">{sender.position}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground japanese-text">
                {caseItem.sender || '送信者情報なし'}
                {caseItem.senderEmail && ` (${caseItem.senderEmail})`}
              </p>
            )}
          </div>

          {/* Description if available */}
          {caseItem.detailDescription && (
            <div className="space-y-2">
              <h3 className="font-medium japanese-text">案件詳細</h3>
              <div className="bg-muted/30 p-3 rounded-lg whitespace-pre-wrap japanese-text">
                {caseItem.detailDescription}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="japanese-text">閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CaseDetailDialog;
