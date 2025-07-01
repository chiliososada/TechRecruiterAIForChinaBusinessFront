import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

// プレースホルダー定義
const PLACEHOLDERS = {
  project: [
    { label: '案件名', value: '{project_title}' },
    { label: '案件詳細', value: '{project_description}' },
    { label: '必須スキル', value: '{project_skills}' },
    { label: '勤務地', value: '{project_location}' },
    { label: '予算', value: '{project_budget}' },
    { label: '期間', value: '{project_duration}' },
    { label: '開始日', value: '{project_start_date}' },
    { label: '日本語レベル', value: '{project_japanese_level}' },
    { label: '経験年数', value: '{project_experience}' },
    { label: '主要技術', value: '{project_key_technologies}' },
    { label: '業務タイプ', value: '{project_work_type}' },
    { label: '募集人数', value: '{project_max_candidates}' },
  ],
  engineer: [
    { label: '技術者名', value: '{engineer_name}' },
    { label: '技術者メール', value: '{engineer_email}' },
    { label: 'スキル', value: '{engineer_skills}' },
    { label: '経験年数', value: '{engineer_experience}' },
    { label: '日本語レベル', value: '{engineer_japanese_level}' },
    { label: '最寄り駅', value: '{engineer_nearest_station}' },
    { label: '希望単価', value: '{engineer_desired_rate}' },
    { label: '稼働可能日', value: '{engineer_availability}' },
    { label: '国籍', value: '{engineer_nationality}' },
    { label: '学歴', value: '{engineer_education}' },
    { label: '資格', value: '{engineer_certifications}' },
    { label: 'PR', value: '{engineer_self_promotion}' },
  ],
};

type TemplateType = 'project_introduction' | 'engineer_introduction';

interface LocalEmailTemplate {
  id?: string;
  name: string;
  category: TemplateType;
  subject_template: string;
  body_template_text: string;
  signature_template?: string;
}

export function EmailTemplateSettings() {
  const { currentTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<TemplateType>('project_introduction');
  const [saving, setSaving] = useState(false);
  const { 
    templates: dbTemplates, 
    loading, 
    refreshTemplates,
    updateTemplate,
    createTemplate 
  } = useEmailTemplates({ autoLoad: true });
  
  const [templates, setTemplates] = useState<Record<TemplateType, LocalEmailTemplate>>({
    project_introduction: {
      name: '案件紹介メールテンプレート',
      category: 'project_introduction',
      subject_template: '【新規案件のご紹介】{project_title}',
      body_template_text: `お世話になっております。

新規案件のご紹介です。

【案件名】{project_title}
【必須スキル】{project_skills}
【勤務地】{project_location}
【予算】{project_budget}
【期間】{project_duration}
【開始日】{project_start_date}
【日本語レベル】{project_japanese_level}

ご検討のほど、よろしくお願いいたします。`,
      signature_template: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
株式会社○○○○
営業部
〒100-0001 東京都千代田区○○○○
TEL: 03-0000-0000
EMAIL: info@example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    },
    engineer_introduction: {
      name: '技術者紹介メールテンプレート',
      category: 'engineer_introduction',
      subject_template: '【エンジニアのご紹介】{engineer_name}様',
      body_template_text: `お世話になっております。

エンジニアのご紹介です。

【技術者名】{engineer_name}
【スキル】{engineer_skills}
【経験年数】{engineer_experience}
【日本語レベル】{engineer_japanese_level}
【最寄り駅】{engineer_nearest_station}
【希望単価】{engineer_desired_rate}
【稼働可能日】{engineer_availability}

ご検討のほど、よろしくお願いいたします。`,
      signature_template: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
株式会社○○○○
営業部
〒100-0001 東京都千代田区○○○○
TEL: 03-0000-0000
EMAIL: info@example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    },
  });

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const signatureRef = useRef<HTMLTextAreaElement>(null);
  
  // Engineer用のref
  const engineerSubjectRef = useRef<HTMLInputElement>(null);
  const engineerBodyRef = useRef<HTMLTextAreaElement>(null);
  const engineerSignatureRef = useRef<HTMLTextAreaElement>(null);
  
  // 最後にフォーカスされたフィールドとカーソル位置を記録
  const [lastFocusedField, setLastFocusedField] = useState<{
    field: 'subject' | 'body' | 'signature';
    position: number;
    templateType: TemplateType;
  } | null>(null);

  // データベースからのテンプレートデータを同期
  useEffect(() => {
    if (dbTemplates && dbTemplates.length > 0) {
      const newTemplates = { ...templates };
      dbTemplates.forEach((template) => {
        const category = template.category as TemplateType;
        if (category === 'project_introduction' || category === 'engineer_introduction') {
          newTemplates[category] = {
            id: template.id,
            name: template.name,
            category: category,
            subject_template: template.subject_template,
            body_template_text: template.body_template_text,
            signature_template: template.signature_template || '',
          };
        }
      });
      setTemplates(newTemplates);
    }
  }, [dbTemplates]);

  // フォーカス状態をトラッキング
  const handleFocus = (field: 'subject' | 'body' | 'signature', element: HTMLInputElement | HTMLTextAreaElement) => {
    const position = element.selectionStart || 0;
    const normalizedActiveTab = (activeTab === 'project_introduction' || activeTab === 'engineer_introduction') 
      ? activeTab 
      : 'project_introduction';
    
    setLastFocusedField({
      field,
      position,
      templateType: normalizedActiveTab
    });
    console.log('Focus tracked:', { field, position, activeTab: normalizedActiveTab, templateType: normalizedActiveTab });
  };

  // カーソル位置が変更された時
  const handleSelectionChange = (field: 'subject' | 'body' | 'signature', element: HTMLInputElement | HTMLTextAreaElement) => {
    const position = element.selectionStart || 0;
    const normalizedActiveTab = (activeTab === 'project_introduction' || activeTab === 'engineer_introduction') 
      ? activeTab 
      : 'project_introduction';
    
    setLastFocusedField(prev => prev ? {
      ...prev,
      field,
      position,
      templateType: normalizedActiveTab  // 確実にtemplateTypeを更新
    } : {
      field,
      position,
      templateType: normalizedActiveTab
    });
  };

  // プレースホルダーの挿入（カーソル位置対応）
  const insertPlaceholder = (placeholder: string, targetField?: 'subject' | 'body' | 'signature', templateType?: TemplateType) => {
    // activeTabを正規化
    const normalizedActiveTab = (activeTab === 'project_introduction' || activeTab === 'engineer_introduction') 
      ? activeTab 
      : 'project_introduction';
    
    // 最後にフォーカスされたフィールドを使用するか、指定されたフィールドを使用
    const actualField = targetField || lastFocusedField?.field || 'body';
    // 重要：常に現在のactiveTabを優先使用し、lastFocusedFieldのtemplateTypeに依存しない
    const actualTemplateType = templateType || normalizedActiveTab;
    // 同じテンプレートタイプの場合のみカーソル位置を使用
    const insertPosition = (lastFocusedField?.templateType === normalizedActiveTab) 
      ? (lastFocusedField?.position || 0) 
      : 0;
    
    console.log('Inserting placeholder:', { 
      placeholder, 
      actualField, 
      actualTemplateType, 
      insertPosition,
      currentActiveTab: activeTab,
      normalizedActiveTab,
      lastFocusedFieldTemplateType: lastFocusedField?.templateType
    });
    
    const newTemplates = { ...templates };
    const template = newTemplates[actualTemplateType];
    
    if (!template) {
      console.error('Template not found for type:', actualTemplateType);
      return;
    }
    
    // 現在の値を取得
    let currentValue = '';
    switch (actualField) {
      case 'subject':
        currentValue = template.subject_template || '';
        break;
      case 'body':
        currentValue = template.body_template_text || '';
        break;
      case 'signature':
        currentValue = template.signature_template || '';
        break;
    }
    
    // カーソル位置にプレースホルダーを挿入
    const safePosition = Math.min(insertPosition, currentValue.length);
    const newValue = currentValue.substring(0, safePosition) + placeholder + currentValue.substring(safePosition);
    
    // 値を更新
    switch (actualField) {
      case 'subject':
        template.subject_template = newValue;
        break;
      case 'body':
        template.body_template_text = newValue;
        break;
      case 'signature':
        template.signature_template = newValue;
        break;
    }
    
    setTemplates(newTemplates);
    
    // 新しいカーソル位置を計算
    const newCursorPosition = safePosition + placeholder.length;
    
    // フォーカス状態を更新
    setLastFocusedField(prev => prev ? {
      ...prev,
      position: newCursorPosition
    } : null);
    
    // フィールドにフォーカスを当ててカーソル位置を設定
    setTimeout(() => {
      let targetElement: HTMLInputElement | HTMLTextAreaElement | null = null;
      
      console.log('Setting focus - actualTemplateType:', actualTemplateType, 'normalizedActiveTab:', normalizedActiveTab);
      
      if (actualTemplateType === normalizedActiveTab) {
        if (actualTemplateType === 'engineer_introduction') {
          switch (actualField) {
            case 'subject':
              targetElement = engineerSubjectRef.current;
              break;
            case 'body':
              targetElement = engineerBodyRef.current;
              break;
            case 'signature':
              targetElement = engineerSignatureRef.current;
              break;
          }
        } else {
          switch (actualField) {
            case 'subject':
              targetElement = subjectRef.current;
              break;
            case 'body':
              targetElement = bodyRef.current;
              break;
            case 'signature':
              targetElement = signatureRef.current;
              break;
          }
        }
        
        console.log('Target element found:', !!targetElement, 'for field:', actualField);
        
        if (targetElement) {
          targetElement.focus();
          targetElement.setSelectionRange(newCursorPosition, newCursorPosition);
          console.log('Focused field:', actualField, 'cursor at:', newCursorPosition);
        } else {
          console.warn('Target element not found for field:', actualField, 'template:', actualTemplateType);
        }
      } else {
        console.warn('Template type mismatch:', actualTemplateType, '!==', normalizedActiveTab);
      }
    }, 50);
  };

  // テンプレートの保存
  const saveTemplate = async (templateType?: TemplateType) => {
    if (!currentTenant?.id) return;

    setSaving(true);
    try {
      const targetTemplateType = templateType || activeTab;
      const normalizedActiveTab = targetTemplateType === 'project_introduction' || targetTemplateType === 'engineer_introduction' 
        ? targetTemplateType 
        : 'project_introduction';
      
      const template = templates[normalizedActiveTab];
      if (!template) {
        throw new Error('テンプレートが見つかりません');
      }

      const templateData = {
        name: template.name,
        category: template.category,
        subject_template: template.subject_template,
        body_template_text: template.body_template_text,
        signature_template: template.signature_template,
      };

      if (template.id) {
        // 更新
        await updateTemplate({
          id: template.id,
          ...templateData,
        });
      } else {
        // 新規作成
        const newTemplate = await createTemplate(templateData);
        if (newTemplate) {
          const newTemplates = { ...templates };
          newTemplates[normalizedActiveTab].id = newTemplate.id;
          setTemplates(newTemplates);
        }
      }

      // データを再読み込み
      await refreshTemplates();
    } catch (error) {
      console.error('テンプレート保存エラー:', error);
    } finally {
      setSaving(false);
    }
  };

  // プレースホルダーをタグ形式で表示
  const renderTextWithTags = (text: string) => {
    const regex = /\{[^}]+\}/g;
    const parts = text.split(regex);
    const matches = text.match(regex) || [];

    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {matches[index] && (
              <Badge variant="secondary" className="mx-1 font-normal">
                {matches[index].replace(/[{}]/g, '')}
              </Badge>
            )}
          </span>
        ))}
      </div>
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>テンプレート設定</CardTitle>
        <CardDescription>
          メールテンプレートを設定します。項目をクリックして挿入できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('Changing activeTab to:', value);
          setActiveTab(value as TemplateType);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project_introduction">案件紹介メールテンプレート</TabsTrigger>
            <TabsTrigger value="engineer_introduction">技術者紹介メールテンプレート</TabsTrigger>
          </TabsList>

          <TabsContent value="project_introduction" className="space-y-6 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">テンプレートを読み込み中...</span>
              </div>
            ) : (
              <>
                {/* 件名 */}
                <div className="space-y-2">
                  <Label>件名</Label>
                  <Input
                    ref={subjectRef}
                    value={templates.project_introduction?.subject_template || ''}
                    onChange={(e) => {
                      const newTemplates = { ...templates };
                      if (newTemplates.project_introduction) {
                        newTemplates.project_introduction.subject_template = e.target.value;
                        setTemplates(newTemplates);
                      }
                    }}
                    onFocus={(e) => handleFocus('subject', e.target as HTMLInputElement)}
                    onSelect={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    onKeyUp={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    onClick={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    placeholder="メールの件名を入力..."
                  />
                </div>

                {/* 本文 */}
                <div className="space-y-2">
                  <Label>本文</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3">
                      <Textarea
                        ref={bodyRef}
                        value={templates.project_introduction?.body_template_text || ''}
                        onChange={(e) => {
                          const newTemplates = { ...templates };
                          if (newTemplates.project_introduction) {
                            newTemplates.project_introduction.body_template_text = e.target.value;
                            setTemplates(newTemplates);
                          }
                        }}
                        onFocus={(e) => handleFocus('body', e.target as HTMLTextAreaElement)}
                        onSelect={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        onKeyUp={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        onClick={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        placeholder="メール本文を入力..."
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">挿入可能な項目</Label>
                      <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto border rounded-md p-2">
                        {PLACEHOLDERS.project.map((placeholder) => (
                          <Button
                            key={placeholder.value}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              // 强制设置为project_introduction模板类型
                              insertPlaceholder(placeholder.value, undefined, 'project_introduction');
                            }}
                          >
                            {placeholder.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 署名 */}
                <div className="space-y-2">
                  <Label>署名</Label>
                  <Textarea
                    ref={signatureRef}
                    value={templates.project_introduction?.signature_template || ''}
                    onChange={(e) => {
                      const newTemplates = { ...templates };
                      if (newTemplates.project_introduction) {
                        newTemplates.project_introduction.signature_template = e.target.value;
                        setTemplates(newTemplates);
                      }
                    }}
                    onFocus={(e) => handleFocus('signature', e.target as HTMLTextAreaElement)}
                    onSelect={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    onKeyUp={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    onClick={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    placeholder="署名を入力..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* プレビュー */}
                <div className="space-y-2">
                  <Label>プレビュー</Label>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">件名</p>
                        {renderTextWithTags(templates.project_introduction?.subject_template || '')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">本文</p>
                        {renderTextWithTags(templates.project_introduction?.body_template_text || '')}
                      </div>
                      {templates.project_introduction?.signature_template && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">署名</p>
                          {renderTextWithTags(templates.project_introduction.signature_template)}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <Button 
                  onClick={() => saveTemplate('project_introduction')} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    'テンプレートを保存'
                  )}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="engineer_introduction" className="space-y-6 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">テンプレートを読み込み中...</span>
              </div>
            ) : (
              <>
                {/* 件名 */}
                <div className="space-y-2">
                  <Label>件名</Label>
                  <Input
                    ref={engineerSubjectRef}
                    value={templates.engineer_introduction?.subject_template || ''}
                    onChange={(e) => {
                      const newTemplates = { ...templates };
                      if (newTemplates.engineer_introduction) {
                        newTemplates.engineer_introduction.subject_template = e.target.value;
                        setTemplates(newTemplates);
                      }
                    }}
                    onFocus={(e) => handleFocus('subject', e.target as HTMLInputElement)}
                    onSelect={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    onKeyUp={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    onClick={(e) => handleSelectionChange('subject', e.target as HTMLInputElement)}
                    placeholder="メールの件名を入力..."
                  />
                </div>

                {/* 本文 */}
                <div className="space-y-2">
                  <Label>本文</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3">
                      <Textarea
                        ref={engineerBodyRef}
                        value={templates.engineer_introduction?.body_template_text || ''}
                        onChange={(e) => {
                          const newTemplates = { ...templates };
                          if (newTemplates.engineer_introduction) {
                            newTemplates.engineer_introduction.body_template_text = e.target.value;
                            setTemplates(newTemplates);
                          }
                        }}
                        onFocus={(e) => handleFocus('body', e.target as HTMLTextAreaElement)}
                        onSelect={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        onKeyUp={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        onClick={(e) => handleSelectionChange('body', e.target as HTMLTextAreaElement)}
                        placeholder="メール本文を入力..."
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">挿入可能な項目</Label>
                      <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto border rounded-md p-2">
                        {PLACEHOLDERS.engineer.map((placeholder) => (
                          <Button
                            key={placeholder.value}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              // 强制设置为engineer_introduction模板类型
                              insertPlaceholder(placeholder.value, undefined, 'engineer_introduction');
                            }}
                          >
                            {placeholder.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 署名 */}
                <div className="space-y-2">
                  <Label>署名</Label>
                  <Textarea
                    ref={engineerSignatureRef}
                    value={templates.engineer_introduction?.signature_template || ''}
                    onChange={(e) => {
                      const newTemplates = { ...templates };
                      if (newTemplates.engineer_introduction) {
                        newTemplates.engineer_introduction.signature_template = e.target.value;
                        setTemplates(newTemplates);
                      }
                    }}
                    onFocus={(e) => handleFocus('signature', e.target as HTMLTextAreaElement)}
                    onSelect={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    onKeyUp={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    onClick={(e) => handleSelectionChange('signature', e.target as HTMLTextAreaElement)}
                    placeholder="署名を入力..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* プレビュー */}
                <div className="space-y-2">
                  <Label>プレビュー</Label>
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">件名</p>
                        {renderTextWithTags(templates.engineer_introduction?.subject_template || '')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">本文</p>
                        {renderTextWithTags(templates.engineer_introduction?.body_template_text || '')}
                      </div>
                      {templates.engineer_introduction?.signature_template && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">署名</p>
                          {renderTextWithTags(templates.engineer_introduction.signature_template)}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <Button 
                  onClick={() => saveTemplate('engineer_introduction')} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    'テンプレートを保存'
                  )}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}