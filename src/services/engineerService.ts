// エンジニアデータサービス
import { businessClientManager } from '@/integrations/supabase/business-client';

export interface Engineer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: string;
  nationality?: string;
  nearest_station?: string;
  education?: string;
  arrival_year_japan?: string;
  certifications: string[];
  skills: string[];
  technical_keywords: string[];
  experience: string;
  work_scope?: string;
  work_experience?: string;
  japanese_level?: string;
  english_level?: string;
  availability?: string;
  current_status: string;
  company_type: string;
  company_name?: string;
  preferred_work_style: string[];
  preferred_locations: string[];
  self_promotion?: string;
  remarks?: string;
  recommendation?: string;
  resume_url?: string;
  resume_text?: string;
  source?: string;
  source_details?: string;
  skills_detail: any;
  project_history: any;
  desired_rate_min?: number;
  desired_rate_max?: number;
  overtime_available: boolean;
  business_trip_available: boolean;
  documents: any;
  ai_extracted_data: any;
  evaluations: any;
  last_active_at?: string;
  profile_completion_rate: number;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

class EngineerService {
  
  // アクティブなエンジニアを取得
  async getActiveEngineers(tenantId: string): Promise<Engineer[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('エンジニアリスト取得失敗:', error);
        throw new Error(`エンジニアリスト取得失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('エンジニアサービスエラー:', error);
      throw error;
    }
  }

  // IDからエンジニア詳細を取得
  async getEngineerById(engineerId: string, tenantId: string): Promise<Engineer | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('*')
        .eq('id', engineerId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('エンジニア詳細取得失敗:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('エンジニア詳細取得エラー:', error);
      return null;
    }
  }

  // 条件によるエンジニア検索
  async searchEngineers(searchParams: {
    tenantId: string;
    query?: string;
    companyType?: string;
    status?: string;
    skills?: string[];
    japaneseLevel?: string;
    nationality?: string;
  }): Promise<Engineer[]> {
    try {
      const client = businessClientManager.getClient();
      let query = client
        .from('engineers')
        .select('*')
        .eq('tenant_id', searchParams.tenantId)
        .eq('is_active', true);

      // テキスト検索を追加
      if (searchParams.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,email.ilike.%${searchParams.query}%,company_name.ilike.%${searchParams.query}%`);
      }

      // 会社タイプフィルタを追加
      if (searchParams.companyType && searchParams.companyType !== 'all') {
        query = query.eq('company_type', searchParams.companyType);
      }

      // ステータスフィルタを追加
      if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('current_status', searchParams.status);
      }

      // スキルフィルタを追加
      if (searchParams.skills && searchParams.skills.length > 0) {
        query = query.overlaps('skills', searchParams.skills);
      }

      // 日本語レベルフィルタを追加
      if (searchParams.japaneseLevel && searchParams.japaneseLevel !== 'all') {
        query = query.eq('japanese_level', searchParams.japaneseLevel);
      }

      // 国籍フィルタを追加
      if (searchParams.nationality && searchParams.nationality !== 'all') {
        query = query.eq('nationality', searchParams.nationality);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('エンジニア検索失敗:', error);
        throw new Error(`エンジニア検索失敗: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('エンジニア検索エラー:', error);
      throw error;
    }
  }

  // スキルリストを取得
  async getSkillsList(tenantId: string): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('skills')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .not('skills', 'is', null);

      if (error) {
        console.error('スキルリスト取得失敗:', error);
        return [];
      }

      // 全スキル配列を展開して重複除去
      const allSkills = data.flatMap(item => item.skills || []);
      const uniqueSkills = [...new Set(allSkills)].filter(Boolean);
      return uniqueSkills.sort();
    } catch (error) {
      console.error('スキルリスト取得エラー:', error);
      return [];
    }
  }

  // 国籍リストを取得
  async getNationalityList(tenantId: string): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('nationality')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .not('nationality', 'is', null);

      if (error) {
        console.error('国籍リスト取得失敗:', error);
        return [];
      }

      // 重複除去と空値フィルタ
      const nationalities = [...new Set(data.map(item => item.nationality).filter(Boolean))];
      return nationalities.sort();
    } catch (error) {
      console.error('国籍リスト取得エラー:', error);
      return [];
    }
  }
}

export const engineerService = new EngineerService();