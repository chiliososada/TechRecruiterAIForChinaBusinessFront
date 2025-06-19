import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Wand2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function CaseUploadForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');
  const [beautifiedText, setBeautifiedText] = useState('');
  const [formatTemplate, setFormatTemplate] = useState(
    '案件: [案件名]\n' +
    '必須スキル: [スキル]\n' +
    '経験年数: [年数]\n' +
    '勤務地: [場所]\n' +
    '単価: [単価]\n' +
    '参画開始日: [開始日]\n' +
    '備考: [備考]'
  );

  const handleDescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        toast.success('案件情報が処理されました', {
          description: '入力された案件情報が構造化されました'
        });
        
        // Generate beautified text (in a real app, this would be done by AI)
        const generatedText = beautifyText(description, formatTemplate);
        setBeautifiedText(generatedText);
      }, 2000);
    }
  };
  
  // Simple function to simulate AI beautifying the text based on template
  const beautifyText = (text: string, template: string) => {
    // In a real app, this would call an AI service
    // For now, we'll just do a simple simulation
    
    // Extract some keywords from the description
    const skills = ['Java', 'Spring Boot', 'AWS'].filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).join(', ') || 'Java, Spring Boot';
    
    const hasLocation = text.includes('東京') ? '東京' : 
                        text.includes('大阪') ? '大阪' : 
                        text.includes('リモート') ? 'リモート' : '東京（リモート可）';
                        
    const hasBudget = text.includes('万円') ? 
                     text.match(/\d+\s*[~～]\s*\d+\s*万円/) ? 
                     text.match(/\d+\s*[~～]\s*\d+\s*万円/)![0] : 
                     '60~80万円' : '60~80万円';
    
    // Replace placeholders in template
    return template
      .replace('[案件名]', text.length > 20 ? text.substring(0, 20) + '...' : text)
      .replace('[スキル]', skills)
      .replace('[年数]', '3年以上')
      .replace('[場所]', hasLocation)
      .replace('[単価]', hasBudget)
      .replace('[開始日]', '即日')
      .replace('[備考]', text);
  };

  const handleAIBeautify = () => {
    if (!description.trim()) {
      toast.error('案件情報を入力してください');
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      const beautified = beautifyText(description, formatTemplate);
      setBeautifiedText(beautified);
      setIsProcessing(false);
      toast.success('AIが案件情報を美化しました');
    }, 1500);
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleDescriptionSubmit}>
        <CardHeader>
          <CardTitle className="japanese-text">案件情報を入力</CardTitle>
          <CardDescription className="japanese-text">
            口頭の案件情報を入力して、構造化されたデータに変換します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex space-x-2">
              <div className="bg-primary/10 p-2 rounded-md mt-1">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <Label htmlFor="case-description" className="text-sm font-medium mb-1 japanese-text">案件の説明</Label>
                <Textarea
                  id="case-description"
                  placeholder="例：「Java、SpringBootの経験者を募集しています。勤務地は東京、期間は6ヶ月～、単価は60〜80万円です。」"
                  className="min-h-[120px] japanese-text border-primary/30 focus:border-primary mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div className="bg-blue-100 p-2 rounded-md mt-1">
                <FileText className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex-1">
                <Label htmlFor="format-template" className="text-sm font-medium mb-1 japanese-text">出力フォーマット</Label>
                <Textarea
                  id="format-template"
                  placeholder="出力フォーマットのテンプレート"
                  className="h-20 japanese-text border-primary/30 focus:border-primary mt-1"
                  value={formatTemplate}
                  onChange={(e) => setFormatTemplate(e.target.value)}
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground japanese-text mt-1">
                  フォーマットに[案件名]、[スキル]、[年数]などのプレースホルダーを使用してください
                </p>
              </div>
            </div>
            
            {beautifiedText && (
              <div className="flex space-x-2 mt-2">
                <div className="bg-green-100 p-2 rounded-md mt-1">
                  <FileText className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="beautified-text" className="text-sm font-medium mb-1 japanese-text">AI生成された案件情報</Label>
                  <div className="bg-muted p-4 rounded-md mt-1">
                    <pre className="text-sm whitespace-pre-wrap japanese-text">{beautifiedText}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button 
            type="button" 
            variant="outline"
            className="japanese-text w-full sm:w-auto" 
            onClick={handleAIBeautify}
            disabled={isProcessing || !description.trim()}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            AIで美化
          </Button>
          
          <Button 
            type="submit" 
            className="japanese-text w-full sm:w-auto" 
            disabled={!description.trim() || isProcessing}
          >
            {isProcessing ? (
              <>処理中...</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                分析して構造化
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CaseUploadForm;
