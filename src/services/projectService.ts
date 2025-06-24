// 项目数据服务
import { businessClientManager } from '@/integrations/supabase/business-client';

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
  
  // 获取所有活跃项目
  async getActiveProjects(): Promise<Project[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取项目列表失败:', error);
        throw new Error(`获取项目列表失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('项目服务错误:', error);
      throw error;
    }
  }

  // 根据ID获取项目详情
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('获取项目详情失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('获取项目详情错误:', error);
      return null;
    }
  }

  // 根据条件搜索项目
  async searchProjects(searchParams: {
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
        .eq('is_active', true);

      // 添加文本搜索
      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,client_company.ilike.%${searchParams.query}%`);
      }

      // 添加公司类型过滤
      if (searchParams.companyType && searchParams.companyType !== 'all') {
        query = query.eq('company_type', searchParams.companyType);
      }

      // 添加状态过滤
      if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('status', searchParams.status);
      }

      // 添加技能过滤
      if (searchParams.skills && searchParams.skills.length > 0) {
        query = query.overlaps('skills', searchParams.skills);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('搜索项目失败:', error);
        throw new Error(`搜索项目失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('项目搜索错误:', error);
      throw error;
    }
  }

  // 获取公司列表
  async getCompanyList(): Promise<string[]> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('projects')
        .select('client_company')
        .eq('is_active', true)
        .not('client_company', 'is', null);

      if (error) {
        console.error('获取公司列表失败:', error);
        return [];
      }

      // 去重并过滤空值
      const companies = [...new Set(data.map(item => item.client_company).filter(Boolean))];
      return companies;
    } catch (error) {
      console.error('获取公司列表错误:', error);
      return [];
    }
  }
}

export const projectService = new ProjectService();