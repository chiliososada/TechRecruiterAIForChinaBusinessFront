import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { businessClientManager } from '@/integrations/supabase/business-client';

export interface ProjectArchive {
  id: string;
  original_project_id: string;
  project_data: any;
  archive_reason?: string;
  archived_by?: string;
  archived_at: string;
  tenant_id: string;
}

export const useProjectArchives = () => {
  const [archives, setArchives] = useState<ProjectArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentTenant, user } = useAuth();

  // アーカイブの取得（実際のproject_archivesテーブルから）
  const fetchArchives = async () => {
    if (!currentTenant?.id) {
      console.log("現在のテナントが存在しません、アーカイブ取得をスキップします");
      return;
    }

    if (!businessClientManager.isAuthenticated()) {
      console.log("ビジネスクライアントが認証されていません");
      toast({
        title: "認証エラー",
        description: "ログインし直してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== DEBUG: Fetching archived projects ===');
      console.log('Tenant ID:', currentTenant.id);

      // 実際のproject_archivesテーブルからアーカイブを取得
      const data = await businessClientManager.executeWithRetry(async () => {
        const client = businessClientManager.getClient();
        const { data, error } = await client
          .from('project_archives')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('archived_at', { ascending: false });

        if (error) throw error;
        return data;
      });

      console.log('Total archived projects:', data?.length || 0);
      setArchives(data || []);
    } catch (error) {
      console.error('アーカイブ取得エラー:', error);

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
          description: "アーカイブの取得に失敗しました",
          variant: "destructive",
        });
      }

      setArchives([]);
    } finally {
      setLoading(false);
    }
  };

  // アーカイブからプロジェクトを復元
  const restoreProject = async (archiveId: string) => {
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

        // アーカイブされたプロジェクトデータを取得
        const { data: archiveData, error: fetchError } = await client
          .from('project_archives')
          .select('*')
          .eq('id', archiveId)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (fetchError) throw fetchError;

        // プロジェクトを復元（is_activeをtrueに設定）
        const { error: restoreError } = await client
          .from('projects')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', archiveData.original_project_id)
          .eq('tenant_id', currentTenant.id);

        if (restoreError) throw restoreError;

        // アーカイブから削除
        const { error: deleteError } = await client
          .from('project_archives')
          .delete()
          .eq('id', archiveId)
          .eq('tenant_id', currentTenant.id);

        if (deleteError) throw deleteError;
      });

      toast({
        title: "成功",
        description: "案件が正常に復元されました",
      });

      await fetchArchives(); // リストを更新
      return true;
    } catch (error) {
      console.error('プロジェクト復元エラー:', error);
      toast({
        title: "エラー",
        description: "案件の復元に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // アーカイブを永久削除
  const deleteArchive = async (archiveId: string) => {
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

        // まずアーカイブデータを取得して関連プロジェクトも削除
        const { data: archiveData, error: fetchError } = await client
          .from('project_archives')
          .select('*')
          .eq('id', archiveId)
          .eq('tenant_id', currentTenant.id)
          .single();

        if (fetchError) throw fetchError;

        // 関連するプロジェクトを完全削除
        const { error: deleteProjectError } = await client
          .from('projects')
          .delete()
          .eq('id', archiveData.original_project_id)
          .eq('tenant_id', currentTenant.id);

        if (deleteProjectError) {
          console.warn('プロジェクトの削除に失敗（既に削除済みの可能性）:', deleteProjectError);
        }

        // アーカイブを削除
        const { error: deleteArchiveError } = await client
          .from('project_archives')
          .delete()
          .eq('id', archiveId)
          .eq('tenant_id', currentTenant.id);

        if (deleteArchiveError) throw deleteArchiveError;
      });

      toast({
        title: "成功",
        description: "アーカイブが正常に削除されました",
      });

      await fetchArchives(); // リストを更新
      return true;
    } catch (error) {
      console.error('アーカイブ削除エラー:', error);
      toast({
        title: "エラー",
        description: "アーカイブの削除に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // 複数のアーカイブを一括削除
  const deleteBatchArchives = async (archiveIds: string[]) => {
    if (!currentTenant?.id || archiveIds.length === 0) {
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

        for (const archiveId of archiveIds) {
          // 各アーカイブデータを取得
          const { data: archiveData, error: fetchError } = await client
            .from('project_archives')
            .select('*')
            .eq('id', archiveId)
            .eq('tenant_id', currentTenant.id)
            .single();

          if (fetchError) {
            console.warn(`アーカイブ ${archiveId} の取得に失敗:`, fetchError);
            continue;
          }

          // 関連するプロジェクトを削除
          const { error: deleteProjectError } = await client
            .from('projects')
            .delete()
            .eq('id', archiveData.original_project_id)
            .eq('tenant_id', currentTenant.id);

          if (deleteProjectError) {
            console.warn(`プロジェクト ${archiveData.original_project_id} の削除に失敗:`, deleteProjectError);
          }
        }

        // アーカイブを一括削除
        const { error: deleteArchivesError } = await client
          .from('project_archives')
          .delete()
          .in('id', archiveIds)
          .eq('tenant_id', currentTenant.id);

        if (deleteArchivesError) throw deleteArchivesError;
      });

      toast({
        title: "成功",
        description: `${archiveIds.length}件のアーカイブが正常に削除されました`,
      });

      await fetchArchives(); // リストを更新
      return true;
    } catch (error) {
      console.error('一括アーカイブ削除エラー:', error);
      toast({
        title: "エラー",
        description: "アーカイブの一括削除に失敗しました",
        variant: "destructive",
      });
      return false;
    }
  };

  // 初期化時にアーカイブを取得
  useEffect(() => {
    if (currentTenant?.id && businessClientManager.isAuthenticated()) {
      fetchArchives();
    }
  }, [currentTenant?.id, businessClientManager.isAuthenticated()]);

  return {
    archives,
    loading,
    fetchArchives,
    restoreProject,
    deleteArchive,
    deleteBatchArchives,
  };
};