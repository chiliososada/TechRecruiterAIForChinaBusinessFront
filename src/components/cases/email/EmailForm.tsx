import React, { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplate } from './hooks/useEmailTemplates';
import { MailCheck, Send, Sparkles, MailPlus, Pencil, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface EmailFormProps {
  emailTemplates: EmailTemplate[];
  templatesLoading?: boolean;
  selectedTemplate: string;
  handleTemplateChange: (templateId: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  emailBody: string;
  setEmailBody: (body: string) => void;
  signature: string;
  setSignature: (signature: string) => void;
  handleEnhanceEmail: () => void;
  handleSendEmail: () => void;
  handleTestEmail?: () => void; // New optional prop for test email functionality
  sending: boolean;
  selectedCasesCount: number;
  hideOptimizationSection?: boolean;
}

export function EmailForm({
  emailTemplates,
  templatesLoading = false,
  selectedTemplate,
  handleTemplateChange,
  subject,
  setSubject,
  emailBody,
  setEmailBody,
  signature,
  setSignature,
  handleEnhanceEmail,
  handleSendEmail,
  handleTestEmail,
  sending,
  selectedCasesCount,
  hideOptimizationSection = false
}: EmailFormProps) {
  // Ensure selectedTemplate is never undefined or null
  const safeSelectedTemplate = selectedTemplate || "";
  
  // State to track if signature is visible in the preview
  const [showSignature, setShowSignature] = React.useState(true);
  // State to store draft signature before applying it
  const [draftSignature, setDraftSignature] = React.useState(signature);
  // State to control which tab is active
  const [activeTab, setActiveTab] = React.useState("compose");
  
  // Initialize draft signature when component mounts or signature prop changes
  React.useEffect(() => {
    setDraftSignature(signature);
  }, [signature]);
  
  // Reset to compose tab when component mounts (when 一括送信 tab is selected)
  React.useEffect(() => {
    setActiveTab("compose");
  }, []);
  
  // Handle signature changes in the textarea
  const handleSignatureChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftSignature(e.target.value);
  };
  
  // Apply signature button handler
  const handleApplySignature = () => {
    setSignature(draftSignature);
    setShowSignature(true);
    toast("署名設定が完了しました", {
      description: "メール送信時に署名が適用されます",
    });
  };
  
  // Toggle signature visibility
  const toggleSignatureVisibility = () => {
    setShowSignature(!showSignature);
  };
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border-primary/10 overflow-hidden">
      <div className="bg-gradient-to-r from-custom-blue-600/80 to-custom-blue-400/70 h-1"></div>
      <CardHeader className="pb-4 bg-gradient-to-b from-muted/30 to-transparent">
        <CardTitle className="flex items-center space-x-2 japanese-text">
          <MailPlus className="h-5 w-5 text-custom-blue-600" />
          <span>メール作成</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-2">
            <TabsTrigger value="compose" className="japanese-text">メール作成</TabsTrigger>
            <TabsTrigger value="signature" className="japanese-text">署名設定</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email-template" className="japanese-text">テンプレート選択</Label>
                {templatesLoading && (
                  <span className="text-xs text-muted-foreground">読み込み中...</span>
                )}
              </div>
              <Select value={safeSelectedTemplate} onValueChange={handleTemplateChange} disabled={templatesLoading}>
                <SelectTrigger className="japanese-text">
                  <SelectValue placeholder={templatesLoading ? "テンプレートを読み込み中..." : "テンプレートを選択"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-template">テンプレートなし</SelectItem>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-subject" className="japanese-text">件名</Label>
              <Input 
                id="email-subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="japanese-text"
                placeholder="メールの件名を入力してください" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-body" className="japanese-text">本文</Label>
              <Textarea 
                id="email-body" 
                value={emailBody} 
                onChange={(e) => setEmailBody(e.target.value)} 
                className="min-h-[200px] japanese-text resize-y"
                placeholder="メール本文を入力してください" 
              />
            </div>

            {/* Signature Preview with improved toggle */}
            {signature && (
              <div className="mt-4 pt-2 border-t border-dashed border-muted-foreground/30">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm text-muted-foreground japanese-text flex items-center gap-1">
                    <Pencil className="h-3 w-3" />
                    設定された署名
                  </Label>
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

            {!hideOptimizationSection && (
              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEnhanceEmail}
                  disabled={sending || !emailBody.trim()}
                  className="w-full bg-gradient-to-r from-custom-blue-600 to-custom-blue-500 hover:from-custom-blue-700 hover:to-custom-blue-600 text-white japanese-text"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {sending ? 'AIによる最適化中...' : 'AIでメール本文を最適化'}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="signature" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature" className="japanese-text">署名</Label>
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
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 px-6 pb-6 bg-gradient-to-t from-muted/10 to-transparent">
        <Button
          type="button"
          variant="outline"
          onClick={handleTestEmail}
          disabled={sending || !subject.trim() || !emailBody.trim()}
          className="w-full sm:w-auto japanese-text hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        >
          <MailCheck className="h-4 w-4 mr-2" />
          テストメール送信
        </Button>
        <Button
          type="button"
          onClick={handleSendEmail}
          disabled={sending || selectedCasesCount === 0}
          className="w-full sm:w-auto japanese-text bg-gradient-to-r from-custom-blue-600 to-custom-blue-500 hover:from-custom-blue-700 hover:to-custom-blue-600 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? '送信中...' : selectedCasesCount > 0 ? `${selectedCasesCount}名にメール送信` : 'メール送信'}
        </Button>
      </CardFooter>
    </Card>
  );
}
