import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wand2, User, GraduationCap, Globe, Code, Briefcase } from 'lucide-react';
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

export const CandidateFormStyled: React.FC<CandidateFormProps> = ({
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
        console.log('=== CandidateForm submitting data ===', formData);
        const success = await onCreateEngineer(formData);
        if (success) {
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
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
          <CardTitle className="japanese-text text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            新規技術者登録
          </CardTitle>
          <CardDescription className="japanese-text text-gray-600 mt-2 text-base">
            技術者情報を登録します（<span className="text-red-500 font-semibold">*</span>は必須項目）
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 bg-gray-50">
          <form onSubmit={handleFormSubmit} className="space-y-8" id="engineer-form">
            
            {/* 基本情報セクション */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 japanese-text">基本情報</h3>
                  <p className="text-sm text-gray-600 japanese-text">技術者の基本的な情報</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                    氏名 <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="例: 山田太郎"
                    className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    required
                  />
                </div>
                
                {!isOwnCompany && (
                  <div className="space-y-3">
                    <Label htmlFor="companyName" className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                      所属会社 <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="companyName" 
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="例: テックイノベーション株式会社"
                      className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">国籍</Label>
                  <Select
                    value={formData.nationality || "placeholder"}
                    onValueChange={(value) => handleChange('nationality', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
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
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">年齢</Label>
                  <Select
                    value={formData.age || "placeholder"}
                    onValueChange={(value) => handleChange('age', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                      <SelectValue placeholder="年齢を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      {Array.from({length: 41}, (_, i) => (
                        <SelectItem key={i} value={`${20 + i}歳`} className="japanese-text">{20 + i}歳</SelectItem>
                      ))}
                      <SelectItem value="60歳以上" className="japanese-text">60歳以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">性別</Label>
                  <Select
                    value={formData.gender || "placeholder"}
                    onValueChange={(value) => handleChange('gender', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
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
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">最寄駅</Label>
                  <Input 
                    value={formData.nearestStation}
                    onChange={(e) => handleChange('nearestStation', e.target.value)}
                    placeholder="例: 東京駅"
                    className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 学歴・来日情報セクション */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 japanese-text">学歴・来日情報</h3>
                  <p className="text-sm text-gray-600 japanese-text">教育背景と来日に関する情報</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">学歴</Label>
                  <Select
                    value={formData.education || "placeholder"}
                    onValueChange={(value) => handleChange('education', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all">
                      <SelectValue placeholder="学歴を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      <SelectItem value="高卒以下" className="japanese-text">高卒以下</SelectItem>
                      <SelectItem value="専門学校" className="japanese-text">専門学校</SelectItem>
                      <SelectItem value="大学（学士）" className="japanese-text">大学（学士）</SelectItem>
                      <SelectItem value="修士" className="japanese-text">修士</SelectItem>
                      <SelectItem value="博士" className="japanese-text">博士</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">来日年度</Label>
                  <Select
                    value={formData.arrivalYear || "placeholder"}
                    onValueChange={(value) => handleChange('arrivalYear', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all">
                      <SelectValue placeholder="来日年度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      {Array.from({length: 25}, (_, i) => (
                        <SelectItem key={i} value={`${2024 - i}年`} className="japanese-text">{2024 - i}年</SelectItem>
                      ))}
                      <SelectItem value="2000年以前" className="japanese-text">2000年以前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <Label className="japanese-text font-medium text-gray-700">資格</Label>
                  <Input 
                    value={formData.certifications}
                    onChange={(e) => handleChange('certifications', e.target.value)}
                    placeholder="例: AWS認定ソリューションアーキテクト, Oracle認定Javaプログラマー"
                    className="japanese-text border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 言語能力セクション */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 japanese-text">言語能力</h3>
                  <p className="text-sm text-gray-600 japanese-text">日本語・英語のレベル</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                    日本語レベル <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.japaneseLevel || "placeholder"}
                    onValueChange={(value) => handleChange('japaneseLevel', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                      <SelectValue placeholder="日本語レベルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                      <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                      <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">英語レベル</Label>
                  <Select
                    value={formData.englishLevel || "placeholder"}
                    onValueChange={(value) => handleChange('englishLevel', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                      <SelectValue placeholder="英語レベルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                      <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                      <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 技術情報セクション */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 japanese-text">技術情報</h3>
                  <p className="text-sm text-gray-600 japanese-text">スキル・経験・業務範囲</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                    保有スキル <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={formData.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    placeholder="例: Java, Spring Boot, AWS（カンマ区切り）"
                    className="japanese-text border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                      経験年数 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.experience || "placeholder"}
                      onValueChange={(value) => handleChange('experience', value === 'placeholder' ? '' : value)}
                    >
                      <SelectTrigger className="japanese-text border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all">
                        <SelectValue placeholder="経験年数を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                        <SelectItem value="未経験" className="japanese-text">未経験</SelectItem>
                        <SelectItem value="1年未満" className="japanese-text">1年未満</SelectItem>
                        {Array.from({length: 20}, (_, i) => (
                          <SelectItem key={i} value={`${i + 1}年`} className="japanese-text">{i + 1}年</SelectItem>
                        ))}
                        <SelectItem value="20年以上" className="japanese-text">20年以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="japanese-text font-medium text-gray-700">業務経験</Label>
                    <Input 
                      value={formData.workExperience}
                      onChange={(e) => handleChange('workExperience', e.target.value)}
                      placeholder="例: 金融, 保険, EC"
                      className="japanese-text border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">業務範囲</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {[
                      '調査・分析', '要件定義', '基本設計', '詳細設計', '製造',
                      '単体テスト', '結合テスト', '総合テスト', '運用試験', '運用・保守'
                    ].map((scope) => (
                      <div key={scope} className="flex items-center space-x-2">
                        <Checkbox
                          id={`workScope-${scope}`}
                          checked={formData.workScope?.includes(scope) || false}
                          onCheckedChange={(checked) => {
                            const currentWorkScope = formData.workScope ? formData.workScope.split(', ') : [];
                            if (checked) {
                              const updatedWorkScope = [...currentWorkScope, scope];
                              handleChange('workScope', updatedWorkScope.join(', '));
                            } else {
                              const updatedWorkScope = currentWorkScope.filter(item => item !== scope);
                              handleChange('workScope', updatedWorkScope.join(', '));
                            }
                          }}
                          className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <Label htmlFor={`workScope-${scope}`} className="japanese-text text-sm">
                          {scope}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* その他の情報セクション */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 japanese-text">その他の情報</h3>
                  <p className="text-sm text-gray-600 japanese-text">稼働状況・ステータス・備考</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">稼働可能時期</Label>
                  <Input 
                    value={formData.availability}
                    onChange={(e) => handleChange('availability', e.target.value)}
                    placeholder="例: 即日、1ヶ月後、応相談"
                    className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">ステータス</Label>
                  <Select
                    value={formData.status || "placeholder"}
                    onValueChange={(value) => handleChange('status', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
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
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">自己アピール</Label>
                  <Textarea 
                    value={formData.selfPromotion}
                    onChange={(e) => handleChange('selfPromotion', e.target.value)}
                    placeholder="候補者の自己アピールを入力"
                    className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[120px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">備考</Label>
                  <Textarea 
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    placeholder="出勤制限、出張可否などを記入"
                    className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* 推薦文生成セクション */}
      <Card className="shadow-lg border-0 mt-6">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <CardTitle className="japanese-text text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            推薦文生成
          </CardTitle>
          <CardDescription className="japanese-text text-gray-600">
            候補者の自動生成された推薦文
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="recommendation-template" className="japanese-text font-medium text-gray-700">テンプレート</Label>
            <Textarea 
              id="recommendation-template" 
              className="min-h-[150px] japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              value={recommendationTemplate}
              onChange={(e) => onRecommendationTemplateChange(e.target.value)}
              placeholder="[名前]、[スキル]、[経験]などのプレースホルダーを使用してください"
            />
            <p className="text-xs text-gray-500 japanese-text">
              推薦文のテンプレートを編集できます。[名前]、[スキル]、[経験]などのプレースホルダーを使用します。
            </p>
          </div>
          
          <Button 
            onClick={onGenerateRecommendation} 
            variant="outline" 
            className="w-full japanese-text border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
            disabled={isSubmitting}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            AIで推薦文を生成
          </Button>
          
          <div className="space-y-3">
            <Label htmlFor="generated-recommendation" className="japanese-text font-medium text-gray-700">生成された推薦文</Label>
            <Textarea 
              id="generated-recommendation"
              className="min-h-[150px] japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
              value={recommendationText}
              onChange={(e) => onRecommendationTextChange(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-gray-50 border-t border-gray-200">
          <Button 
            type="submit" 
            form="engineer-form"
            className="japanese-text bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2 transition-all shadow-md hover:shadow-lg"
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