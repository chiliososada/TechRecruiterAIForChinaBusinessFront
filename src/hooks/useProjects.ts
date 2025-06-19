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
  source?: string;
  source_document_url?: string;
  ai_processed?: boolean;
  ai_extracted_project_data?: any;
  ai_match_embedding?: string;
  ai_match_paraphrase?: string;
  primary_manager_id?: string;
  received_date?: string;
  registered_at?: string;
  application_deadline?: string;
  key_technologies?: string;
  max_candidates?: number;
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

      // 認証エラーの場合は具体的なメッセージを表示
      if (error instanceof Error && error.message.includes('認証')) {
        toast({
          title: "認証エラー",
          description: "セッションが期限切れです。再ログインしてください",
          variant: "destructive",
        });
      } else {
        toast({
          title: "エラー",
          description: "案件の取得に失敗しました",
          variant: "destructive",
        });
      }

      // 認証エラーの場合は空配列を設定
      setProjects([]);
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      console.log("案件が作成されました:", result.id);

      toast({
        title: "成功",
        description: "案件が正常に作成されました",
      });

      // リストを更新
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
  const updateProject = async (projectId: string, updateData: Partial<Project>) => {
    if (!currentTenant?.id) {
      toast({
        title: "エラー",
        description: "認証情報が不足しています",
        variant: "destructive",
      });
      return false;
    }

    if (!businessClientManager.isAuthenticated()) {
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('projects')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .eq('tenant_id', currentTenant.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      console.log("案件が更新されました:", result.id);

      toast({
        title: "成功",
        description: "案件が正常に更新されました",
      });

      // リストを更新
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('案件更新エラー:', error);
      toast({
        title: "エラー",
        description: "案件の更新に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // 案件の削除（論理削除）
  const deleteProject = async (projectId: string) => {
    if (!currentTenant?.id) {
      toast({
        title: "エラー",
        description: "認証情報が不足しています",
        variant: "destructive",
      });
      return false;
    }

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
          .eq('id', projectId)
          .eq('tenant_id', currentTenant.id);

        if (error) throw error;
      });

      console.log("案件が削除されました:", projectId);

      toast({
        title: "成功",
        description: "案件が正常に削除されました",
      });

      // リストを更新
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

  // 案件のアーカイブ
  const archiveProject = async (projectId: string, archiveReason?: string) => {
    if (!currentTenant?.id || !user?.id) {
      toast({
        title: "エラー",
        description: "認証情報が不足しています",
        variant: "destructive",
      });
      return false;
    }

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

        // まず案件データを取得
        const { data: projectData, error: fetchError } = await client
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (fetchError) throw fetchError;

        // アーカイブテーブルに保存
        const { error: archiveError } = await client
          .from('project_archives')
          .insert({
            original_project_id: projectId,
            project_data: projectData,
            archive_reason: archiveReason,
            archived_by: user.id,
            archived_at: new Date().toISOString(),
            tenant_id: currentTenant.id,
          });

        if (archiveError) throw archiveError;

        // 元の案件を無効化
        const { error: updateError } = await client
          .from('projects')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)
          .eq('tenant_id', currentTenant.id);

        if (updateError) throw updateError;
      });

      console.log("案件がアーカイブされました:", projectId);

      toast({
        title: "成功",
        description: "案件が正常にアーカイブされました",
      });

      // リストを更新
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('案件アーカイブエラー:', error);
      toast({
        title: "エラー",
        description: "案件のアーカイブに失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // 初期化時に案件を取得
  useEffect(() => {
    if (currentTenant?.id && businessClientManager.isAuthenticated()) {
      fetchProjects();
    }
  }, [currentTenant?.id, businessClientManager.isAuthenticated()]);

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  };
};