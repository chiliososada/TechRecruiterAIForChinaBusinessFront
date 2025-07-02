import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText, X } from 'lucide-react';
import { Engineer } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { uploadResumeFile, deleteUploadedFile } from '@/utils/backend-api';

interface CandidateEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engineer: Engineer | null;
  onEngineerChange: (engineer: Engineer) => void;
  onSave: (engineer?: Engineer) => Promise<void>;
  isOwnCompany: boolean;
}

export const CandidateEdit: React.FC<CandidateEditProps> = ({
  open,
  onOpenChange,
  engineer,
  onEngineerChange,
  onSave,
  isOwnCompany
}) => {
  const [localEngineer, setLocalEngineer] = useState<Engineer | null>(engineer);
  const { user, currentTenant } = useAuth();
  
  // ファイルアップロード関連のstate
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileNameSetByUpload, setFileNameSetByUpload] = useState<boolean>(false);

  useEffect(() => {
    setLocalEngineer(engineer);
    // 履歴書ファイル名を初期化 - データベースのresume_file_nameを優先使用
    if (engineer?.resumeUrl && !fileNameSetByUpload) {
      console.log('=== Initial File Name Setup ===');
      console.log('engineer.resumeUrl:', engineer.resumeUrl);
      console.log('engineer.resumeFileName:', engineer.resumeFileName);
      
      // データベースにファイル名がある場合は使用、なければURLから抽出
      const fileName = engineer.resumeFileName || extractFileNameFromUrl(engineer.resumeUrl);
      console.log('Final fileName for display:', fileName);
      setUploadedFileName(fileName);
    } else if (!engineer?.resumeUrl) {
      setUploadedFileName('');
      setFileNameSetByUpload(false);
    }
  }, [engineer, fileNameSetByUpload]);

  // 自社エンジニアの場合、担当者情報を自動入力（初回のみ）
  useEffect(() => {
    if (engineer && isOwnCompany && user && currentTenant) {
      const newManagerName = user.full_name || user.email || '';
      const newManagerEmail = user.email || '';
      const newCompanyName = currentTenant.name || currentTenant.company_name || '';
      
      // Only auto-fill if the fields are empty (first time editing)
      if (!engineer.managerName && !engineer.managerEmail) {
        const updatedEngineer = {
          ...engineer,
          managerName: newManagerName,
          managerEmail: newManagerEmail,
          companyName: newCompanyName
        };
        setLocalEngineer(updatedEngineer);
      }
    }
  }, [engineer?.id, isOwnCompany]); // Only depend on engineer ID and company type
  
  // uploadedFileNameの変更を監視
  useEffect(() => {
    console.log('=== uploadedFileName changed ===');
    console.log('New uploadedFileName:', uploadedFileName);
  }, [uploadedFileName]);

  // 履歴書テキストから名前を抽出するヘルパー関数
  const extractNameFromResumeText = (): string | null => {
    if (!localEngineer?.resumeText) return null;
    
    try {
      // 履歴書テキストから氏名を抽出
      // パターン1: "氏名\n名前" の形式
      const nameMatch1 = localEngineer.resumeText.match(/氏名\s*\n?\s*([^\s\n]+)/);
      if (nameMatch1 && nameMatch1[1]) {
        return nameMatch1[1];
      }
      
      // パターン2: "フリガナ\n何か\n名前" の形式
      const nameMatch2 = localEngineer.resumeText.match(/フリガナ\s*\n\s*[^\n]+\s*\n\s*([^\s\n]+)/);
      if (nameMatch2 && nameMatch2[1]) {
        return nameMatch2[1];
      }
      
      // パターン3: エンジニア名から取得
      if (localEngineer.name && localEngineer.name !== '') {
        return localEngineer.name;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting name from resume text:', error);
      return null;
    }
  };

  // URLからファイル名を抽出するヘルパー関数
  const extractFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // タイムスタンプ付きファイル名から元のファイル名を推測
      // 例: "20250702_161750_-.xls" から "職務経歴書-燕.xls" を抽出
      const decodedFileName = decodeURIComponent(fileName);
      const timestampPattern = /^\d{8}_\d{6}_(.+)$/;
      const match = decodedFileName.match(timestampPattern);
      
      if (match && match[1]) {
        // タイムスタンプを除去した元のファイル名を返す
        let originalName = match[1];
        
        // 特殊なケースの処理
        if (originalName === '-.xls' || originalName === '-.xlsx') {
          // resume_textから名前を抽出しようとする
          const nameFromResume = extractNameFromResumeText();
          if (nameFromResume) {
            return `職務経歴書-${nameFromResume}${originalName.substring(1)}`;
          }
          return `職務経歴書${originalName}`;
        } else if (originalName.startsWith('-')) {
          // ハイフンで始まる場合は適切なプレフィックスを付ける
          originalName = '職務経歴書' + originalName;
        }
        
        return originalName;
      }
      
      return decodedFileName;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return '履歴書ファイル';
    }
  };

  if (!localEngineer) return null;

  const handleChange = (field: keyof Engineer, value: any) => {
    setLocalEngineer({ ...localEngineer, [field]: value });
  };

  // ファイルアップロード処理
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル形式検証
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Excel形式のファイル（.xls, .xlsx）のみアップロード可能です');
      return;
    }

    // ファイルサイズ検証（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('ファイルサイズは10MB以下にしてください');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      toast.info('履歴書ファイルをアップロード中...');
      
      const uploadResult = await uploadResumeFile(file, localEngineer?.id);
      
      if (uploadResult.success && uploadResult.data) {
        const fileName = uploadResult.data.metadata?.original_filename || 
                        uploadResult.data.file_name || 
                        extractFileNameFromUrl(uploadResult.data.file_url || '');
        
        const updatedEngineer = {
          ...localEngineer!,
          resumeUrl: uploadResult.data.file_url || '',
          resumeText: uploadResult.data.extracted_text || '',
          resumeFileName: fileName
        };
        
        // ファイル名をUIに設定
        console.log('Final fileName to set:', fileName);
        setUploadedFileName(fileName);
        setFileNameSetByUpload(true);
        
        // 状態を同期的に更新
        setLocalEngineer(updatedEngineer);
        onEngineerChange(updatedEngineer);
        
        toast.success('履歴書ファイルのアップロードが完了しました。保存ボタンをクリックして変更を保存してください。');
      } else {
        toast.error('アップロードに失敗しました: ' + (uploadResult.message || ''));
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      toast.error('アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      // ファイル入力をクリア
      event.target.value = '';
    }
  };

  // ファイル削除処理
  const handleFileDelete = async () => {
    if (!localEngineer?.resumeUrl) return;

    try {
      toast.info('履歴書ファイルを削除中...');
      
      // バックエンドAPIを使用してファイル削除（engineer_idを含める）
      const deleteResult = await deleteUploadedFile(localEngineer.resumeUrl, localEngineer.id);
      
      if (deleteResult.success) {
        const updatedEngineer = {
          ...localEngineer,
          resumeUrl: '',
          resumeText: '',
          resumeFileName: ''
        };
        
        // ファイル名もクリア
        setUploadedFileName('');
        setFileNameSetByUpload(false);
        
        // 状態を同期的に更新
        setLocalEngineer(updatedEngineer);
        onEngineerChange(updatedEngineer);
        
        toast.success('履歴書ファイルの削除が完了しました。保存ボタンをクリックして変更を保存してください。');
      } else {
        toast.error('削除に失敗しました: ' + (deleteResult.message || ''));
      }
    } catch (error) {
      console.error('削除エラー:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleSave = async () => {
    if (localEngineer) {
      console.log('=== CandidateEdit handleSave Debug ===');
      console.log('LocalEngineer resumeUrl:', localEngineer.resumeUrl);
      console.log('LocalEngineer resumeText:', localEngineer.resumeText ? `${localEngineer.resumeText.substring(0, 100)}...` : 'No resumeText');
      console.log('LocalEngineer all resume fields:', {
        resumeUrl: localEngineer.resumeUrl,
        resumeText: localEngineer.resumeText ? 'Has text' : 'No text'
      });
      
      onEngineerChange(localEngineer);
      // Pass localEngineer directly to the save callback instead of relying on selectedEngineer
      await onSave(localEngineer);
    }
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim());
    handleChange('skills', skillsArray);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="japanese-text">技術者情報編集</DialogTitle>
          <DialogDescription className="japanese-text">
            技術者の情報を編集します
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="japanese-text">氏名 <span className="text-red-500">*</span></Label>
              <Input 
                value={localEngineer.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="japanese-text"
              />
            </div>

            <div className="space-y-2">
              <Label className="japanese-text">
                所属会社 <span className="text-red-500">*</span>
                {isOwnCompany && <span className="text-sm text-gray-500 ml-2">(自動入力)</span>}
              </Label>
              <Input 
                value={localEngineer.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder={isOwnCompany ? "自動入力されます" : "例: テックイノベーション株式会社"}
                className={`japanese-text ${isOwnCompany ? 'bg-gray-100' : ''}`}
                disabled={isOwnCompany}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="japanese-text">
                  担当者名 <span className="text-red-500">*</span>
                  {isOwnCompany && <span className="text-sm text-gray-500 ml-2">(自動入力)</span>}
                </Label>
                <Input 
                  value={localEngineer.managerName || ''}
                  onChange={(e) => handleChange('managerName', e.target.value)}
                  placeholder={isOwnCompany ? "自動入力されます" : "例: 田中 太郎"}
                  className={`japanese-text ${isOwnCompany ? 'bg-gray-100' : ''}`}
                  disabled={isOwnCompany}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="japanese-text">
                  担当者メール <span className="text-red-500">*</span>
                  {isOwnCompany && <span className="text-sm text-gray-500 ml-2">(自動入力)</span>}
                </Label>
                <Input 
                  type="email"
                  value={localEngineer.managerEmail || ''}
                  onChange={(e) => handleChange('managerEmail', e.target.value)}
                  placeholder={isOwnCompany ? "自動入力されます" : "例: tanaka@company.co.jp"}
                  className={`japanese-text ${isOwnCompany ? 'bg-gray-100' : ''}`}
                  disabled={isOwnCompany}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">国籍</Label>
              <Select
                value={localEngineer.nationality || "placeholder"}
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
              <Label className="japanese-text">年齢</Label>
              <Input 
                value={localEngineer.age || ''}
                onChange={(e) => handleChange('age', e.target.value)}
                className="japanese-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">性別</Label>
              <Select
                value={localEngineer.gender || "placeholder"}
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
              <Label className="japanese-text">最寄駅</Label>
              <Input 
                value={localEngineer.nearestStation || ''}
                onChange={(e) => handleChange('nearestStation', e.target.value)}
                className="japanese-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">学歴</Label>
              <Input 
                value={localEngineer.education || ''}
                onChange={(e) => handleChange('education', e.target.value)}
                className="japanese-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">来日年度</Label>
              <Input 
                value={localEngineer.arrivalYear || ''}
                onChange={(e) => handleChange('arrivalYear', e.target.value)}
                className="japanese-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">保有スキル <span className="text-red-500">*</span></Label>
              <Input 
                value={Array.isArray(localEngineer.skills) ? localEngineer.skills.join(', ') : ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="japanese-text"
                placeholder="例: Java, Spring Boot, AWS（カンマ区切り）"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">資格</Label>
              <Input 
                value={Array.isArray(localEngineer.certifications) ? localEngineer.certifications.join(', ') : localEngineer.certifications || ''}
                onChange={(e) => handleChange('certifications', e.target.value.split(',').map(cert => cert.trim()))}
                className="japanese-text"
                placeholder="例: AWS認定ソリューションアーキテクト, Oracle認定Javaプログラマー"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">日本語レベル <span className="text-red-500">*</span></Label>
              <Select
                value={localEngineer.japaneseLevel || "placeholder"}
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
              <Label className="japanese-text">英語レベル</Label>
              <Select
                value={localEngineer.englishLevel || "placeholder"}
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
              <Label className="japanese-text">経験年数 <span className="text-red-500">*</span></Label>
              <Input 
                value={localEngineer.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="japanese-text"
                placeholder="例: 5年"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">業務範囲</Label>
              <Input 
                value={localEngineer.workScope || ''}
                onChange={(e) => handleChange('workScope', e.target.value)}
                className="japanese-text"
                placeholder="例: 製造, テスト, 要件定義"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">業務経験</Label>
              <Input 
                value={localEngineer.workExperience || ''}
                onChange={(e) => handleChange('workExperience', e.target.value)}
                className="japanese-text"
                placeholder="例: 金融, 保険, EC"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">稼働可能時期</Label>
              <Input 
                value={localEngineer.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="japanese-text"
                placeholder="例: 即日、1ヶ月後、応相談"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">ステータス</Label>
              <Select
                value={localEngineer.status ? (Array.isArray(localEngineer.status) ? localEngineer.status[0] : localEngineer.status) : "placeholder"}
                onValueChange={(value) => handleChange('status', value === 'placeholder' ? [] : [value])}
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
            
            <div className="space-y-2">
              <Label className="japanese-text">希望単価（万円/月）</Label>
              <Input 
                type="number"
                value={localEngineer.desiredRate || ''}
                onChange={(e) => handleChange('desiredRate', e.target.value)}
                className="japanese-text"
                placeholder="例: 60, 70"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="japanese-text">自己アピール</Label>
            <Textarea 
              value={localEngineer.selfPromotion || ''}
              onChange={(e) => handleChange('selfPromotion', e.target.value)}
              className="japanese-text"
              rows={4}
              placeholder="技術者の自己アピールを入力"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="japanese-text">備考</Label>
            <Textarea 
              value={localEngineer.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              className="japanese-text"
              rows={4}
              placeholder="出勤制限、出張可否などを記入"
            />
          </div>
          
          {/* 履歴書ファイルセクション */}
          <div className="space-y-4 border-t pt-4">
            <Label className="japanese-text text-base font-medium">履歴書ファイル</Label>
            
            <div className="space-y-3">
              {/* 既存ファイル表示 */}
              {localEngineer.resumeUrl ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium japanese-text">
                        {(() => {
                          console.log('=== Display File Name Debug ===');
                          console.log('uploadedFileName:', uploadedFileName);
                          console.log('localEngineer.resumeUrl:', localEngineer.resumeUrl);
                          return uploadedFileName || '履歴書ファイル';
                        })()}
                      </p>
                      <p className="text-xs text-gray-500 japanese-text">
                        アップロード済み
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(localEngineer.resumeUrl, '_blank')}
                      className="japanese-text"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      表示
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFileDelete}
                      className="japanese-text text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 japanese-text">
                  履歴書ファイルはアップロードされていません
                </div>
              )}
              
              {/* ファイルアップロード - 履歴書がない場合のみ表示 */}
              {!localEngineer.resumeUrl && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        id="resume-file-input"
                      />
                      <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                        <span className="text-sm text-gray-600 japanese-text">
                          {uploadedFile ? uploadedFile.name : 'ファイルを選択してください'}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="japanese-text ml-2"
                          onClick={() => document.getElementById('resume-file-input')?.click()}
                        >
                          参照
                        </Button>
                      </div>
                    </div>
                    {isUploading && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="japanese-text">アップロード中...</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 japanese-text">
                    Excel形式のファイル（.xls, .xlsx）のみ対応（最大10MB）
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label className="japanese-text text-base font-medium">推薦文</Label>
              <Textarea 
                value={localEngineer.recommendation || ''}
                onChange={(e) => handleChange('recommendation', e.target.value)}
                className="japanese-text"
                rows={5}
                placeholder="推薦文を入力してください"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="japanese-text">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="japanese-text">
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
