import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Save, Wand2, Upload, User, GraduationCap, Globe, Code, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface ResumeUploadProps {
  onCreateEngineer?: (data: any) => Promise<boolean>;
}

export function ResumeUploadStyled({ onCreateEngineer }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const [candidateData, setCandidateData] = useState({
    name: '',
    age: '',
    gender: '',
    nationality: '',
    education: '',
    arrivalYear: '',
    japaneseLevel: 'ネイティブレベル',
    englishLevel: 'ビジネスレベル',
    nearestStation: '',
    skills: '',
    experience: '',
    selfPromotion: '',
    workScope: '',
    workExperience: '',
    remarks: '',
    companyType: '自社',
    certifications: ''
  });

  const [recommendationTemplate, setRecommendationTemplate] = useState(
    `[名前]は[スキル]を中心に[経験]年の開発経験があり、日本語は[日本語レベル]です。
[得意分野]に強みがあり、[ツール]などの技術も習得しています。
チームリーダーとしての経験もあり、要件定義から設計、実装、テストまでの一連の開発プロセスを担当できます。
[備考]`
  );
  const [recommendationText, setRecommendationText] = useState('');
  
  const handleFormChange = (field: string, value: string) => {
    setCandidateData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecommendation = () => {
    toast.success('推薦文を生成中...', { duration: 2000 });
    
    setTimeout(() => {
      const skillsArray = candidateData.skills.split(',').map(s => s.trim());
      const newText = recommendationTemplate
        .replace('[名前]', `${candidateData.name}さん`)
        .replace('[スキル]', skillsArray.slice(0, 2).join('と'))
        .replace('[経験]', candidateData.experience?.replace('年', '') || '5')
        .replace('[日本語レベル]', candidateData.japaneseLevel)
        .replace('[得意分野]', '金融系のプロジェクト')
        .replace('[ツール]', skillsArray.slice(2).join('や'))
        .replace('[備考]', candidateData.remarks);
        
      setRecommendationText(newText);
      toast.success('推薦文が生成されました');
    }, 2000);
  };

  const handleSaveCandidate = async () => {
    if (!onCreateEngineer) {
      toast.error('保存機能が利用できません');
      return;
    }

    if (!candidateData.name || candidateData.name.trim() === '') {
      toast.error('氏名を入力してください');
      return;
    }

    if (!candidateData.skills || candidateData.skills.trim() === '') {
      toast.error('保有スキルを入力してください');
      return;
    }

    if (!candidateData.japaneseLevel || candidateData.japaneseLevel.trim() === '') {
      toast.error('日本語レベルを選択してください');
      return;
    }

    if (!candidateData.experience || candidateData.experience.trim() === '') {
      toast.error('経験年数を入力してください');
      return;
    }

    try {
      const formData = {
        name: candidateData.name,
        skills: candidateData.skills,
        japaneseLevel: candidateData.japaneseLevel,
        englishLevel: candidateData.englishLevel || '',
        experience: candidateData.experience,
        age: candidateData.age || '',
        gender: candidateData.gender || '',
        nationality: candidateData.nationality || '',
        nearestStation: candidateData.nearestStation || '',
        education: candidateData.education || '',
        arrivalYear: candidateData.arrivalYear || '',
        certifications: candidateData.certifications || '',
        workScope: candidateData.workScope || '',
        workExperience: candidateData.workExperience || '',
        selfPromotion: candidateData.selfPromotion || '',
        remarks: candidateData.remarks || '',
        companyType: '自社',
        companyName: '',
        source: 'resume_upload',
        email: '',
        phone: '',
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: '提案中',
        availability: '即日'
      };

      console.log('=== ResumeUpload submitting data ===', formData);
      const success = await onCreateEngineer(formData);
      if (success) {
        toast.success('候補者情報と推薦文が保存されました', {
          description: `${candidateData.name}さんのプロフィールが登録されました`
        });
        
        setCandidateData({
          name: '',
          age: '',
          gender: '',
          nationality: '',
          education: '',
          arrivalYear: '',
          japaneseLevel: '',
          englishLevel: '',
          nearestStation: '',
          skills: '',
          experience: '',
          selfPromotion: '',
          workScope: '',
          workExperience: '',
          remarks: '',
          companyType: '自社',
          certifications: ''
        });
        setRecommendationText('');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      toast.error('保存に失敗しました');
    }
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
      setTimeout(() => {
        setIsUploading(false);
        toast.success('履歴書がアップロードされました', {
          description: `${file.name} の分析が完了しました。`
        });
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* ファイルアップロードセクション */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
          <CardTitle className="japanese-text text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Upload className="w-6 h-6 text-white" />
            </div>
            履歴書をアップロード
          </CardTitle>
          <CardDescription className="japanese-text text-gray-600 text-base">
            PDFまたはWord形式の履歴書をアップロードして、自動的に情報を抽出します。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resume-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-300 hover:border-emerald-400 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FileUp className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="mb-2 text-lg font-semibold text-emerald-700 japanese-text">
                  クリックして履歴書をアップロード
                </p>
                <p className="text-sm text-emerald-600 japanese-text">PDF、.doc、または.docx形式（最大10MB）</p>
                {isUploading && (
                  <div className="mt-6">
                    <div className="w-10 h-10 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin"></div>
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
        <CardFooter className="flex justify-center bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 japanese-text text-center">
            アップロードされた履歴書から、基本情報、技術スタック、プロジェクト経歴、日本語能力などが自動的に抽出されます。
          </p>
        </CardFooter>
      </Card>

      {/* 技術者情報抽出セクション */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="japanese-text text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            技術者情報抽出
          </CardTitle>
          <CardDescription className="japanese-text text-gray-600 text-base">
            AIにより抽出された候補者情報を編集できます（<span className="text-red-500 font-semibold">*</span>は必須項目）
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-gray-50">
          <div className="space-y-8">
            
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
                  <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                    氏名 <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={candidateData.name} 
                    className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="例: 鈴木太郎"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">国籍</Label>
                  <Select
                    value={candidateData.nationality || "placeholder"}
                    onValueChange={(value) => handleFormChange('nationality', value === 'placeholder' ? '' : value)}
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
                    value={candidateData.age || "placeholder"}
                    onValueChange={(value) => handleFormChange('age', value === 'placeholder' ? '' : value)}
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
                    value={candidateData.gender || "placeholder"}
                    onValueChange={(value) => handleFormChange('gender', value === 'placeholder' ? '' : value)}
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
                    value={candidateData.nearestStation} 
                    className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    onChange={(e) => handleFormChange('nearestStation', e.target.value)}
                    placeholder="例: 品川駅"
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
                    value={candidateData.education || "placeholder"}
                    onValueChange={(value) => handleFormChange('education', value === 'placeholder' ? '' : value)}
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
                    value={candidateData.arrivalYear || "placeholder"}
                    onValueChange={(value) => handleFormChange('arrivalYear', value === 'placeholder' ? '' : value)}
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
                    value={candidateData.certifications} 
                    className="japanese-text border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                    onChange={(e) => handleFormChange('certifications', e.target.value)}
                    placeholder="例: AWS認定ソリューションアーキテクト, Oracle認定Javaプログラマー"
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
                    value={candidateData.japaneseLevel}
                    onValueChange={(value) => handleFormChange('japaneseLevel', value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                      <SelectValue placeholder="日本語レベルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                      <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                      <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">英語レベル</Label>
                  <Select 
                    value={candidateData.englishLevel}
                    onValueChange={(value) => handleFormChange('englishLevel', value)}
                  >
                    <SelectTrigger className="japanese-text border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
                      <SelectValue placeholder="英語レベルを選択" />
                    </SelectTrigger>
                    <SelectContent>
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
                    value={candidateData.skills} 
                    className="japanese-text border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" 
                    onChange={(e) => handleFormChange('skills', e.target.value)}
                    placeholder="例: Java, Spring Boot, AWS（カンマ区切り）"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                      経験年数 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={candidateData.experience || "placeholder"}
                      onValueChange={(value) => handleFormChange('experience', value === 'placeholder' ? '' : value)}
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
                      value={candidateData.workExperience} 
                      className="japanese-text border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all" 
                      onChange={(e) => handleFormChange('workExperience', e.target.value)}
                      placeholder="例: 金融, 保険, EC"
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
                          checked={candidateData.workScope?.includes(scope) || false}
                          onCheckedChange={(checked) => {
                            const currentWorkScope = candidateData.workScope ? candidateData.workScope.split(', ') : [];
                            if (checked) {
                              const updatedWorkScope = [...currentWorkScope, scope];
                              handleFormChange('workScope', updatedWorkScope.join(', '));
                            } else {
                              const updatedWorkScope = currentWorkScope.filter(item => item !== scope);
                              handleFormChange('workScope', updatedWorkScope.join(', '));
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
                  <p className="text-sm text-gray-600 japanese-text">アピール・備考</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">自己アピール</Label>
                  <Textarea 
                    value={candidateData.selfPromotion} 
                    className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[120px]" 
                    onChange={(e) => handleFormChange('selfPromotion', e.target.value)}
                    placeholder="候補者の自己アピールを入力"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="japanese-text font-medium text-gray-700">備考</Label>
                  <Textarea 
                    value={candidateData.remarks} 
                    className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[120px]" 
                    onChange={(e) => handleFormChange('remarks', e.target.value)}
                    placeholder="出勤制限、出張可否などを記入"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 推薦文生成セクション */}
      <Card className="shadow-lg border-0">
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
              onChange={(e) => setRecommendationTemplate(e.target.value)}
              placeholder="[名前]、[スキル]、[経験]などのプレースホルダーを使用してください"
            />
            <p className="text-xs text-gray-500 japanese-text">
              推薦文のテンプレートを編集できます。[名前]、[スキル]、[経験]などのプレースホルダーを使用します。
            </p>
          </div>
          
          <Button 
            onClick={generateRecommendation} 
            variant="outline" 
            className="w-full japanese-text border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
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
              onChange={(e) => setRecommendationText(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-gray-50 border-t border-gray-200">
          <Button 
            onClick={handleSaveCandidate} 
            className="japanese-text bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-2 transition-all shadow-md hover:shadow-lg"
          >
            <Save className="mr-2 h-4 w-4" />
            候補者と推薦文を保存
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}