// マッチング履歴データサービス
import { businessClientManager } from '@/integrations/supabase/business-client';
import { projectService, Project } from '@/services/projectService';
import { engineerService, Engineer } from '@/services/engineerService';

export interface SavedMatchingHistory {
  id: string;
  project_id: string;
  engineer_id: string;
  tenant_id: string;
  matching_history_id?: string;
  match_score: number;
  confidence_score?: number;
  skill_match_score?: number;
  project_experience_match_score?: number;
  experience_match_score?: number;
  japanese_level_match_score?: number;
  budget_match_score?: number;
  location_match_score?: number;
  matched_skills: string[];
  missing_skills: string[];
  project_experience_match: string[];
  missing_project_experience: string[];
  matched_experiences: string[];
  missing_experiences: string[];
  match_reasons: string[];
  concerns: string[];
  comment?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  saved_at?: string;
  ai_match_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // 詳細データ
  projectDetail?: Project;
  engineerDetail?: Engineer;
}

class MatchingHistoryService {
  
  // 保存済みマッチング履歴を取得
  async getSavedMatchingHistory(tenantId: string): Promise<SavedMatchingHistory[]> {
    try {
      console.log('getSavedMatchingHistory開始 - テナントID:', tenantId);
      const client = businessClientManager.getClient();
      
      // まずすべてのレコードを確認
      const { data: allData, error: allError } = await client
        .from('project_engineer_matches')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);
      
      console.log('全レコード数:', allData?.length);
      console.log('全レコードの詳細:', allData);
      console.log('全レコードのステータス:', allData?.map(record => `ID: ${record.id}, Status: "${record.status}", SavedAt: ${record.saved_at}`));
      
      // 保存済みレコードを取得（ソート条件を簡略化）
      const { data, error } = await client
        .from('project_engineer_matches')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', '保存済み')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      console.log('保存済みレコード数:', data?.length);
      console.log('Supabaseクエリ結果:', { data, error });

      if (error) {
        console.error('マッチング履歴取得失敗:', error);
        throw new Error(`マッチング履歴取得失敗: ${error.message}`);
      }

      // データが空の場合の詳細チェック
      if (!data || data.length === 0) {
        console.warn('保存済みレコードが見つかりません');
        console.log('検索条件:', {
          tenant_id: tenantId,
          status: '保存済み',
          is_active: true
        });
        
        // 異なるステータス値で試行
        const { data: alternativeData } = await client
          .from('project_engineer_matches')
          .select('*')
          .eq('tenant_id', tenantId)
          .in('status', ['保存済み', '保存済', 'saved', 'SAVED'])
          .eq('is_active', true);
        
        console.log('代替ステータス検索結果:', alternativeData);
      }

      // 並行してプロジェクトとエンジニアの詳細データを取得
      const enrichedHistory = await Promise.all(
        (data || []).map(async (match) => {
          const [projectDetail, engineerDetail] = await Promise.all([
            match.project_id ? projectService.getProjectById(match.project_id, tenantId) : null,
            match.engineer_id ? engineerService.getEngineerById(match.engineer_id, tenantId) : null
          ]);

          return {
            ...match,
            projectDetail,
            engineerDetail
          };
        })
      );

      return enrichedHistory;
    } catch (error) {
      console.error('マッチング履歴サービスエラー:', error);
      throw error;
    }
  }

  // 特定のマッチング履歴詳細を取得
  async getMatchingHistoryById(matchId: string, tenantId: string): Promise<SavedMatchingHistory | null> {
    try {
      const client = businessClientManager.getClient();
      const { data, error } = await client
        .from('project_engineer_matches')
        .select('*')
        .eq('id', matchId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('マッチング履歴詳細取得失敗:', error);
        return null;
      }

      // プロジェクトとエンジニアの詳細データを並行取得
      const [projectDetail, engineerDetail] = await Promise.all([
        data.project_id ? projectService.getProjectById(data.project_id, tenantId) : null,
        data.engineer_id ? engineerService.getEngineerById(data.engineer_id, tenantId) : null
      ]);

      return {
        ...data,
        projectDetail,
        engineerDetail
      };
    } catch (error) {
      console.error('マッチング履歴詳細取得エラー:', error);
      return null;
    }
  }

  // マッチング履歴を削除（is_activeをfalseに変更）
  async deleteMatchingHistory(matchId: string, tenantId: string): Promise<void> {
    try {
      console.log('マッチング履歴削除開始 - ID:', matchId, 'テナントID:', tenantId);
      const client = businessClientManager.getClient();
      
      const { data, error } = await client
        .from('project_engineer_matches')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('tenant_id', tenantId)
        .select();

      console.log('削除結果:', { data, error });

      if (error) {
        console.error('マッチング履歴削除失敗:', error);
        throw new Error(`マッチング履歴削除失敗: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('削除対象のレコードが見つかりませんでした');
      }

      console.log('マッチング履歴削除成功');
    } catch (error) {
      console.error('マッチング履歴削除エラー:', error);
      throw error;
    }
  }
}

export const matchingHistoryService = new MatchingHistoryService();