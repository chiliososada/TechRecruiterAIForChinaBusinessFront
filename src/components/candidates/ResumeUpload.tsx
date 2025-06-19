
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  
  // 技術者情報抽出の編集可能なフォームデータ
  const [candidateData, setCandidateData] = useState({
    name: '鈴木太郎',
    age: '32歳',
    gender: '男性',
    nationality: '日本',
    education: '東京工業大学 情報工学科',
    arrivalYear: '日本国籍',
    japaneseLevel: 'ネイティブレベル',
    englishLevel: 'ビジネスレベル',
    nearestStation: '品川駅',
    skills: [
      { name: 'Java', years: '7' },
      { name: 'Spring Boot', years: '5' },
      { name: 'AWS', years: '3' },
      { name: 'Docker', years: '2' }
    ],
    technicalKeywords: 'クラウド, マイクロサービス, CI/CD',
    selfPromotion: '金融系システム開発においてリーダー経験あり。Java技術を中心に長年の経験があります。',
    workScope: '要件定義, 設計, 実装, テスト',
    workExperience: '金融, 保険',
    remarks: '週4日勤務希望, 出張可, リモート可',
    companyType: '自社',
    certifications: 'AWS認定ソリューションアーキテクト, Oracle認定Javaプログラマー'
  });

  // 推薦文生成関連
  const [recommendationTemplate, setRecommendationTemplate] = useState(
    `[名前]は[スキル]を中心に[経験]年の開発経験があり、日本語は[日本語レベル]です。
[得意分野]に強みがあり、[ツール]などの技術も習得しています。
チームリーダーとしての経験もあり、要件定義から設計、実装、テストまでの一連の開発プロセスを担当できます。
[備考]`
  );
  const [recommendationText, setRecommendationText] = useState(
    "鈴木さんはJavaとSpring Bootを中心に7年以上の開発経験があり、日本語はネイティブレベルです。金融系のプロジェクトに強みがあり、AWSやDockerなどのクラウド技術も習得しています。チームリーダーとしての経験もあり、要件定義から設計、実装、テストまでの一連の開発プロセスを担当できます。直近では大手金融機関のオンラインバンキングシステム開発に5年間携わっており、セキュリティに関する知識も豊富です。週4日勤務希望、出張可能、リモート勤務可能。"
  );
  
  // 处理表单变更
  const handleFormChange = (field: string, value: string) => {
    setCandidateData(prev => ({ ...prev, [field]: value }));
  };

  // 处理技能变更
  const handleSkillChange = (index: number, field: 'name' | 'years', value: string) => {
    setCandidateData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = { ...updatedSkills[index], [field]: value };
      return { ...prev, skills: updatedSkills };
    });
  };

  // 生成推薦文
  const generateRecommendation = () => {
    toast.success('推薦文を生成中...', { duration: 2000 });
    
    setTimeout(() => {
      // テンプレートに基づいて推薦文を生成
      const newText = recommendationTemplate
        .replace('[名前]', `${candidateData.name}さん`)
        .replace('[スキル]', candidateData.skills.map(s => s.name).join('と'))
        .replace('[経験]', candidateData.skills[0]?.years || '5')
        .replace('[日本語レベル]', candidateData.japaneseLevel)
        .replace('[得意分野]', '金融系のプロジェクト')
        .replace('[ツール]', candidateData.skills.slice(2).map(s => s.name).join('や'))
        .replace('[備考]', candidateData.remarks);
        
      setRecommendationText(newText);
      toast.success('推薦文が生成されました');
    }, 2000);
  };

  // 保存候选人数据
  const handleSaveCandidate = () => {
    toast.success('候補者情報と推薦文が保存されました', {
      description: `${candidateData.name}さんのプロフィールが登録されました`
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && 
          file.type !== 'application/msword' && 
          file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast.error('サポートされていないファイル形式です', {
          description: 'PDFまたはWord (.doc, .docx) ファイルをアップロードしてください。'
        });
        return;
      }
      
      setIsUploading(true);
      // Simulate file processing
      setTimeout(() => {
        setIsUploading(false);
        toast.success('履歴書がアップロードされました', {
          description: `${file.name} の分析が完了しました。`
        });
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="japanese-text">履歴書をアップロード</CardTitle>
          <CardDescription className="japanese-text">
            PDFまたはWord形式の履歴書をアップロードして、自動的に情報を抽出します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resume-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold japanese-text">クリックして履歴書をアップロード</span>
                </p>
                <p className="text-xs text-muted-foreground japanese-text">PDF、.doc、または.docx形式</p>
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-8 h-8 border-4 border-t-custom-blue-500 border-custom-blue-200 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground japanese-text">
            アップロードされた履歴書から、基本情報、技術スタック、プロジェクト経歴、日本語能力などが自動的に抽出されます。
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">技術者情報抽出</CardTitle>
          <CardDescription className="japanese-text">
            AIにより抽出された候補者情報を編集できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">氏名</Label>
                <Input 
                  value={candidateData.name} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="japanese-text">年齢</Label>
                <Input 
                  value={candidateData.age} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('age', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">性別</Label>
                <Select 
                  value={candidateData.gender}
                  onValueChange={(value) => handleFormChange('gender', value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="性別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男性" className="japanese-text">男性</SelectItem>
                    <SelectItem value="女性" className="japanese-text">女性</SelectItem>
                    <SelectItem value="その他" className="japanese-text">その他</SelectItem>
                    <SelectItem value="回答しない" className="japanese-text">回答しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="japanese-text">国籍</Label>
                <Select 
                  value={candidateData.nationality}
                  onValueChange={(value) => handleFormChange('nationality', value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="国籍を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="日本" className="japanese-text">日本</SelectItem>
                    <SelectItem value="中国" className="japanese-text">中国</SelectItem>
                    <SelectItem value="インド" className="japanese-text">インド</SelectItem>
                    <SelectItem value="ベトナム" className="japanese-text">ベトナム</SelectItem>
                    <SelectItem value="その他" className="japanese-text">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">学歴</Label>
                <Input 
                  value={candidateData.education} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('education', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="japanese-text">来日年度</Label>
                <Input 
                  value={candidateData.arrivalYear} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('arrivalYear', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">資格</Label>
                <Input 
                  value={candidateData.certifications} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('certifications', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="japanese-text">最寄駅</Label>
                <Input 
                  value={candidateData.nearestStation} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('nearestStation', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">日本語レベル</Label>
                <Select 
                  value={candidateData.japaneseLevel}
                  onValueChange={(value) => handleFormChange('japaneseLevel', value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="日本語レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="japanese-text">英語レベル</Label>
                <Select 
                  value={candidateData.englishLevel}
                  onValueChange={(value) => handleFormChange('englishLevel', value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="英語レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">スキル</Label>
              <div className="grid grid-cols-2 gap-2">
                {candidateData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center border rounded-md p-2">
                    <Input 
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                      className="border-0 bg-transparent p-0 focus-visible:ring-0"
                    />
                    <span className="mx-2">:</span>
                    <Input
                      value={skill.years}
                      onChange={(e) => handleSkillChange(index, 'years', e.target.value)}
                      className="border-0 bg-transparent p-0 focus-visible:ring-0 w-12 text-right"
                    />
                    <span className="ml-1">年</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">技術キーワード</Label>
              <Input 
                value={candidateData.technicalKeywords} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('technicalKeywords', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">業務範囲</Label>
              <Input 
                value={candidateData.workScope} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('workScope', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">業務経験</Label>
              <Input 
                value={candidateData.workExperience} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('workExperience', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">自己アピール</Label>
              <Textarea 
                value={candidateData.selfPromotion} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('selfPromotion', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">備考</Label>
              <Textarea 
                value={candidateData.remarks} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('remarks', e.target.value)}
                placeholder="出勤制限、出張可否などを記入"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">推薦文生成</CardTitle>
          <CardDescription className="japanese-text">
            候補者の自動生成された推薦文
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recommendation-template" className="japanese-text">テンプレート</Label>
            <Textarea 
              id="recommendation-template" 
              className="min-h-[150px] japanese-text"
              value={recommendationTemplate}
              onChange={(e) => setRecommendationTemplate(e.target.value)}
              placeholder="[名前]、[スキル]、[経験]などのプレースホルダーを使用してください"
            />
            <p className="text-xs text-muted-foreground japanese-text">
              推薦文のテンプレートを編集できます。[名前]、[スキル]、[経験]などのプレースホルダーを使用します。
            </p>
          </div>
          
          <Button 
            onClick={generateRecommendation} 
            variant="outline" 
            className="w-full japanese-text"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            AIで推薦文を生成
          </Button>
          
          <div className="space-y-2">
            <Label htmlFor="generated-recommendation" className="japanese-text">生成された推薦文</Label>
            <Textarea 
              id="generated-recommendation"
              className="min-h-[150px] japanese-text" 
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveCandidate} className="japanese-text">
            <Save className="mr-2 h-4 w-4" />
            候補者と推薦文を保存
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ResumeUpload;
