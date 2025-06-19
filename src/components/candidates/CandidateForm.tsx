
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { NewEngineerType } from './types';

interface CandidateFormProps {
  initialData: NewEngineerType;
  onSubmit: (e: React.FormEvent) => void;
  onDataChange: (data: NewEngineerType) => void;
  onCreateEngineer?: (data: NewEngineerType) => Promise<boolean>;
  recommendationTemplate: string;
  recommendationText: string;
  onRecommendationTemplateChange: (value: string) => void;
  onRecommendationTextChange: (value: string) => void;
  onGenerateRecommendation: () => void;
  isOwnCompany: boolean;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({
  initialData,
  onSubmit,
  onDataChange,
  onCreateEngineer,
  recommendationTemplate,
  recommendationText,
  onRecommendationTemplateChange,
  onRecommendationTextChange,
  onGenerateRecommendation,
  isOwnCompany
}) => {
  const [formData, setFormData] = useState<NewEngineerType>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof NewEngineerType, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields with detailed messages
    const missingFields: string[] = [];
    
    if (!formData.name || formData.name.trim() === '') {
      missingFields.push('氏名');
    }
    
    if (!formData.skills || formData.skills.trim() === '') {
      missingFields.push('保有スキル');
    }
    
    if (!formData.japaneseLevel || formData.japaneseLevel === 'placeholder' || formData.japaneseLevel.trim() === '') {
      missingFields.push('日本語レベル');
    }
    
    if (!formData.experience || formData.experience.trim() === '') {
      missingFields.push('経験年数');
    }

    if (!isOwnCompany && (!formData.companyName || formData.companyName.trim() === '')) {
      missingFields.push('所属会社');
    }

    if (missingFields.length > 0) {
      toast.error(`次の必須項目を入力してください: ${missingFields.join('、')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onCreateEngineer) {
        const success = await onCreateEngineer(formData);
        if (success) {
          // Reset form after successful submission
          setFormData(initialData);
          toast.success('技術者情報を正常に登録しました');
        }
      } else {
        onSubmit(e);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">新規技術者登録</CardTitle>
          <CardDescription className="japanese-text">
            技術者情報を登録します（<span className="text-red-500">*</span>は必須項目）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6" id="engineer-form">            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="japanese-text">氏名 <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="例: 山田太郎"
                  className="japanese-text"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="japanese-text">メールアドレス</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="例: yamada@example.com"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="japanese-text">電話番号</Label>
                <Input 
                  id="phone" 
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="例: 090-1234-5678"
                  className="japanese-text"
                />
              </div>
              
              {!isOwnCompany && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="japanese-text">所属会社 <span className="text-red-500">*</span></Label>
                  <Input 
                    id="companyName" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="例: テックイノベーション株式会社"
                    className="japanese-text"
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nationality" className="japanese-text">国籍</Label>
                <Select
                  value={formData.nationality || "placeholder"}
                  onValueChange={(value) => handleChange('nationality', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="国籍を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="日本" className="japanese-text">日本</SelectItem>
                    <SelectItem value="中国" className="japanese-text">中国</SelectItem>
                    <SelectItem value="インド" className="japanese-text">インド</SelectItem>
                    <SelectItem value="ベトナム" className="japanese-text">ベトナム</SelectItem>
                    <SelectItem value="その他" className="japanese-text">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age" className="japanese-text">年齢</Label>
                <Input 
                  id="age" 
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="例: 30歳"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender" className="japanese-text">性別</Label>
                <Select
                  value={formData.gender || "placeholder"}
                  onValueChange={(value) => handleChange('gender', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="性別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="男性" className="japanese-text">男性</SelectItem>
                    <SelectItem value="女性" className="japanese-text">女性</SelectItem>
                    <SelectItem value="回答しない" className="japanese-text">回答しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nearestStation" className="japanese-text">最寄駅</Label>
                <Input 
                  id="nearestStation" 
                  value={formData.nearestStation}
                  onChange={(e) => handleChange('nearestStation', e.target.value)}
                  placeholder="例: 東京駅"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education" className="japanese-text">学歴</Label>
                <Input 
                  id="education" 
                  value={formData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  placeholder="例: 東京大学工学部"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="arrivalYear" className="japanese-text">来日年度</Label>
                <Input 
                  id="arrivalYear" 
                  value={formData.arrivalYear}
                  onChange={(e) => handleChange('arrivalYear', e.target.value)}
                  placeholder="例: 2015年"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills" className="japanese-text">保有スキル <span className="text-red-500">*</span></Label>
                <Input 
                  id="skills" 
                  value={formData.skills}
                  onChange={(e) => handleChange('skills', e.target.value)}
                  placeholder="例: Java, Spring Boot, AWS（カンマ区切り）"
                  className="japanese-text"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technicalKeywords" className="japanese-text">技術キーワード</Label>
                <Input 
                  id="technicalKeywords" 
                  value={formData.technicalKeywords}
                  onChange={(e) => handleChange('technicalKeywords', e.target.value)}
                  placeholder="例: クラウド, マイクロサービス, CI/CD"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="certifications" className="japanese-text">資格</Label>
                <Input 
                  id="certifications" 
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  placeholder="例: AWS認定ソリューションアーキテクト, Oracle認定Javaプログラマー"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="japanese" className="japanese-text">日本語レベル <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.japaneseLevel || "placeholder"}
                  onValueChange={(value) => handleChange('japaneseLevel', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="日本語レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="english" className="japanese-text">英語レベル</Label>
                <Select
                  value={formData.englishLevel || "placeholder"}
                  onValueChange={(value) => handleChange('englishLevel', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="英語レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience" className="japanese-text">経験年数 <span className="text-red-500">*</span></Label>
                <Input 
                  id="experience" 
                  value={formData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  placeholder="例: 5年"
                  className="japanese-text"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workScope" className="japanese-text">業務範囲</Label>
                <Input 
                  id="workScope" 
                  value={formData.workScope}
                  onChange={(e) => handleChange('workScope', e.target.value)}
                  placeholder="例: 製造, テスト, 要件定義"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workExperience" className="japanese-text">業務経験</Label>
                <Input 
                  id="workExperience" 
                  value={formData.workExperience}
                  onChange={(e) => handleChange('workExperience', e.target.value)}
                  placeholder="例: 金融, 保険, EC"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability" className="japanese-text">稼働可能時期</Label>
                <Input 
                  id="availability" 
                  value={formData.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  placeholder="例: 即日、1ヶ月後、応相談"
                  className="japanese-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="japanese-text">ステータス</Label>
                <Select
                  value={formData.status || "placeholder"}
                  onValueChange={(value) => handleChange('status', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="提案中" className="japanese-text">提案中</SelectItem>
                    <SelectItem value="事前面談" className="japanese-text">事前面談</SelectItem>
                    <SelectItem value="面談" className="japanese-text">面談</SelectItem>
                    <SelectItem value="結果待ち" className="japanese-text">結果待ち</SelectItem>
                    <SelectItem value="契約中" className="japanese-text">契約中</SelectItem>
                    <SelectItem value="営業終了" className="japanese-text">営業終了</SelectItem>
                    <SelectItem value="アーカイブ" className="japanese-text">アーカイブ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="selfPromotion" className="japanese-text">自己アピール</Label>
              <Textarea 
                id="selfPromotion" 
                value={formData.selfPromotion}
                onChange={(e) => handleChange('selfPromotion', e.target.value)}
                placeholder="候補者の自己アピールを入力"
                className="japanese-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remarks" className="japanese-text">備考</Label>
              <Textarea 
                id="remarks" 
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="出勤制限、出張可否などを記入"
                className="japanese-text"
              />
            </div>
          </form>
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
              onChange={(e) => onRecommendationTemplateChange(e.target.value)}
              placeholder="[名前]、[スキル]、[経験]などのプレースホルダーを使用してください"
            />
            <p className="text-xs text-muted-foreground japanese-text">
              推薦文のテンプレートを編集できます。[名前]、[スキル]、[経験]などのプレースホルダーを使用します。
            </p>
          </div>
          
          <Button 
            onClick={onGenerateRecommendation} 
            variant="outline" 
            className="w-full japanese-text"
            disabled={isSubmitting}
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
              onChange={(e) => onRecommendationTextChange(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            form="engineer-form"
            className="japanese-text"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? '登録中...' : '技術者と推薦文を登録'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
