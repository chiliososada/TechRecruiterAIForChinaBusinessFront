// 案件データサービス
import { businessClientManager } from '@/integrations/supabase/business-client';
import { useAuth } from '@/contexts/AuthContext';

export interface Project {
  id: string;
  title: string;
  client_company?: string;
  partner_company?: string;
  description?: string;
  detail_description?: string;
  status: string;
  priority: string;
  manager_name?: string;
  manager_email?: string;
  skills: string[];
  experience?: string;
  key_technologies?: string;
  location?: string;
  budget?: string;
  desired_budget?: string;
  work_type?: string;
  duration?: string;
  start_date?: string;
  application_deadline?: string;
  japanese_level?: string;
  processes: string[];
  interview_count: string;
  max_candidates: number;
  foreigner_accepted: boolean;
  freelancer_accepted: boolean;
  company_type: string;
  source: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

class ProjectService {
  
  // アクティブな案件を取得
  async getActiveProjects(tenantId: string): Promise<Project[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('案件リスト取得失敗:', error);
        throw new Error(`案件リスト取得失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('案件サービスエラー:', error);
      throw error;
    }
  }

  // IDから案件詳細を取得
  async getProjectById(projectId: string, tenantId: string): Promise<Project | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('案件詳細取得失敗:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('案件詳細取得エラー:', error);
      return null;
    }
  }

  // 条件による案件検索
  async searchProjects(searchParams: {
    tenantId: string;
    query?: string;
    companyType?: string;
    status?: string;
    skills?: string[];
  }): Promise<Project[]> {
    try {
      const client = businessClientManager.getClient();
      let query = client
        .from('projects')
        .select('*')
        .eq('tenant_id', searchParams.tenantId)
        .eq('is_active', true);

      // テキスト検索を追加
      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,client_company.ilike.%${searchParams.query}%`);
      }

      // 会社タイプフィルタを追加
      if (searchParams.companyType && searchParams.companyType !== 'all') {
        query = query.eq('company_type', searchParams.companyType);
      }

      // ステータスフィルタを追加
      if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('status', searchParams.status);
      }

      // スキルフィルタを追加
      if (searchParams.skills && searchParams.skills.length > 0) {
        query = query.overlaps('skills', searchParams.skills);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('案件検索失敗:', error);
        throw new Error(`案件検索失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('案件検索エラー:', error);
      throw error;
    }
  }

  // 会社リストを取得
  async getCompanyList(tenantId: string): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('client_company')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .not('client_company', 'is', null);

      if (error) {
        console.error('会社リスト取得失敗:', error);
        return [];
      }

      // 重複除去と空値フィルタ
      const companies = [...new Set(data.map(item => item.client_company).filter(Boolean))];
      return companies;
    } catch (error) {
      console.error('会社リスト取得エラー:', error);
      return [];
    }
  }
}

export const projectService = new ProjectService();