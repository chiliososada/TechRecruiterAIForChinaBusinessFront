// メールテンプレートサービス
import { businessClientManager } from '@/integrations/supabase/business-client';

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: string;
  subject_template: string;
  body_template_text: string;
  body_template_html?: string;
  signature_template?: string;
  available_placeholders: string[];
  required_placeholders: string[];
  ai_summary_enabled: boolean;
  is_active: boolean;
  usage_count: number;
  last_used_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  description?: string;
  category: string;
  subject_template: string;
  body_template_text: string;
  body_template_html?: string;
  signature_template?: string;
  available_placeholders?: string[];
  required_placeholders?: string[];
  ai_summary_enabled?: boolean;
}

export interface UpdateEmailTemplateRequest extends Partial<CreateEmailTemplateRequest> {
  id: string;
}

class EmailTemplateService {
  
  // テンプレート一覧を取得
  async getTemplates(tenantId: string, options?: {
    category?: string;
    isActive?: boolean;
    limit?: number;
  }): Promise<EmailTemplate[]> {
    try {
      const client = businessClientManager.getClient();
      let query = client
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId);

      // カテゴリーフィルタを追加
      if (options?.category) {
        query = query.eq('category', options.category);
      }

      // アクティブ状態フィルタを追加
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      // 削除されていないテンプレートのみ取得
      query = query.is('deleted_at', null);

      // 並び順を設定
      query = query.order('created_at', { ascending: false });

      // 制限数を設定
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('テンプレート一覧取得失敗:', error);
        throw new Error(`テンプレート一覧取得失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('テンプレートサービスエラー:', error);
      throw error;
    }
  }

  // IDからテンプレート詳細を取得
  async getTemplateById(templateId: string, tenantId: string): Promise<EmailTemplate | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('テンプレート詳細取得失敗:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('テンプレート詳細取得エラー:', error);
      return null;
    }
  }

  // カテゴリー別テンプレートを取得
  async getTemplatesByCategory(tenantId: string, category: string): Promise<EmailTemplate[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('category', category)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('カテゴリー別テンプレート取得失敗:', error);
        throw new Error(`カテゴリー別テンプレート取得失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('カテゴリー別テンプレート取得エラー:', error);
      throw error;
    }
  }

  // デフォルトテンプレートを取得（使用回数が最も多いもの）
  async getDefaultTemplateByCategory(tenantId: string, category: string): Promise<EmailTemplate | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('category', category)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('デフォルトテンプレート取得失敗:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('デフォルトテンプレート取得エラー:', error);
      return null;
    }
  }

  // テンプレートを作成
  async createTemplate(tenantId: string, templateData: CreateEmailTemplateRequest, createdBy?: string): Promise<EmailTemplate> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .insert({
          tenant_id: tenantId,
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          subject_template: templateData.subject_template,
          body_template_text: templateData.body_template_text,
          body_template_html: templateData.body_template_html,
          signature_template: templateData.signature_template,
          available_placeholders: templateData.available_placeholders || [],
          required_placeholders: templateData.required_placeholders || [],
          ai_summary_enabled: templateData.ai_summary_enabled || false,
          is_active: true,
          usage_count: 0,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        console.error('テンプレート作成失敗:', error);
        throw new Error(`テンプレート作成失敗: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('テンプレート作成エラー:', error);
      throw error;
    }
  }

  // テンプレートを更新
  async updateTemplate(tenantId: string, templateData: UpdateEmailTemplateRequest): Promise<EmailTemplate> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          subject_template: templateData.subject_template,
          body_template_text: templateData.body_template_text,
          body_template_html: templateData.body_template_html,
          signature_template: templateData.signature_template,
          available_placeholders: templateData.available_placeholders,
          required_placeholders: templateData.required_placeholders,
          ai_summary_enabled: templateData.ai_summary_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateData.id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('テンプレート更新失敗:', error);
        throw new Error(`テンプレート更新失敗: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('テンプレート更新エラー:', error);
      throw error;
    }
  }

  // テンプレートを削除（論理削除）
  async deleteTemplate(templateId: string, tenantId: string): Promise<boolean> {
    try {
      const client = businessClientManager.getClient();
      const { error } = await client
        .from('email_templates')
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('テンプレート削除失敗:', error);
        throw new Error(`テンプレート削除失敗: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('テンプレート削除エラー:', error);
      throw error;
    }
  }

  // テンプレートの使用回数を増加
  async incrementUsageCount(templateId: string, tenantId: string): Promise<boolean> {
    try {
      const client = businessClientManager.getClient();
      const { error } = await client
        .from('email_templates')
        .update({
          usage_count: client.raw('usage_count + 1'),
          last_used_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('使用回数更新失敗:', error);
        throw new Error(`使用回数更新失敗: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('使用回数更新エラー:', error);
      throw error;
    }
  }

  // テンプレート検索
  async searchTemplates(searchParams: {
    tenantId: string;
    query?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<EmailTemplate[]> {
    try {
      const client = businessClientManager.getClient();
      let query = client
        .from('email_templates')
        .select('*')
        .eq('tenant_id', searchParams.tenantId)
        .is('deleted_at', null);

      // テキスト検索を追加
      if (searchParams.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,category.ilike.%${searchParams.query}%`);
      }

      // カテゴリーフィルタを追加
      if (searchParams.category) {
        query = query.eq('category', searchParams.category);
      }

      // アクティブ状態フィルタを追加
      if (searchParams.isActive !== undefined) {
        query = query.eq('is_active', searchParams.isActive);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('テンプレート検索失敗:', error);
        throw new Error(`テンプレート検索失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('テンプレート検索エラー:', error);
      throw error;
    }
  }

  // 利用可能なカテゴリー一覧を取得
  async getAvailableCategories(tenantId: string): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('email_templates')
        .select('category')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .is('deleted_at', null);

      if (error) {
        console.error('カテゴリー一覧取得失敗:', error);
        return [];
      }

      // 重複除去
      const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return categories;
    } catch (error) {
      console.error('カテゴリー一覧取得エラー:', error);
      return [];
    }
  }
}

export const emailTemplateService = new EmailTemplateService();