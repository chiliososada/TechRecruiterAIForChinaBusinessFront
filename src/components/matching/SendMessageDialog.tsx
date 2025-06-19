
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedMatchingResult } from './types';
import { toast } from 'sonner';
import { Send, Pencil, Eye, EyeOff, User, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Define email templates
const EMAIL_TEMPLATES = [
  {
    id: 'template-intro',
    name: '案件紹介テンプレート',
    subject: '【案件紹介】{{caseName}} - {{caseCompany}}',
    body: `{{recipientName}} 様\n\n株式会社〇〇の〇〇でございます。\n\nこの度は、以下の案件をご紹介させていただきます。\n\n■案件名: {{caseName}}\n■クライアント: {{caseCompany}}\n■スキル: {{caseSkills}}\n■担当者: {{caseManager}}\n\n{{caseDescription}}\n\nご興味がございましたら、ご連絡いただければ幸いです。\n\nよろしくお願い申し上げます。`
  },
  {
    id: 'template-candidate',
    name: '人材紹介テンプレート',
    subject: '【人材紹介】{{candidateName}} - {{candidateSkills}}',
    body: `{{recipientName}} 様\n\n株式会社〇〇の〇〇でございます。\n\nこの度は、以下の人材をご紹介させていただきます。\n\n■名前: {{candidateName}}\n■スキル: {{candidateSkills}}\n■経験: {{candidateExperience}}\n\n上記案件に最適なマッチングと判断いたしました。ご検討いただけますと幸いです。\n\nよろしくお願い申し上げます。`
  }
];

interface SendMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: EnhancedMatchingResult | null;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  isOpen,
  onClose,
  matchData,
}) => {
  // Initialize all state variables unconditionally
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [signature, setSignature] = useState('');
  const [draftSignature, setDraftSignature] = useState('');
  const [showSignature, setShowSignature] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);

  // This useEffect will run whenever isOpen or matchData changes
  useEffect(() => {
    if (isOpen && matchData) {
      // Default to case manager email if available
      const managerEmail = matchData.caseManagerEmail || '';
      setEmailAddress(managerEmail);
    }
  }, [isOpen, matchData]);
  
  // Early return if dialog shouldn't be shown
  if (!isOpen || !matchData) {
    return null;
  }

  const recipientCompany = matchData.caseCompany || '未設定';
  
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId === 'no-template') {
      return;
    }
    
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    // Replace placeholders in template
    let newSubject = template.subject;
    let newBody = template.body;
    
    // Replace case placeholders
    newSubject = newSubject.replace(/{{caseName}}/g, matchData.caseName || '');
    newSubject = newSubject.replace(/{{caseCompany}}/g, matchData.caseCompany || '');
    
    newBody = newBody.replace(/{{recipientName}}/g, matchData.caseCompany || '担当者');
    newBody = newBody.replace(/{{caseName}}/g, matchData.caseName || '');
    newBody = newBody.replace(/{{caseCompany}}/g, matchData.caseCompany || '');
    newBody = newBody.replace(/{{caseSkills}}/g, 'Java, Spring, React, TypeScript');
    newBody = newBody.replace(/{{caseDescription}}/g, '金融系システムの開発案件です。React, TypeScriptを使用した画面開発が主な業務となります。');
    newBody = newBody.replace(/{{caseManager}}/g, matchData.caseManager || '未設定');
    
    // Replace candidate placeholders
    newBody = newBody.replace(/{{candidateName}}/g, matchData.candidateName || '');
    newBody = newBody.replace(/{{candidateSkills}}/g, 'Java, Spring, React, TypeScript');
    newBody = newBody.replace(/{{candidateExperience}}/g, '5年');
    
    setSubject(newSubject);
    setMessage(newBody);
  };

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("エラー", {
        description: "件名とメッセージを入力してください",
      });
      return;
    }

    if (!emailAddress.trim()) {
      toast.error("エラー", {
        description: "送信先を入力してください",
      });
      return;
    }

    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      toast.success("送信完了", {
        description: "メッセージが正常に送信されました",
      });
      onClose();
    }, 1000);
  };
  
  const handleSignatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftSignature(e.target.value);
  };
  
  const handleApplySignature = () => {
    setSignature(draftSignature);
    setShowSignature(true);
    toast.success("署名設定が完了しました", {
      description: "メール送信時に署名が適用されます",
    });
  };
  
  const toggleSignatureVisibility = () => {
    setShowSignature(!showSignature);
  };
  
  const getFullMessage = () => {
    if (!signature || !showSignature) return message;
    return message.trim() + '\n\n' + signature;
  };

  // Handle selecting a contact for email
  const handleSelectCaseManager = () => {
    if (matchData.caseManagerEmail) {
      setEmailAddress(matchData.caseManagerEmail);
      toast.success("メールアドレスを設定しました", {
        description: `案件担当者: ${matchData.caseManager}のメールアドレスを設定しました`,
      });
    } else {
      toast.error("メールアドレスがありません", {
        description: "案件担当者のメールアドレスが設定されていません",
      });
    }
    setIsContactSelectOpen(false);
  };

  const handleSelectAffiliationManager = () => {
    if (matchData.affiliationManagerEmail) {
      setEmailAddress(matchData.affiliationManagerEmail);
      toast.success("メールアドレスを設定しました", {
        description: `所属担当者: ${matchData.affiliationManager}のメールアドレスを設定しました`,
      });
    } else {
      toast.error("メールアドレスがありません", {
        description: "所属担当者のメールアドレスが設定されていません",
      });
    }
    setIsContactSelectOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="japanese-text">
              メール送信
            </DialogTitle>
            <DialogDescription className="japanese-text">
              {recipientCompany}に{matchData.caseName}について連絡します
              <div className="flex flex-col space-y-1 mt-2">
                {matchData.caseManager && (
                  <div 
                    className="text-sm font-medium flex items-center text-blue-700 hover:text-blue-900 cursor-pointer"
                    onClick={() => setIsContactSelectOpen(true)}
                  >
                    <User className="h-3.5 w-3.5 mr-1" />
                    案件担当者: {matchData.caseManager}
                    {matchData.caseManagerEmail && (
                      <span className="text-xs ml-1.5 text-blue-500">({matchData.caseManagerEmail})</span>
                    )}
                  </div>
                )}
                {matchData.affiliationManager && (
                  <div 
                    className="text-sm font-medium flex items-center text-green-700 hover:text-green-900 cursor-pointer"
                    onClick={() => setIsContactSelectOpen(true)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    所属担当者: {matchData.affiliationManager}
                    {matchData.affiliationManagerEmail && (
                      <span className="text-xs ml-1.5 text-green-500">({matchData.affiliationManagerEmail})</span>
                    )}
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="compose" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="compose" className="japanese-text">メール作成</TabsTrigger>
              <TabsTrigger value="signature" className="japanese-text">署名設定</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="email-template" className="text-sm font-medium japanese-text">テンプレート選択</label>
                </div>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="テンプレートを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-template" className="japanese-text">テンプレートなし</SelectItem>
                    {EMAIL_TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id} className="japanese-text">
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="recipient" className="text-sm font-medium japanese-text flex justify-between">
                  <span>送信先</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs japanese-text flex items-center gap-1 text-blue-600"
                    onClick={() => setIsContactSelectOpen(true)}
                  >
                    <Users className="h-3.5 w-3.5 mr-0.5" />
                    担当者を選択
                  </Button>
                </label>
                <Input
                  id="recipient"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="メールアドレスを入力してください"
                  className="japanese-text"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="text-sm font-medium japanese-text">件名</label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="件名を入力してください"
                  className="japanese-text"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="text-sm font-medium japanese-text">本文</label>
                <Textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="メッセージを入力してください"
                  className="japanese-text min-h-[200px]"
                />
              </div>
              
              {/* Signature Preview */}
              {signature && (
                <div className="mt-4 pt-2 border-t border-dashed border-muted-foreground/30">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-muted-foreground japanese-text flex items-center gap-1">
                      <Pencil className="h-3 w-3" />
                      設定された署名
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs japanese-text flex items-center gap-1"
                      onClick={toggleSignatureVisibility}
                    >
                      {showSignature ? (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          非表示
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          表示
                        </>
                      )}
                    </Button>
                  </div>
                  {showSignature && (
                    <div className="bg-muted/30 rounded p-2 text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                      {signature}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signature" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signature" className="text-sm font-medium japanese-text">署名</label>
                <Textarea 
                  id="signature" 
                  value={draftSignature} 
                  onChange={handleSignatureChange} 
                  className="min-h-[200px] japanese-text resize-y"
                  placeholder="メール署名を入力してください。" 
                />
                <p className="text-xs text-muted-foreground japanese-text">
                  全てのメールの送信時に追加されます。
                </p>
              </div>
              
              <Button 
                type="button" 
                onClick={handleApplySignature}
                className="w-full japanese-text"
              >
                署名を設定する
              </Button>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="sm:justify-end pt-4 border-t mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="japanese-text"
            >
              キャンセル
            </Button>
            <Button 
              type="button" 
              onClick={handleSend}
              disabled={sending}
              className="japanese-text"
            >
              {sending ? (
                <>処理中...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  送信する
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact selection dialog */}
      <AlertDialog open={isContactSelectOpen} onOpenChange={setIsContactSelectOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="japanese-text">担当者を選択</AlertDialogTitle>
            <AlertDialogDescription className="japanese-text">
              メールの送信先として使用する担当者を選択してください
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-3">
            {matchData.caseManager && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                onClick={handleSelectCaseManager}
              >
                <User className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{matchData.caseManager}</div>
                  <div className="text-xs text-muted-foreground">
                    {matchData.caseManagerEmail || 'メールアドレスなし'}
                  </div>
                </div>
              </Button>
            )}
            
            {matchData.affiliationManager && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50"
                onClick={handleSelectAffiliationManager}
              >
                <Users className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{matchData.affiliationManager}</div>
                  <div className="text-xs text-muted-foreground">
                    {matchData.affiliationManagerEmail || 'メールアドレスなし'}
                  </div>
                </div>
              </Button>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="japanese-text">キャンセル</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
