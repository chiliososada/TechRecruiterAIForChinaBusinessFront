import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Save, Wand2, Upload, User, GraduationCap, Globe, Code, Briefcase, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeUploadProps {
  onCreateEngineer?: (data: any) => Promise<boolean>;
  isOwnCompany?: boolean;
}

export function ResumeUploadStyled({ onCreateEngineer, isOwnCompany = true }: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showParsedDataPreview, setShowParsedDataPreview] = useState(false);
  const { currentTenant, token } = useAuth();

  // JSON数据转换函数 - 将API返回的数据转换为表单数据
  const transformParsedDataToForm = (apiData: any) => {
    const data = apiData?.data || apiData; // 处理嵌套的data字段
    
    // 安全的字符串转换函数 - 处理null、undefined、空值
    const safeString = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      return String(value);
    };
    
    // 年龄转换函数 - 将数字转换为"数字歳"格式
    const safeAge = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      const ageStr = String(value);
      // 如果已经包含"歳"，直接返回
      if (ageStr.includes('歳')) {
        return ageStr;
      }
      // 如果是纯数字，添加"歳"
      if (/^\d+$/.test(ageStr)) {
        return ageStr + '歳';
      }
      return ageStr;
    };
    
    // 经验年数转换函数 - 处理"8年11ヶ月"或"8年"格式
    const safeExperience = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      const expStr = String(value).trim();
      
      // 如果已经是表单中的标准格式，直接返回
      const standardFormats = [
        '未経験', '1年未満', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年',
        '11年', '12年', '13年', '14年', '15年', '16年', '17年', '18年', '19年', '20年', '20年以上'
      ];
      if (standardFormats.includes(expStr)) {
        return expStr;
      }
      
      // 解析"X年Y ヶ月"格式
      const yearMonthMatch = expStr.match(/(\d+)年(\d+)ヶ月/);
      if (yearMonthMatch) {
        const years = parseInt(yearMonthMatch[1]);
        const months = parseInt(yearMonthMatch[2]);
        
        // 如果月数>=6，向上取整到下一年
        if (months >= 6) {
          const totalYears = years + 1;
          if (totalYears >= 20) {
            return '20年以上';
          }
          return totalYears + '年';
        } else {
          // 月数<6，使用当前年数
          if (years >= 20) {
            return '20年以上';
          }
          if (years === 0) {
            return '1年未満';
          }
          return years + '年';
        }
      }
      
      // 解析"X年"格式
      const yearMatch = expStr.match(/(\d+)年/);
      if (yearMatch) {
        const years = parseInt(yearMatch[1]);
        if (years >= 20) {
          return '20年以上';
        }
        if (years === 0) {
          return '1年未満';
        }
        return years + '年';
      }
      
      // 如果是纯数字，当作年数处理
      if (/^\d+$/.test(expStr)) {
        const years = parseInt(expStr);
        if (years >= 20) {
          return '20年以上';
        }
        if (years === 0) {
          return '未経験';
        }
        return years + '年';
      }
      
      // 其他情况返回原值
      return expStr;
    };
    
    // 日语等级转换函数 - 转换为表单中的标准格式
    const safeJapaneseLevel = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }
      const levelStr = String(value).trim();
      
      // 如果已经是表单中的标准格式，直接返回
      const standardFormats = ['日常会話レベル', 'ビジネスレベル', 'ネイティブレベル'];
      if (standardFormats.includes(levelStr)) {
        return levelStr;
      }
      
      // 转换为小写进行匹配（避免大小写问题）
      const lowerStr = levelStr.toLowerCase();
      
      // 匹配ネイティブレベル
      if (lowerStr.includes('ネイティブ') || lowerStr.includes('native') || 
          lowerStr.includes('日本籍') || lowerStr.includes('日本国籍') ||
          lowerStr.includes('母語') || lowerStr.includes('母国語')) {
        return 'ネイティブレベル';
      }
      
      // 匹配ビジネスレベル
      if (lowerStr.includes('n1') || lowerStr.includes('ビジネス') || 
          lowerStr.includes('business') || lowerStr.includes('上級')) {
        return 'ビジネスレベル';
      }
      
      // 其他情况（包含N2或其他）都匹配日常会話レベル
      return '日常会話レベル';
    };
    
    // 安全的数组转换函数 - 处理null、undefined、非数组值
    const safeArrayToString = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      if (Array.isArray(value)) {
        return value.filter(item => item !== null && item !== undefined && item !== '').join(', ');
      }
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
      return '';
    };
    
    return {
      name: safeString(data?.name),
      age: safeAge(data?.age),
      gender: safeString(data?.gender),
      nationality: safeString(data?.nationality),
      education: safeString(data?.education),
      arrivalYear: safeString(data?.arrival_year_japan),
      japaneseLevel: safeJapaneseLevel(data?.japanese_level),
      englishLevel: safeString(data?.english_level),
      nearestStation: safeString(data?.nearest_station),
      skills: safeArrayToString(data?.skills),
      experience: safeExperience(data?.experience),
      selfPromotion: safeString(data?.self_promotion),
      workScope: safeArrayToString(data?.work_scope),
      workExperience: safeString(data?.work_experience),
      remarks: safeString(data?.remarks),
      companyType: safeString(data?.company_type) || (isOwnCompany ? '自社' : '他社'),
      certifications: safeArrayToString(data?.certifications),
      // 稼働状況・ステータス
      availability: safeString(data?.availability),
      status: safeString(data?.status),
      // 他社の場合の必須フィールド
      companyName: safeString(data?.company_name),
      managerName: safeString(data?.manager_name),
      managerEmail: safeString(data?.manager_email)
    };
  };
  
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
    companyType: isOwnCompany ? '自社' : '他社',
    certifications: '',
    // 稼働状況・ステータス
    availability: '',
    status: '',
    // 他社の場合の必須フィールド
    companyName: '',
    managerName: '',
    managerEmail: ''
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

    // 他社の場合の必須フィールド検証
    if (!isOwnCompany) {
      if (!candidateData.companyName || candidateData.companyName.trim() === '') {
        toast.error('所属会社を入力してください');
        return;
      }
      
      if (!candidateData.managerName || candidateData.managerName.trim() === '') {
        toast.error('担当者名を入力してください');
        return;
      }
      
      if (!candidateData.managerEmail || candidateData.managerEmail.trim() === '') {
        toast.error('担当者メールを入力してください');
        return;
      }
      
      // メールアドレスの形式検証
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(candidateData.managerEmail)) {
        toast.error('正しいメールアドレス形式を入力してください');
        return;
      }
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
        companyType: isOwnCompany ? '自社' : '他社',
        companyName: isOwnCompany ? '' : candidateData.companyName,
        managerName: isOwnCompany ? '' : candidateData.managerName,
        managerEmail: isOwnCompany ? '' : candidateData.managerEmail,
        availability: candidateData.availability || '',
        status: candidateData.status || '',
        source: 'resume_upload',
        email: '',
        phone: '',
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
          companyType: isOwnCompany ? '自社' : '他社',
          certifications: '',
          // 稼働状況・ステータス
          availability: '',
          status: '',
          // 他社の場合の必須フィールド
          companyName: '',
          managerName: '',
          managerEmail: ''
        });
        setRecommendationText('');
      }
    } catch (error) {
      console.error('保存エラー:', error);
      toast.error('保存に失敗しました');
    }
  };

  // ファイル検証API呼び出し
  const validateResumeFile = async (file: File): Promise<boolean> => {
    if (!token || !currentTenant?.id) {
      console.error('認証情報不足 - token:', !!token, 'currentTenant.id:', !!currentTenant?.id);
      throw new Error('認証情報が見つかりません');
    }

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
    const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || '';
    
    console.log('=== 検証API呼び出し詳細 ===');
    console.log('URL:', `${BACKEND_API_URL}/api/v1/resume-parser/validate`);
    console.log('API Key設定:', !!BACKEND_API_KEY);
    console.log('Token設定:', !!token);
    console.log('Tenant ID:', currentTenant.id);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', currentTenant.id);
    formData.append('strict_validation', 'true');

    const response = await fetch(`${BACKEND_API_URL}/api/v1/resume-parser/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': BACKEND_API_KEY,
        'X-Tenant-ID': currentTenant.id
      },
      body: formData
    });

    console.log('API応答ステータス:', response.status);
    console.log('API応答OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ファイル検証に失敗しました');
    }

    const result = await response.json();
    return result.valid === true;
  };

  // ファイル解析API呼び出し
  const parseResumeFile = async (file: File): Promise<any> => {
    if (!token || !currentTenant?.id) {
      throw new Error('認証情報が見つかりません');
    }

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
    const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || '';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant_id', currentTenant.id);

    const response = await fetch(`${BACKEND_API_URL}/api/v1/resume-parser/parse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': BACKEND_API_KEY,
        'X-Tenant-ID': currentTenant.id
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ファイル解析に失敗しました');
    }

    return await response.json();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('=== ファイルアップロード開始 ===');
    console.log('ファイル名:', file.name);
    console.log('ファイルタイプ:', file.type);
    console.log('ファイルサイズ:', file.size);

    // Excel形式のファイルかチェック
    const isExcelFile = file.type === 'application/vnd.ms-excel' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.name.endsWith('.xls') || 
                       file.name.endsWith('.xlsx');

    console.log('Excelファイル判定:', isExcelFile);

    if (!isExcelFile) {
      setUploadedFile(null);
      toast.error('サポートされていないファイル形式です', {
        description: 'Excel (.xls, .xlsx) ファイルのみアップロード可能です。'
      });
      return;
    }

    console.log('認証情報チェック - token:', !!token, 'currentTenant:', !!currentTenant);

    try {
      setUploadedFile(file);
      
      // ステップ1: ファイル検証
      console.log('=== ファイル検証API呼び出し開始 ===');
      setIsValidating(true);
      toast.info('ファイルを検証中...', { duration: 2000 });
      
      const isValid = await validateResumeFile(file);
      console.log('検証結果:', isValid);
      setIsValidating(false);
      
      if (!isValid) {
        toast.error('ファイル検証に失敗しました', {
          description: 'アップロードされたファイルは有効な履歴書形式ではありません。'
        });
        setUploadedFile(null);
        return;
      }
      
      toast.success('ファイル検証が完了しました');
      
      // ステップ2: ファイル解析
      setIsParsing(true);
      toast.info('履歴書を解析中...', { duration: 3000 });
      
      const apiResponse = await parseResumeFile(file);
      setIsParsing(false);
      
      console.log('解析API応答:', apiResponse);
      
      // 解析結果を保存し、プレビューを表示
      if (apiResponse && apiResponse.success && apiResponse.data) {
        setParsedData(apiResponse);
        setShowParsedDataPreview(true);
        
        // データを変換して表单に自动填充
        const formData = transformParsedDataToForm(apiResponse);
        setCandidateData(formData);
        
        console.log('変換後のフォームデータ:', formData);
        
        toast.success('履歴書の解析が完了しました', {
          description: `${file.name} から情報を抽出しました。内容を確認して保存してください。`
        });
      } else {
        toast.error('解析結果の処理に失敗しました', {
          description: 'APIから有効なデータが返されませんでした。'
        });
      }
      
    } catch (error) {
      console.error('ファイル処理エラー:', error);
      setIsValidating(false);
      setIsParsing(false);
      setUploadedFile(null);
      
      toast.error('ファイル処理に失敗しました', {
        description: error instanceof Error ? error.message : '不明なエラーが発生しました'
      });
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
            Excel形式の履歴書のみアップロード可能です。自動的に情報を抽出します。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resume-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                uploadedFile 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:border-green-400' 
                  : 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-300 hover:border-emerald-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadedFile ? (
                  // 上传成功后的显示
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <p className="text-lg font-semibold text-green-700 japanese-text">
                        アップロード完了
                      </p>
                    </div>
                    <p className="text-sm text-green-600 japanese-text font-medium mb-1">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-green-500 japanese-text">
                      ファイルサイズ: {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-green-500 japanese-text mt-2">
                      クリックして別のファイルをアップロード
                    </p>
                  </>
                ) : (
                  // 初期状態の表示
                  <>
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <FileUp className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-emerald-700 japanese-text">
                      クリックして履歴書をアップロード
                    </p>
                    <p className="text-sm text-emerald-600 japanese-text">Excel (.xls, .xlsx) 形式のみ対応（最大10MB）</p>
                  </>
                )}
                
                {(isUploading || isValidating || isParsing) && (
                  <div className="mt-6 text-center">
                    <div className="w-10 h-10 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-emerald-600">
                      {isValidating && 'ファイル検証中...'}
                      {isParsing && '履歴書解析中...'}
                      {isUploading && 'アップロード中...'}
                    </p>
                  </div>
                )}
              </div>
              <Input
                id="resume-file"
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading || isValidating || isParsing}
              />
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 japanese-text text-center">
            アップロードされた履歴書から、基本情報、技術SKILL、日本語能力などが自動的に抽出されます。
          </p>
        </CardFooter>
      </Card>

      {/* 解析結果プレビューカード */}
      {showParsedDataPreview && parsedData && (
        <Card className="shadow-lg border-0 border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <CardTitle className="japanese-text text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              解析結果プレビュー
            </CardTitle>
            <CardDescription className="japanese-text text-gray-600">
              AIが抽出した履歴書情報です。下記の内容が自動的にフォームに入力されました。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 japanese-text border-b pb-2">基本情報</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">氏名:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.name ?? '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">年齢:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.age ?? '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">性別:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.gender ?? '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">国籍:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.nationality ?? '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">日本語レベル:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.japanese_level ?? '未設定'}</span>
                  </div>
                </div>
              </div>

              {/* 技術情報 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 japanese-text border-b pb-2">技術情報</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 japanese-text">経験年数:</span>
                    <span className="font-medium japanese-text">{parsedData.data?.experience ?? '未設定'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 japanese-text">スキル:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Array.isArray(parsedData.data?.skills) && parsedData.data.skills.length > 0 ? (
                        parsedData.data.skills.map((skill: string, index: number) => (
                          skill && (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full japanese-text">
                              {skill}
                            </span>
                          )
                        ))
                      ) : (
                        <span className="text-gray-400 japanese-text">未設定</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 japanese-text">業務範囲:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Array.isArray(parsedData.data?.work_scope) && parsedData.data.work_scope.length > 0 ? (
                        parsedData.data.work_scope.map((scope: string, index: number) => (
                          scope && (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full japanese-text">
                              {scope}
                            </span>
                          )
                        ))
                      ) : (
                        <span className="text-gray-400 japanese-text">未設定</span>
                      )}
                    </div>
                  </div>
                  {Array.isArray(parsedData.data?.roles) && parsedData.data.roles.length > 0 && (
                    <div>
                      <span className="text-gray-600 japanese-text">役割:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {parsedData.data.roles.map((role: string, index: number) => (
                          role && (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full japanese-text">
                              {role}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 処理時間情報 */}
            {parsedData.parse_time && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 japanese-text">
                  処理時間: {(parsedData.parse_time * 1000).toFixed(0)}ms
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowParsedDataPreview(false)}
                className="japanese-text"
              >
                プレビューを閉じる
              </Button>
              <Button 
                onClick={() => {
                  const formData = transformParsedDataToForm(parsedData);
                  setCandidateData(formData);
                  toast.success('解析結果をフォームに再適用しました');
                }}
                className="japanese-text"
              >
                フォームに再適用
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

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

                {/* 他社専用フィールド */}
                {!isOwnCompany && (
                  <>
                    <div className="space-y-3">
                      <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                        所属会社 <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={candidateData.companyName} 
                        className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                        placeholder="例: テックイノベーション株式会社"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                        担当者名 <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={candidateData.managerName} 
                        className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        onChange={(e) => handleFormChange('managerName', e.target.value)}
                        placeholder="例: 田中 太郎"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="japanese-text font-medium text-gray-700 flex items-center gap-1">
                        担当者メール <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        type="email"
                        value={candidateData.managerEmail} 
                        className="japanese-text border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                        onChange={(e) => handleFormChange('managerEmail', e.target.value)}
                        placeholder="例: tanaka@company.co.jp"
                      />
                    </div>
                  </>
                )}
                
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
                      '要件定義', '基本設計', '詳細設計', '製造',
                      '単体テスト', '結合テスト', '総合テスト', '運用保守'
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="japanese-text font-medium text-gray-700">稼働可能時期</Label>
                    <Input 
                      value={candidateData.availability}
                      onChange={(e) => handleFormChange('availability', e.target.value)}
                      placeholder="例: 即日、1ヶ月後、応相談"
                      className="japanese-text border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="japanese-text font-medium text-gray-700">ステータス</Label>
                    <Select
                      value={candidateData.status || "placeholder"}
                      onValueChange={(value) => handleFormChange('status', value === 'placeholder' ? '' : value)}
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