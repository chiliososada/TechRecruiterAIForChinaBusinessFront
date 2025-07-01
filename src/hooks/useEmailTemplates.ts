// メールテンプレート管理用カスタムフック
import { useState, useEffect, useCallback } from 'react';
import { emailTemplateService, EmailTemplate, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '@/services/emailTemplateService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UseEmailTemplatesOptions {
  category?: string;
  isActive?: boolean;
  autoLoad?: boolean;
}

interface UseEmailTemplatesReturn {
  templates: EmailTemplate[];
  loading: boolean;
  error: string | null;
  refreshTemplates: () => Promise<void>;
  getTemplateById: (templateId: string) => Promise<EmailTemplate | null>;
  getTemplatesByCategory: (category: string) => Promise<EmailTemplate[]>;
  getDefaultTemplateByCategory: (category: string) => Promise<EmailTemplate | null>;
  createTemplate: (templateData: CreateEmailTemplateRequest) => Promise<EmailTemplate | null>;
  updateTemplate: (templateData: UpdateEmailTemplateRequest) => Promise<EmailTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  incrementUsageCount: (templateId: string) => Promise<boolean>;
  searchTemplates: (query: string, category?: string) => Promise<EmailTemplate[]>;
  getAvailableCategories: () => Promise<string[]>;
}

export function useEmailTemplates(options: UseEmailTemplatesOptions = {}): UseEmailTemplatesReturn {
  const { currentTenant, user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { category, isActive = true, autoLoad = true } = options;

  // テンプレート一覧を取得
  const refreshTemplates = useCallback(async () => {
    if (!currentTenant?.id) {
      setError('テナントIDが設定されていません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await emailTemplateService.getTemplates(currentTenant.id, {
        category,
        isActive,
      });
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの取得に失敗しました';
      setError(errorMessage);
      console.error('テンプレート取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id, category, isActive]);

  // 初期ローディング
  useEffect(() => {
    if (autoLoad && currentTenant?.id) {
      refreshTemplates();
    }
  }, [autoLoad, refreshTemplates, currentTenant?.id]);

  // IDからテンプレート詳細を取得
  const getTemplateById = useCallback(async (templateId: string): Promise<EmailTemplate | null> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return null;
    }

    try {
      return await emailTemplateService.getTemplateById(templateId, currentTenant.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの取得に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [currentTenant?.id]);

  // カテゴリー別テンプレートを取得
  const getTemplatesByCategory = useCallback(async (categoryName: string): Promise<EmailTemplate[]> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return [];
    }

    try {
      return await emailTemplateService.getTemplatesByCategory(currentTenant.id, categoryName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'カテゴリー別テンプレートの取得に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    }
  }, [currentTenant?.id]);

  // デフォルトテンプレートを取得
  const getDefaultTemplateByCategory = useCallback(async (categoryName: string): Promise<EmailTemplate | null> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return null;
    }

    try {
      return await emailTemplateService.getDefaultTemplateByCategory(currentTenant.id, categoryName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'デフォルトテンプレートの取得に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [currentTenant?.id]);

  // テンプレートを作成
  const createTemplate = useCallback(async (templateData: CreateEmailTemplateRequest): Promise<EmailTemplate | null> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const newTemplate = await emailTemplateService.createTemplate(
        currentTenant.id,
        templateData,
        user?.id
      );
      
      toast({
        title: '成功',
        description: 'テンプレートを作成しました',
      });

      // 一覧を更新
      await refreshTemplates();
      
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの作成に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [currentTenant?.id, user?.id, refreshTemplates]);

  // テンプレートを更新
  const updateTemplate = useCallback(async (templateData: UpdateEmailTemplateRequest): Promise<EmailTemplate | null> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const updatedTemplate = await emailTemplateService.updateTemplate(currentTenant.id, templateData);
      
      toast({
        title: '成功',
        description: 'テンプレートを更新しました',
      });

      // 一覧を更新
      await refreshTemplates();
      
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの更新に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [currentTenant?.id, refreshTemplates]);

  // テンプレートを削除
  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const success = await emailTemplateService.deleteTemplate(templateId, currentTenant.id);
      
      if (success) {
        toast({
          title: '成功',
          description: 'テンプレートを削除しました',
        });
        
        // 一覧を更新
        await refreshTemplates();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの削除に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [currentTenant?.id, refreshTemplates]);

  // 使用回数を増加
  const incrementUsageCount = useCallback(async (templateId: string): Promise<boolean> => {
    if (!currentTenant?.id) {
      return false;
    }

    try {
      return await emailTemplateService.incrementUsageCount(templateId, currentTenant.id);
    } catch (err) {
      console.error('使用回数更新エラー:', err);
      return false;
    }
  }, [currentTenant?.id]);

  // テンプレート検索
  const searchTemplates = useCallback(async (query: string, categoryName?: string): Promise<EmailTemplate[]> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return [];
    }

    try {
      return await emailTemplateService.searchTemplates({
        tenantId: currentTenant.id,
        query,
        category: categoryName,
        isActive: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'テンプレートの検索に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    }
  }, [currentTenant?.id]);

  // 利用可能なカテゴリー一覧を取得
  const getAvailableCategories = useCallback(async (): Promise<string[]> => {
    if (!currentTenant?.id) {
      toast({
        title: 'エラー',
        description: 'テナントIDが設定されていません',
        variant: 'destructive',
      });
      return [];
    }

    try {
      return await emailTemplateService.getAvailableCategories(currentTenant.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'カテゴリーの取得に失敗しました';
      toast({
        title: 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });
      return [];
    }
  }, [currentTenant?.id]);

  return {
    templates,
    loading,
    error,
    refreshTemplates,
    getTemplateById,
    getTemplatesByCategory,
    getDefaultTemplateByCategory,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsageCount,
    searchTemplates,
    getAvailableCategories,
  };
}