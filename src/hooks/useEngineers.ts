import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { businessClientManager } from '@/integrations/supabase/business-client';

export interface DatabaseEngineer {
  id: string;
  name: string;
  skills: string[] | null;
  japanese_level: string | null;
  english_level: string | null;
  experience: string;
  availability: string | null;
  current_status: string | null;
  remarks: string | null;
  company_type: string;
  company_name: string | null;
  source: string | null;
  technical_keywords: string[] | null;
  self_promotion: string | null;
  work_scope: string | null;
  work_experience: string | null;
  nationality: string | null;
  age: string | null;
  gender: string | null;
  nearest_station: string | null;
  education: string | null;
  arrival_year_japan: string | null;
  certifications: string[] | null;
  email: string | null;
  phone: string | null;
  manager_name: string | null;
  manager_email: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  is_active: boolean | null;
  deleted_at: string | null;
  // 其他可能的字段
  source_details: string | null;
  skills_detail: any | null;
  project_history: any | null;
  desired_rate_min: number | null;
  desired_rate_max: number | null;
  overtime_available: boolean | null;
  business_trip_available: boolean | null;
  documents: any | null;
  ai_extracted_data: any | null;
  ai_match_embedding: string | null;
  ai_match_paraphrase: string | null;
  evaluations: any | null;
  last_active_at: string | null;
  profile_completion_rate: number | null;
  created_by: string | null;
  resume_url: string | null;
  resume_text: string | null;
  preferred_work_style: string[] | null;
  preferred_locations: string[] | null;
  recommendation: string | null;
}

export const useEngineers = (companyType: 'own' | 'other') => {
  const [engineers, setEngineers] = useState<DatabaseEngineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAuth();

  const companyTypeMapping = {
    'own': '自社',
    'other': '他社'
  };

  // Helper function to ensure array format
  const ensureArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // 获取engineers数据 - 只获取 is_active = true 的记录
  const fetchEngineers = async () => {
    if (!currentTenant) {
      console.log('現在のテナントが存在しません、エンジニア取得をスキップします');
      setLoading(false);
      return;
    }

    if (!businessClientManager.isAuthenticated()) {
      console.log('ビジネスクライアントが認証されていません');
      toast.error('認証エラー: ログインし直してください');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching engineers for tenant:', currentTenant.id, 'companyType:', companyTypeMapping[companyType]);

      const data = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('engineers')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .eq('company_type', companyTypeMapping[companyType])
          .eq('is_active', true) // 只获取活跃的记录
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      });

      console.log('Successfully fetched engineers:', data?.length || 0);
      setEngineers((data as DatabaseEngineer[]) || []);
    } catch (error: any) {
      console.error('Error fetching engineers:', error);
      const errorMessage = error.message || 'データの取得に失敗しました';
      setError(errorMessage);

      // 認証エラーの場合は具体的なメッセージを表示
      if (error.message && error.message.includes('認証')) {
        toast.error('認証エラー: セッションが期限切れです。再ログインしてください');
      } else {
        toast.error('人材データの取得に失敗しました: ' + errorMessage);
      }

      setEngineers([]);
    } finally {
      setLoading(false);
    }
  };

  // 新增engineer
  const createEngineer = async (engineerData: any) => {
    if (!currentTenant) {
      toast.error('テナント情報が見つかりません');
      return null;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast.error('認証エラー: ログインし直してください');
      return null;
    }

    try {
      console.log('Creating engineer with data:', engineerData);
      console.log('Manager fields in createEngineer:', {
        manager_name: engineerData.manager_name,
        manager_email: engineerData.manager_email
      });


      // 使用已经转换好的数据，只添加必要的系统字段
      const newEngineer = {
        ...engineerData, // 使用已经转换的数据
        company_type: companyTypeMapping[companyType],
        source: 'manual',
        tenant_id: currentTenant.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Processed engineer data for insert:', newEngineer);
      console.log('Final manager fields before DB insert:', {
        manager_name: newEngineer.manager_name,
        manager_email: newEngineer.manager_email
      });

      const result = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('engineers')
          .insert([newEngineer])
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      console.log('Successfully created engineer:', result);
      await fetchEngineers(); // 重新获取数据
      toast.success('技術者情報を登録しました');
      return result;
    } catch (error: any) {
      console.error('Error creating engineer:', error);
      toast.error('技術者情報の登録に失敗しました: ' + error.message);
      return null;
    }
  };

  // 更新engineer
  const updateEngineer = async (id: string, engineerData: any) => {
    if (!currentTenant) {
      toast.error('テナント情報が見つかりません');
      return false;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast.error('認証エラー: ログインし直してください');
      return false;
    }

    try {
      console.log('=== useEngineers.updateEngineer START ===');
      console.log('Engineer ID:', id);
      console.log('Input engineerData:', engineerData);
      console.log('engineerData.nearest_station:', engineerData.nearest_station);

      // 处理状态值 - 确保使用正确的数据库状态值
      let dbStatus = '提案中'; // 默认状态
      if (engineerData.current_status) {
        dbStatus = engineerData.current_status;
      } else if (engineerData.status) {
        if (Array.isArray(engineerData.status) && engineerData.status.length > 0) {
          dbStatus = engineerData.status[0];
        } else if (typeof engineerData.status === 'string') {
          dbStatus = engineerData.status;
        }
      }

      // 确保状态值符合数据库约束
      const validStatuses = ['提案中', '事前面談', '面談', '結果待ち', '契約中', '営業終了', 'アーカイブ'];
      if (!validStatuses.includes(dbStatus)) {
        dbStatus = '提案中';
      }

      // 准备更新数据，确保所有空字符串转为 null
      const updatedEngineer = {
        name: engineerData.name,
        skills: ensureArray(engineerData.skills),
        japanese_level: engineerData.japanese_level === '' ? null : engineerData.japanese_level,
        english_level: engineerData.english_level === '' ? null : engineerData.english_level,
        experience: engineerData.experience,
        availability: engineerData.availability === '' ? null : engineerData.availability,
        current_status: dbStatus,
        remarks: engineerData.remarks === '' ? null : engineerData.remarks,
        company_name: engineerData.company_name === '' ? null : engineerData.company_name,
        technical_keywords: ensureArray(engineerData.technical_keywords),
        self_promotion: engineerData.self_promotion === '' ? null : engineerData.self_promotion,
        work_scope: engineerData.work_scope === '' ? null : engineerData.work_scope,
        work_experience: engineerData.work_experience === '' ? null : engineerData.work_experience,
        nationality: engineerData.nationality === '' ? null : engineerData.nationality,
        age: engineerData.age === '' ? null : engineerData.age,
        gender: engineerData.gender === '' ? null : engineerData.gender,
        nearest_station: engineerData.nearest_station === '' ? null : engineerData.nearest_station,
        education: engineerData.education === '' ? null : engineerData.education,
        arrival_year_japan: engineerData.arrival_year_japan === '' ? null : engineerData.arrival_year_japan,
        certifications: ensureArray(engineerData.certifications),
        email: engineerData.email === '' ? null : engineerData.email,
        phone: engineerData.phone === '' ? null : engineerData.phone,
        manager_name: engineerData.manager_name === '' ? null : engineerData.manager_name,
        manager_email: engineerData.manager_email === '' ? null : engineerData.manager_email,
        recommendation: engineerData.recommendation === '' ? null : engineerData.recommendation,
        updated_at: new Date().toISOString()
      };

      console.log('=== Final data being sent to database ===');
      console.log('updatedEngineer.nearest_station:', updatedEngineer.nearest_station);
      console.log('Processed engineer data for update:', updatedEngineer);

      await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        console.log('=== About to execute database update ===');
        console.log('Updating engineer ID:', id);
        console.log('Tenant ID:', currentTenant.id);
        
        const { data, error } = await client
          .from('engineers')
          .update(updatedEngineer)
          .eq('id', id)
          .eq('tenant_id', currentTenant.id)
          .select(); // Add select to see what was actually updated

        console.log('=== Database update result ===');
        console.log('Updated data:', data);
        console.log('Error:', error);
        
        if (error) throw error;
      });

      console.log('Successfully updated engineer');
      await fetchEngineers(); // 重新获取数据
      toast.success('技術者情報を更新しました');
      return true;
    } catch (error: any) {
      console.error('Error updating engineer:', error);
      toast.error('技術者情報の更新に失敗しました: ' + error.message);
      return false;
    }
  };

  // 软删除engineer - 设置 is_active = false
  const deleteEngineer = async (id: string) => {
    if (!currentTenant) {
      toast.error('テナント情報が見つかりません');
      return false;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast.error('認証エラー: ログインし直してください');
      return false;
    }

    try {
      console.log('Soft deleting engineer with id:', id);

      await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { error } = await client
          .from('engineers')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('tenant_id', currentTenant.id);

        if (error) throw error;
      });

      console.log('Successfully soft deleted engineer');
      await fetchEngineers(); // 重新获取数据
      toast.success('技術者を削除しました');
      return true;
    } catch (error: any) {
      console.error('Error deleting engineer:', error);
      toast.error('技術者の削除に失敗しました');
      return false;
    }
  };

  // 永久删除engineer
  const permanentlyDeleteEngineer = async (id: string) => {
    if (!currentTenant) {
      toast.error('テナント情報が見つかりません');
      return false;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast.error('認証エラー: ログインし直してください');
      return false;
    }

    try {
      console.log('Permanently deleting engineer with id:', id);

      await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { error } = await client
          .from('engineers')
          .delete()
          .eq('id', id)
          .eq('tenant_id', currentTenant.id);

        if (error) throw error;
      });

      console.log('Successfully permanently deleted engineer');
      await fetchEngineers(); // 重新获取数据
      toast.success('技術者を完全に削除しました');
      return true;
    } catch (error: any) {
      console.error('Error permanently deleting engineer:', error);
      toast.error('技術者の完全削除に失敗しました');
      return false;
    }
  };

  // 批量操作
  const batchUpdateEngineers = async (engineerIds: string[], updateData: Partial<DatabaseEngineer>) => {
    if (!currentTenant || engineerIds.length === 0) {
      return false;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast.error('認証エラー: ログインし直してください');
      return false;
    }

    try {
      await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { error } = await client
          .from('engineers')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .in('id', engineerIds)
          .eq('tenant_id', currentTenant.id);

        if (error) throw error;
      });

      await fetchEngineers(); // 重新获取数据
      toast.success(`${engineerIds.length}件の技術者情報を更新しました`);
      return true;
    } catch (error: any) {
      console.error('Error batch updating engineers:', error);
      toast.error('技術者情報の一括更新に失敗しました');
      return false;
    }
  };

  // 初始化时获取数据
  useEffect(() => {
    console.log('useEngineers effect triggered - currentTenant:', currentTenant?.id, 'companyType:', companyType);
    if (currentTenant && businessClientManager.isAuthenticated()) {
      fetchEngineers();
    }
  }, [currentTenant, companyType, businessClientManager.isAuthenticated()]);

  return {
    engineers,
    loading,
    error,
    createEngineer,
    updateEngineer,
    deleteEngineer,
    permanentlyDeleteEngineer,
    batchUpdateEngineers,
    refetch: fetchEngineers
  };
};