// メールテンプレートサービス使用例
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { EmailTemplate } from '@/services/emailTemplateService';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';

export function EmailTemplateExample() {
  const {
    templates,
    loading,
    error,
    refreshTemplates,
    getTemplatesByCategory,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    getAvailableCategories,
  } = useEmailTemplates();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 新規作成用フォーム
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '',
    subject_template: '',
    body_template_text: '',
    signature_template: '',
  });

  // カテゴリー一覧を取得
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getAvailableCategories();
      setAvailableCategories(categories);
    };
    loadCategories();
  }, [getAvailableCategories]);

  // テンプレート一覧を更新
  useEffect(() => {
    setFilteredTemplates(templates);
  }, [templates]);

  // カテゴリー別フィルタリング
  const handleCategoryFilter = async () => {
    if (selectedCategory) {
      const categoryTemplates = await getTemplatesByCategory(selectedCategory);
      setFilteredTemplates(categoryTemplates);
    } else {
      setFilteredTemplates(templates);
    }
  };

  // 検索
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const searchResults = await searchTemplates(searchQuery, selectedCategory || undefined);
      setFilteredTemplates(searchResults);
    } else {
      setFilteredTemplates(templates);
    }
  };

  // 新規作成
  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.subject_template || !newTemplate.body_template_text) {
      alert('必須項目を入力してください');
      return;
    }

    const created = await createTemplate(newTemplate);
    if (created) {
      setNewTemplate({
        name: '',
        description: '',
        category: '',
        subject_template: '',
        body_template_text: '',
        signature_template: '',
      });
      setIsCreating(false);
    }
  };

  // 更新
  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    const updated = await updateTemplate({
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      subject_template: selectedTemplate.subject_template,
      body_template_text: selectedTemplate.body_template_text,
      signature_template: selectedTemplate.signature_template,
    });

    if (updated) {
      setSelectedTemplate(null);
    }
  };

  // 削除
  const handleDelete = async (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      await deleteTemplate(templateId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">テンプレートを読み込み中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500">エラー: {error}</p>
          <Button onClick={refreshTemplates} className="mt-4">
            再読み込み
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>メールテンプレート管理</CardTitle>
          <CardDescription>
            テンプレートの表示、検索、作成、編集、削除の例
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索・フィルター */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>検索</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="テンプレート名、説明、カテゴリーで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-48">
              <Label>カテゴリー</Label>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全て</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCategoryFilter}>
                  フィルター
                </Button>
              </div>
            </div>
          </div>

          {/* 新規作成ボタン */}
          <div className="flex justify-between">
            <Button 
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
            <Button onClick={refreshTemplates} variant="outline">
              再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 新規作成フォーム */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>新しいテンプレートを作成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>テンプレート名 *</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="例: 案件紹介メールテンプレート"
                />
              </div>
              <div>
                <Label>カテゴリー *</Label>
                <Input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  placeholder="例: project_introduction"
                />
              </div>
            </div>
            <div>
              <Label>説明</Label>
              <Input
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="テンプレートの説明（任意）"
              />
            </div>
            <div>
              <Label>件名テンプレート *</Label>
              <Input
                value={newTemplate.subject_template}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject_template: e.target.value })}
                placeholder="例: 【新規案件のご紹介】{project_title}"
              />
            </div>
            <div>
              <Label>本文テンプレート *</Label>
              <Textarea
                value={newTemplate.body_template_text}
                onChange={(e) => setNewTemplate({ ...newTemplate, body_template_text: e.target.value })}
                placeholder="メール本文を入力..."
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Label>署名テンプレート</Label>
              <Textarea
                value={newTemplate.signature_template}
                onChange={(e) => setNewTemplate({ ...newTemplate, signature_template: e.target.value })}
                placeholder="署名を入力..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>作成</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* テンプレート一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>テンプレート一覧 ({filteredTemplates.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <p className="text-xs text-muted-foreground">
                      カテゴリー: {template.category} | 使用回数: {template.usage_count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      作成日: {new Date(template.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                テンプレートが見つかりません
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>テンプレートを編集</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>テンプレート名</Label>
                <Input
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                />
              </div>
              <div>
                <Label>カテゴリー</Label>
                <Input
                  value={selectedTemplate.category}
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, category: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>説明</Label>
              <Input
                value={selectedTemplate.description || ''}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
              />
            </div>
            <div>
              <Label>件名テンプレート</Label>
              <Input
                value={selectedTemplate.subject_template}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject_template: e.target.value })}
              />
            </div>
            <div>
              <Label>本文テンプレート</Label>
              <Textarea
                value={selectedTemplate.body_template_text}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body_template_text: e.target.value })}
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Label>署名テンプレート</Label>
              <Textarea
                value={selectedTemplate.signature_template || ''}
                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, signature_template: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>更新</Button>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}