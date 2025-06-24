
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, currentTenant } = useAuth();

  // 自社エンジニアの場合、担当者情報を自動入力
  useEffect(() => {
    console.log('=== CandidateForm useEffect Debug ===', {
      isOwnCompany,
      user: user ? { full_name: user.full_name, email: user.email } : null,
      currentTenant: currentTenant ? { name: currentTenant.name, company_name: currentTenant.company_name } : null
    });
    
    if (isOwnCompany && user && currentTenant) {
      console.log('=== Auto-filling manager fields ===', {
        user: user,
        tenant: currentTenant,
        managerName: user.full_name || user.email || '',
        managerEmail: user.email || '',
        companyName: currentTenant.name || currentTenant.company_name || ''
      });
      const updatedData = {
        ...formData,
        managerName: user.full_name || user.email || '',
        managerEmail: user.email || '',
        companyName: currentTenant.name || currentTenant.company_name || ''
      };
      setFormData(updatedData);
      onDataChange(updatedData);
    }
  }, [isOwnCompany, user, currentTenant]); // formData依存関係を削除して安定化

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

    if (!isOwnCompany && (!formData.managerName || formData.managerName.trim() === '')) {
      missingFields.push('担当者名');
    }

    if (!isOwnCompany && (!formData.managerEmail || formData.managerEmail.trim() === '')) {
      missingFields.push('担当者メール');
    }

    if (missingFields.length > 0) {
      toast.error(`次の必須項目を入力してください: ${missingFields.join('、')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (onCreateEngineer) {
        console.log('=== CandidateForm submitting data ===', formData);
        console.log('=== Manager fields before submit ===', {
          managerName: formData.managerName,
          managerEmail: formData.managerEmail,
          isOwnCompany: isOwnCompany
        });
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
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="japanese-text text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            新規技術者登録
          </CardTitle>
          <CardDescription className="japanese-text text-gray-600 mt-2">
            技術者情報を登録します（<span className="text-red-500 font-semibold">*</span>は必須項目）
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleFormSubmit} className="space-y-8" id="engineer-form">
            {/* 基本情報セクション */}
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 japanese-text mb-1">基本情報</h3>
                <p className="text-sm text-gray-600 japanese-text">技術者の基本的な情報を入力してください</p>
              </div>
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <Label htmlFor="name" className="japanese-text font-medium text-gray-700">
                    氏名 <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="例: 山田太郎"
                    className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    required
                  />
                </div>
              
                {/* 会社名と担当者情報 */}
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="japanese-text font-medium text-gray-700">
                    所属会社 <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input 
                    id="companyName" 
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder={isOwnCompany ? "自動入力されます" : "例: テックイノベーション株式会社"}
                    className={`japanese-text border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${isOwnCompany ? 'bg-gray-100' : ''}`}
                    disabled={isOwnCompany}
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="managerName" className="japanese-text font-medium text-gray-700">
                      担当者名 <span className="text-red-500 font-bold">*</span>
                      {isOwnCompany && <span className="text-sm text-gray-500 ml-2">(自動入力)</span>}
                    </Label>
                    <Input 
                      id="managerName" 
                      value={formData.managerName}
                      onChange={(e) => handleChange('managerName', e.target.value)}
                      placeholder={isOwnCompany ? "自動入力されます" : "例: 田中 太郎"}
                      className={`japanese-text border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${isOwnCompany ? 'bg-gray-100' : ''}`}
                      disabled={isOwnCompany}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="managerEmail" className="japanese-text font-medium text-gray-700">
                      担当者メール <span className="text-red-500 font-bold">*</span>
                      {isOwnCompany && <span className="text-sm text-gray-500 ml-2">(自動入力)</span>}
                    </Label>
                    <Input 
                      id="managerEmail" 
                      type="email"
                      value={formData.managerEmail}
                      onChange={(e) => handleChange('managerEmail', e.target.value)}
                      placeholder={isOwnCompany ? "自動入力されます" : "例: tanaka@company.co.jp"}
                      className={`japanese-text border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors ${isOwnCompany ? 'bg-gray-100' : ''}`}
                      disabled={isOwnCompany}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">国籍</Label>
                  <Select
                    value={formData.nationality || "placeholder"}
                    onValueChange={(value) => handleChange('nationality', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors">
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
              </div>
            </div>
              
            {/* 詳細情報セクション */}
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 japanese-text mb-1">詳細情報</h3>
                <p className="text-sm text-gray-600 japanese-text">年齢、性別、学歴などの詳細情報</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">年齢</Label>
                  <Select
                    value={formData.age || "placeholder"}
                    onValueChange={(value) => handleChange('age', value === 'placeholder' ? '' : value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors">
                      <SelectValue placeholder="年齢を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                      <SelectItem value="20歳" className="japanese-text">20歳</SelectItem>
                      <SelectItem value="21歳" className="japanese-text">21歳</SelectItem>
                      <SelectItem value="22歳" className="japanese-text">22歳</SelectItem>
                      <SelectItem value="23歳" className="japanese-text">23歳</SelectItem>
                      <SelectItem value="24歳" className="japanese-text">24歳</SelectItem>
                      <SelectItem value="25歳" className="japanese-text">25歳</SelectItem>
                      <SelectItem value="26歳" className="japanese-text">26歳</SelectItem>
                      <SelectItem value="27歳" className="japanese-text">27歳</SelectItem>
                      <SelectItem value="28歳" className="japanese-text">28歳</SelectItem>
                      <SelectItem value="29歳" className="japanese-text">29歳</SelectItem>
                      <SelectItem value="30歳" className="japanese-text">30歳</SelectItem>
                      <SelectItem value="31歳" className="japanese-text">31歳</SelectItem>
                      <SelectItem value="32歳" className="japanese-text">32歳</SelectItem>
                      <SelectItem value="33歳" className="japanese-text">33歳</SelectItem>
                      <SelectItem value="34歳" className="japanese-text">34歳</SelectItem>
                      <SelectItem value="35歳" className="japanese-text">35歳</SelectItem>
                      <SelectItem value="36歳" className="japanese-text">36歳</SelectItem>
                      <SelectItem value="37歳" className="japanese-text">37歳</SelectItem>
                      <SelectItem value="38歳" className="japanese-text">38歳</SelectItem>
                      <SelectItem value="39歳" className="japanese-text">39歳</SelectItem>
                      <SelectItem value="40歳" className="japanese-text">40歳</SelectItem>
                      <SelectItem value="41歳" className="japanese-text">41歳</SelectItem>
                      <SelectItem value="42歳" className="japanese-text">42歳</SelectItem>
                      <SelectItem value="43歳" className="japanese-text">43歳</SelectItem>
                      <SelectItem value="44歳" className="japanese-text">44歳</SelectItem>
                      <SelectItem value="45歳" className="japanese-text">45歳</SelectItem>
                      <SelectItem value="46歳" className="japanese-text">46歳</SelectItem>
                      <SelectItem value="47歳" className="japanese-text">47歳</SelectItem>
                      <SelectItem value="48歳" className="japanese-text">48歳</SelectItem>
                      <SelectItem value="49歳" className="japanese-text">49歳</SelectItem>
                      <SelectItem value="50歳" className="japanese-text">50歳</SelectItem>
                      <SelectItem value="51歳" className="japanese-text">51歳</SelectItem>
                      <SelectItem value="52歳" className="japanese-text">52歳</SelectItem>
                      <SelectItem value="53歳" className="japanese-text">53歳</SelectItem>
                      <SelectItem value="54歳" className="japanese-text">54歳</SelectItem>
                      <SelectItem value="55歳" className="japanese-text">55歳</SelectItem>
                      <SelectItem value="56歳" className="japanese-text">56歳</SelectItem>
                      <SelectItem value="57歳" className="japanese-text">57歳</SelectItem>
                      <SelectItem value="58歳" className="japanese-text">58歳</SelectItem>
                      <SelectItem value="59歳" className="japanese-text">59歳</SelectItem>
                      <SelectItem value="60歳" className="japanese-text">60歳</SelectItem>
                      <SelectItem value="60歳以上" className="japanese-text">60歳以上</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Select
                  value={formData.education || "placeholder"}
                  onValueChange={(value) => handleChange('education', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
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
              
              <div className="space-y-2">
                <Label htmlFor="arrivalYear" className="japanese-text">来日年度</Label>
                <Select
                  value={formData.arrivalYear || "placeholder"}
                  onValueChange={(value) => handleChange('arrivalYear', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="来日年度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="2024年" className="japanese-text">2024年</SelectItem>
                    <SelectItem value="2023年" className="japanese-text">2023年</SelectItem>
                    <SelectItem value="2022年" className="japanese-text">2022年</SelectItem>
                    <SelectItem value="2021年" className="japanese-text">2021年</SelectItem>
                    <SelectItem value="2020年" className="japanese-text">2020年</SelectItem>
                    <SelectItem value="2019年" className="japanese-text">2019年</SelectItem>
                    <SelectItem value="2018年" className="japanese-text">2018年</SelectItem>
                    <SelectItem value="2017年" className="japanese-text">2017年</SelectItem>
                    <SelectItem value="2016年" className="japanese-text">2016年</SelectItem>
                    <SelectItem value="2015年" className="japanese-text">2015年</SelectItem>
                    <SelectItem value="2014年" className="japanese-text">2014年</SelectItem>
                    <SelectItem value="2013年" className="japanese-text">2013年</SelectItem>
                    <SelectItem value="2012年" className="japanese-text">2012年</SelectItem>
                    <SelectItem value="2011年" className="japanese-text">2011年</SelectItem>
                    <SelectItem value="2010年" className="japanese-text">2010年</SelectItem>
                    <SelectItem value="2009年" className="japanese-text">2009年</SelectItem>
                    <SelectItem value="2008年" className="japanese-text">2008年</SelectItem>
                    <SelectItem value="2007年" className="japanese-text">2007年</SelectItem>
                    <SelectItem value="2006年" className="japanese-text">2006年</SelectItem>
                    <SelectItem value="2005年" className="japanese-text">2005年</SelectItem>
                    <SelectItem value="2004年" className="japanese-text">2004年</SelectItem>
                    <SelectItem value="2003年" className="japanese-text">2003年</SelectItem>
                    <SelectItem value="2002年" className="japanese-text">2002年</SelectItem>
                    <SelectItem value="2001年" className="japanese-text">2001年</SelectItem>
                    <SelectItem value="2000年" className="japanese-text">2000年</SelectItem>
                    <SelectItem value="2000年以前" className="japanese-text">2000年以前</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience" className="japanese-text">経験年数 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.experience || "placeholder"}
                  onValueChange={(value) => handleChange('experience', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="経験年数を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" className="japanese-text">選択してください</SelectItem>
                    <SelectItem value="未経験" className="japanese-text">未経験</SelectItem>
                    <SelectItem value="1年未満" className="japanese-text">1年未満</SelectItem>
                    <SelectItem value="1年" className="japanese-text">1年</SelectItem>
                    <SelectItem value="2年" className="japanese-text">2年</SelectItem>
                    <SelectItem value="3年" className="japanese-text">3年</SelectItem>
                    <SelectItem value="4年" className="japanese-text">4年</SelectItem>
                    <SelectItem value="5年" className="japanese-text">5年</SelectItem>
                    <SelectItem value="6年" className="japanese-text">6年</SelectItem>
                    <SelectItem value="7年" className="japanese-text">7年</SelectItem>
                    <SelectItem value="8年" className="japanese-text">8年</SelectItem>
                    <SelectItem value="9年" className="japanese-text">9年</SelectItem>
                    <SelectItem value="10年" className="japanese-text">10年</SelectItem>
                    <SelectItem value="11年" className="japanese-text">11年</SelectItem>
                    <SelectItem value="12年" className="japanese-text">12年</SelectItem>
                    <SelectItem value="13年" className="japanese-text">13年</SelectItem>
                    <SelectItem value="14年" className="japanese-text">14年</SelectItem>
                    <SelectItem value="15年" className="japanese-text">15年</SelectItem>
                    <SelectItem value="16年" className="japanese-text">16年</SelectItem>
                    <SelectItem value="17年" className="japanese-text">17年</SelectItem>
                    <SelectItem value="18年" className="japanese-text">18年</SelectItem>
                    <SelectItem value="19年" className="japanese-text">19年</SelectItem>
                    <SelectItem value="20年" className="japanese-text">20年</SelectItem>
                    <SelectItem value="20年以上" className="japanese-text">20年以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">業務範囲</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '調査・分析',
                    '要件定義',
                    '基本設計',
                    '詳細設計',
                    '製造',
                    '単体テスト',
                    '結合テスト',
                    '総合テスト',
                    '運用試験',
                    '運用・保守'
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
                      />
                      <Label htmlFor={`workScope-${scope}`} className="japanese-text text-sm">
                        {scope}
                      </Label>
                    </div>
                  ))}
                </div>
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
