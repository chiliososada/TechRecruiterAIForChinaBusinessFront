import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wand2 } from 'lucide-react';
import { Engineer } from './types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CandidateEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engineer: Engineer | null;
  onEngineerChange: (engineer: Engineer) => void;
  onSave: () => void;
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
  const [recommendationTemplate, setRecommendationTemplate] = useState<string>(
    `[名前]は[スキル]を中心に[経験]年の開発経験があり、日本語は[日本語レベル]です。
[得意分野]に強みがあり、[ツール]などの技術も習得しています。
チームリーダーとしての経験もあり、要件定義から設計、実装、テストまでの一連の開発プロセスを担当できます。
[備考]`
  );
  const { user, currentTenant } = useAuth();

  useEffect(() => {
    console.log('=== CandidateEdit useEffect triggered ===');
    console.log('Previous localEngineer nearestStation:', localEngineer?.nearestStation);
    console.log('New engineer nearestStation:', engineer?.nearestStation);
    setLocalEngineer(engineer);
    console.log('After setLocalEngineer');
  }, [engineer]);

  // 自社エンジニアの場合、担当者情報を自動入力（初回のみ）
  useEffect(() => {
    console.log('=== Auto-fill useEffect triggered ===');
    console.log('engineer:', engineer);
    console.log('isOwnCompany:', isOwnCompany);
    console.log('user:', user);
    console.log('currentTenant:', currentTenant);
    
    if (engineer && isOwnCompany && user && currentTenant) {
      const newManagerName = user.full_name || user.email || '';
      const newManagerEmail = user.email || '';
      const newCompanyName = currentTenant.name || currentTenant.company_name || '';
      
      console.log('Current engineer.managerName:', engineer.managerName);
      console.log('Current engineer.managerEmail:', engineer.managerEmail);
      console.log('Current engineer.nearestStation:', engineer.nearestStation);
      
      // Only auto-fill if the fields are empty (first time editing)
      if (!engineer.managerName && !engineer.managerEmail) {
        const updatedEngineer = {
          ...engineer,
          managerName: newManagerName,
          managerEmail: newManagerEmail,
          companyName: newCompanyName
        };
        console.log('Auto-filling manager info for new engineer');
        console.log('Updated engineer nearestStation:', updatedEngineer.nearestStation);
        setLocalEngineer(updatedEngineer);
      } else {
        console.log('Not auto-filling because manager info already exists');
      }
    }
  }, [engineer?.id, isOwnCompany]); // Only depend on engineer ID and company type

  // Track localEngineer state changes
  useEffect(() => {
    console.log('=== localEngineer state changed ===');
    console.log('localEngineer nearestStation:', localEngineer?.nearestStation);
  }, [localEngineer]);

  if (!localEngineer) return null;

  const handleChange = (field: keyof Engineer, value: any) => {
    console.log(`=== handleChange ${field} ===`);
    console.log('Previous value:', localEngineer[field]);
    console.log('New value:', value);
    const updatedEngineer = { ...localEngineer, [field]: value };
    console.log('Updated engineer nearestStation:', updatedEngineer.nearestStation);
    setLocalEngineer(updatedEngineer);
  };

  const handleSave = () => {
    if (localEngineer) {
      console.log('Saving engineer with nearestStation:', localEngineer.nearestStation);
      console.log('Full engineer data:', localEngineer);
      onEngineerChange(localEngineer);
      onSave();
    }
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim());
    handleChange('skills', skillsArray);
  };

  // AI推薦文生成機能
  const generateRecommendation = () => {
    toast.info('推薦文を生成中...', { duration: 2000 });
    
    setTimeout(() => {
      // テンプレートに基づいて推薦文を生成
      if (!localEngineer) return;
      
      const newText = recommendationTemplate
        .replace('[名前]', `${localEngineer.name}さん`)
        .replace('[スキル]', Array.isArray(localEngineer.skills) ? localEngineer.skills.slice(0, 2).join('と') : '')
        .replace('[経験]', localEngineer.experience || '5')
        .replace('[日本語レベル]', localEngineer.japaneseLevel || 'ビジネスレベル')
        .replace('[得意分野]', localEngineer.workExperience || 'プロジェクト開発')
        .replace('[ツール]', Array.isArray(localEngineer.skills) ? localEngineer.skills.slice(2).join('や') : '')
        .replace('[備考]', localEngineer.remarks || '');
        
      handleChange('recommendation', newText);
      toast.success('推薦文が生成されました');
    }, 2000);
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
          </div>
          
          <div className="space-y-2">
            <Label className="japanese-text">自己アピール</Label>
            <Textarea 
              value={localEngineer.selfPromotion || ''}
              onChange={(e) => handleChange('selfPromotion', e.target.value)}
              className="japanese-text"
              rows={4}
              placeholder="候補者の自己アピールを入力"
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
          
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <Label className="japanese-text text-base font-medium">推薦文</Label>
              <Button 
                variant="outline" 
                size="sm" 
                className="japanese-text"
                onClick={generateRecommendation}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                AI生成
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">推薦テンプレート</Label>
              <Textarea 
                value={recommendationTemplate}
                onChange={(e) => setRecommendationTemplate(e.target.value)}
                className="japanese-text text-sm"
                rows={3}
                placeholder="[名前]、[スキル]などのプレースホルダーを使用"
              />
              <p className="text-xs text-muted-foreground japanese-text">
                プレースホルダー: [名前]、[スキル]、[経験]、[日本語レベル]、[得意分野]、[ツール]、[備考]
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="japanese-text">推薦文</Label>
              <Textarea 
                value={localEngineer.recommendation || ''}
                onChange={(e) => handleChange('recommendation', e.target.value)}
                className="japanese-text"
                rows={5}
                placeholder="AIで生成するか、手動で入力してください"
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
