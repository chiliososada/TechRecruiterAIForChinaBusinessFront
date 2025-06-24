// 工程师数据服务
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
  
  // 获取所有活跃工程师
  async getActiveEngineers(): Promise<Engineer[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取工程师列表失败:', error);
        throw new Error(`获取工程师列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('工程师服务错误:', error);
      throw error;
    }
  }

  // 根据ID获取工程师详情
  async getEngineerById(engineerId: string): Promise<Engineer | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('*')
        .eq('id', engineerId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('获取工程师详情失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('获取工程师详情错误:', error);
      return null;
    }
  }

  // 根据条件搜索工程师
  async searchEngineers(searchParams: {
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
        .eq('is_active', true);

      // 添加文本搜索
      if (searchParams.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,email.ilike.%${searchParams.query}%,company_name.ilike.%${searchParams.query}%`);
      }

      // 添加公司类型过滤
      if (searchParams.companyType && searchParams.companyType !== 'all') {
        query = query.eq('company_type', searchParams.companyType);
      }

      // 添加状态过滤
      if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('current_status', searchParams.status);
      }

      // 添加技能过滤
      if (searchParams.skills && searchParams.skills.length > 0) {
        query = query.overlaps('skills', searchParams.skills);
      }

      // 添加日语水平过滤
      if (searchParams.japaneseLevel && searchParams.japaneseLevel !== 'all') {
        query = query.eq('japanese_level', searchParams.japaneseLevel);
      }

      // 添加国籍过滤
      if (searchParams.nationality && searchParams.nationality !== 'all') {
        query = query.eq('nationality', searchParams.nationality);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('搜索工程师失败:', error);
        throw new Error(`搜索工程师失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('工程师搜索错误:', error);
      throw error;
    }
  }

  // 获取技能列表
  async getSkillsList(): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('skills')
        .eq('is_active', true)
        .not('skills', 'is', null);

      if (error) {
        console.error('获取技能列表失败:', error);
        return [];
      }

      // 展开所有技能数组并去重
      const allSkills = data.flatMap(item => item.skills || []);
      const uniqueSkills = [...new Set(allSkills)].filter(Boolean);
      return uniqueSkills.sort();
    } catch (error) {
      console.error('获取技能列表错误:', error);
      return [];
    }
  }

  // 获取国籍列表
  async getNationalityList(): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('engineers')
        .select('nationality')
        .eq('is_active', true)
        .not('nationality', 'is', null);

      if (error) {
        console.error('获取国籍列表失败:', error);
        return [];
      }

      // 去重并过滤空值
      const nationalities = [...new Set(data.map(item => item.nationality).filter(Boolean))];
      return nationalities.sort();
    } catch (error) {
      console.error('获取国籍列表错误:', error);
      return [];
    }
  }
}

export const engineerService = new EngineerService();