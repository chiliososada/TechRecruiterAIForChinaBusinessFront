import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { businessClientManager } from '@/integrations/supabase/business-client';

export interface Project {
  id: string;
  title: string;
  client_company?: string;
  partner_company?: string;
  manager_name?: string;
  manager_email?: string;
  skills: string[];
  experience?: string;
  location?: string;
  budget?: string;
  desired_budget?: string;
  work_type?: string;
  duration?: string;
  start_date?: string;
  japanese_level?: string;
  status?: string;
  priority?: string;
  foreigner_accepted?: boolean;
  freelancer_accepted?: boolean;
  processes: string[];
  interview_count?: string;
  description?: string;
  detail_description?: string;
  company_type: string;
  is_active?: boolean;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentTenant, user } = useAuth();

  // 案件の取得（JWT認証対応）
  const fetchProjects = async () => {
    if (!currentTenant?.id) {
      console.log("現在のテナントが存在しません、取得をスキップします");
      return;
    }

    // ビジネスクライアントが認証されているかチェック
    if (!businessClientManager.isAuthenticated()) {
      console.log("ビジネスクライアントが認証されていません");
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return;
    }

    console.log("テナント用の案件を取得中:", currentTenant.id);
    setLoading(true);

    try {
      // 自動リフレッシュ付きでクエリを実行
      const data = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('projects')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      });

      console.log("データベースから取得した案件:", data?.length || 0, "件");
      setProjects(data || []);
    } catch (error) {
      console.error('案件取得エラー:', error);
      toast({
        title: "エラー",
        description: "案件の取得に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 案件の作成
  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentTenant?.id || !user?.id) {
      toast({
        title: "エラー",
        description: "認証情報が不足しています",
        variant: "destructive",
      });
      return null;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return null;
    }

    try {
      const result = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('projects')
          .insert({
            ...projectData,
            tenant_id: currentTenant.id,
            created_by: user.id,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      toast({
        title: "成功",
        description: "案件を作成しました",
      });

      // プロジェクトリストを再取得
      await fetchProjects();
      return result;
    } catch (error) {
      console.error('案件作成エラー:', error);
      toast({
        title: "エラー",
        description: "案件の作成に失敗しました",
        variant: "destructive",
      });
      return null;
    }
  };

  // 案件の更新
  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!businessClientManager.isAuthenticated()) {
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return null;
    }

    try {
      const result = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('tenant_id', currentTenant?.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      toast({
        title: "成功",
        description: "案件を更新しました",
      });

      // プロジェクトリストを再取得
      await fetchProjects();
      return result;
    } catch (error) {
      console.error('案件更新エラー:', error);
      toast({
        title: "エラー",
        description: "案件の更新に失敗しました",
        variant: "destructive",
      });
      return null;
    }
  };

  // 案件の削除（論理削除）
  const deleteProject = async (id: string) => {
    if (!businessClientManager.isAuthenticated()) {
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return false;
    }

    try {
      await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { error } = await client
          .from('projects')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('tenant_id', currentTenant?.id);

        if (error) throw error;
      });

      toast({
        title: "成功",
        description: "案件を削除しました",
      });

      // プロジェクトリストを再取得
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('案件削除エラー:', error);
      toast({
        title: "エラー",
        description: "案件の削除に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // テナントまたは認証状態が変更された時に案件を取得
  useEffect(() => {
    if (currentTenant?.id && businessClientManager.isAuthenticated()) {
      fetchProjects();
    }
  }, [currentTenant?.id]);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};