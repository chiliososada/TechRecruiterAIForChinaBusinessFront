
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface ResumeUploadProps {
  onCreateEngineer?: (data: any) => Promise<boolean>;
}

export function ResumeUpload({ onCreateEngineer }: ResumeUploadProps) {
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
    skills: 'Java, Spring Boot, AWS, Docker',
    experience: '7年',
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


  // 生成推薦文
  const generateRecommendation = () => {
    toast.success('推薦文を生成中...', { duration: 2000 });
    
    setTimeout(() => {
      // テンプレートに基づいて推薦文を生成
      const skillsArray = candidateData.skills.split(',').map(s => s.trim());
      const newText = recommendationTemplate
        .replace('[名前]', `${candidateData.name}さん`)
        .replace('[スキル]', skillsArray.slice(0, 2).join('と'))
        .replace('[経験]', '7')
        .replace('[日本語レベル]', candidateData.japaneseLevel)
        .replace('[得意分野]', '金融系のプロジェクト')
        .replace('[ツール]', skillsArray.slice(2).join('や'))
        .replace('[備考]', candidateData.remarks);
        
      setRecommendationText(newText);
      toast.success('推薦文が生成されました');
    }, 2000);
  };

  // 保存候选人数据
  const handleSaveCandidate = async () => {
    if (!onCreateEngineer) {
      toast.error('保存機能が利用できません');
      return;
    }

    // 验证必填字段
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
      // 构造与CandidateForm相同格式的数据
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
        companyName: '', // 添加缺失的字段
        source: 'resume_upload', // 添加缺失的字段
        email: '', // 添加缺失的字段
        phone: '', // 添加缺失的字段
        registeredAt: new Date().toISOString(), // 添加缺失的字段
        updatedAt: new Date().toISOString(), // 添加缺失的字段
        status: '提案中',
        availability: '即日'
      };

      console.log('=== ResumeUpload submitting data ===', formData);
      const success = await onCreateEngineer(formData);
      if (success) {
        toast.success('候補者情報と推薦文が保存されました', {
          description: `${candidateData.name}さんのプロフィールが登録されました`
        });
        
        // 重置表单数据
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
                <Label className="japanese-text">氏名 <span className="text-red-500">*</span></Label>
                <Input 
                  value={candidateData.name} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('name', e.target.value)}
                />
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
              
              <div className="space-y-2">
                <Label className="japanese-text">年齢</Label>
                <Select
                  value={candidateData.age || "placeholder"}
                  onValueChange={(value) => handleFormChange('age', value === 'placeholder' ? '' : value)}
                >
                  <SelectTrigger className="japanese-text">
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
                    <SelectItem value="回答しない" className="japanese-text">回答しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">最寄駅</Label>
                <Input 
                  value={candidateData.nearestStation} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('nearestStation', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">学歴</Label>
                <Select
                  value={candidateData.education || "placeholder"}
                  onValueChange={(value) => handleFormChange('education', value === 'placeholder' ? '' : value)}
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
                <Label className="japanese-text">来日年度</Label>
                <Select
                  value={candidateData.arrivalYear || "placeholder"}
                  onValueChange={(value) => handleFormChange('arrivalYear', value === 'placeholder' ? '' : value)}
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
                <Label className="japanese-text">資格</Label>
                <Input 
                  value={candidateData.certifications} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('certifications', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">日本語レベル <span className="text-red-500">*</span></Label>
                <Select 
                  value={candidateData.japaneseLevel}
                  onValueChange={(value) => handleFormChange('japaneseLevel', value)}
                >
                  <SelectTrigger className="japanese-text">
                    <SelectValue placeholder="日本語レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
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
                    <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                    <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                    <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">保有スキル <span className="text-red-500">*</span></Label>
              <Input 
                value={candidateData.skills} 
                className="japanese-text" 
                onChange={(e) => handleFormChange('skills', e.target.value)}
                placeholder="例: Java, Spring Boot, AWS（カンマ区切り）"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">経験年数 <span className="text-red-500">*</span></Label>
                <Select
                  value={candidateData.experience || "placeholder"}
                  onValueChange={(value) => handleFormChange('experience', value === 'placeholder' ? '' : value)}
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
                      />
                      <Label htmlFor={`workScope-${scope}`} className="japanese-text text-sm">
                        {scope}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">業務経験</Label>
                <Input 
                  value={candidateData.workExperience} 
                  className="japanese-text" 
                  onChange={(e) => handleFormChange('workExperience', e.target.value)}
                />
              </div>
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
