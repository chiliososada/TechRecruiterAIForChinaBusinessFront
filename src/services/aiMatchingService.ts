// AI Matching API Service
// APIとの通信を管理するサービス関数

import { useAuth } from '@/contexts/AuthContext';

// API レスポンスの型定義
export interface ProjectToEngineersRequest {
  tenant_id: string;
  project_id: string;
  max_matches?: number;
  min_score?: number;
  executed_by?: string;
  matching_type?: string;
  trigger_type?: string;
  weights?: {
    skill_match?: number;
    experience_match?: number;
    project_experience_match?: number;
    japanese_level_match?: number;
    location_match?: number;
  };
  filters?: {
    japanese_level?: string[];
    current_status?: string[];
    skills?: string[];
    min_experience?: number;
    max_expected_salary?: number;
  };
}

export interface EngineerToProjectsRequest {
  tenant_id: string;
  engineer_id: string;
  max_matches?: number;
  min_score?: number;
  executed_by?: string;
  matching_type?: string;
  trigger_type?: string;
  weights?: {
    skill_match?: number;
    experience_match?: number;
    budget_match?: number;
    location_match?: number;
  };
  filters?: {
    status?: string[];
    company_type?: string[];
    work_location?: string[];
    remote_option?: boolean;
    min_budget?: number;
    max_budget?: number;
  };
}

export interface MatchingHistory {
  id: string;
  tenant_id: string;
  executed_by?: string;
  matching_type: string;
  trigger_type: string;
  execution_status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  total_projects_input: number;
  total_engineers_input: number;
  total_matches_generated: number;
  high_quality_matches: number;
  processing_time_seconds?: number;
  project_ids: string[];
  engineer_ids: string[];
  ai_config: any;
  ai_model_version: string;
  statistics: any;
  filters: any;
  error_message?: string;
}

export interface ProjectInfo {
  id: string;
  title: string;
  company?: string;
  skills: string[];
  experience?: string;
  japanese_level?: string;
  status?: string;
  manager?: {
    name?: string;
    email?: string;
    primary_manager_id?: string;
  };
  created_by?: string;
}

export interface EngineerInfo {
  id: string;
  name: string;
  skills: string[];
  japanese_level: string;
  experience?: string;
  nationality?: string;
  current_status?: string;
  company_name?: string;
  company_type?: string;
  manager_name?: string;
  manager_email?: string;
}

export interface MatchedEngineer {
  id: string;
  project_id?: string;
  engineer_id?: string;
  match_score?: number;
  confidence_score?: number;
  skill_match_score?: number;
  experience_match_score?: number;
  project_experience_match_score?: number;
  japanese_level_match_score?: number;
  budget_match_score?: number;
  location_match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  matched_experiences?: string[];
  missing_experiences?: string[];
  project_experience_match?: string[];
  missing_project_experience?: string[];
  match_reasons?: string[];
  concerns?: string[];
  project_title?: string;
  engineer_name?: string;
  status?: string;
  created_at?: string;
  // 新增字段
  project_manager_name?: string;
  project_manager_email?: string;
  project_created_by?: string;
  engineer_company_name?: string;
  engineer_company_type?: string;
  engineer_manager_name?: string;
  engineer_manager_email?: string;
}

export interface MatchedProject {
  id: string;
  project_id?: string;
  engineer_id?: string;
  match_score?: number;
  confidence_score?: number;
  skill_match_score?: number;
  experience_match_score?: number;
  budget_match_score?: number;
  location_match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  match_reasons?: string[];
  concerns?: string[];
  project_title?: string;
  engineer_name?: string;
  status?: string;
  created_at?: string;
  // 新增字段
  project_manager_name?: string;
  project_manager_email?: string;
  project_created_by?: string;
  engineer_company_name?: string;
  engineer_company_type?: string;
  engineer_manager_name?: string;
  engineer_manager_email?: string;
}

export interface ProjectToEngineersResponse {
  matching_history: MatchingHistory;
  project_info: ProjectInfo;
  matches: MatchedEngineer[];
  matched_engineers: MatchedEngineer[];
  total_matches: number;
  high_quality_matches: number;
  processing_time_seconds: number;
  recommendations?: string[];
  warnings?: string[];
}

export interface EngineerToProjectsResponse {
  matching_history: MatchingHistory;
  engineer_info: EngineerInfo;
  matches: MatchedProject[];
  matched_projects: MatchedProject[];
  total_matches: number;
  high_quality_matches: number;
  processing_time_seconds: number;
  recommendations?: string[];
  warnings?: string[];
}

// API エラーの型定義
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// ApiErrorのタイプガード
export function isApiError(error: any): error is ApiError {
  return error && typeof error.message === 'string' && typeof error.status === 'number';
}

// ApiErrorクラス実装
export class ApiErrorImpl implements ApiError {
  constructor(
    public message: string,
    public status: number,
    public details?: any
  ) {}
}

class AIMatchingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
    console.log('AIMatchingService initialized with baseUrl:', this.baseUrl);
  }

  // 共通のHTTPリクエスト処理
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const apiKey = import.meta.env.VITE_BACKEND_API_KEY || 'sk_live_8f7a9b2c1d4e6f8a0b3c5d7e9f1a2b4c';
      const response = await fetch(`${this.baseUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'X-API-Key': apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiErrorImpl(
          errorData.message || `HTTPエラー: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }
      
      // ネットワークエラーなど
      throw new ApiErrorImpl(
        'ネットワークエラーが発生しました。接続を確認してください。',
        0,
        error
      );
    }
  }

  // 案件から人材を探すAPI
  async findEngineersForProject(
    request: ProjectToEngineersRequest
  ): Promise<ProjectToEngineersResponse> {
    // 实际的APIリクエスト形式に合わせて必要なフィールドのみを送信
    const apiRequest = {
      project_id: request.project_id,
      tenant_id: request.tenant_id,
      max_matches: request.max_matches || 10,
      min_score: request.min_score || 0.7,
      filters: request.filters || {}
    };

    return this.makeRequest<ProjectToEngineersResponse>(
      '/api/v1/ai-matching/project-to-engineers',
      {
        method: 'POST',
        body: JSON.stringify(apiRequest),
      }
    );
  }

  // 人材から案件を探すAPI
  async findProjectsForEngineer(
    request: EngineerToProjectsRequest
  ): Promise<EngineerToProjectsResponse> {
    // 实际的APIリクエスト形式に合わせて必要なフィールドのみを送信
    const apiRequest = {
      engineer_id: request.engineer_id,
      tenant_id: request.tenant_id,
      max_matches: request.max_matches || 10,
      min_score: request.min_score || 0.7,
      filters: request.filters || {}
    };

    return this.makeRequest<EngineerToProjectsResponse>(
      '/api/v1/ai-matching/engineer-to-projects',
      {
        method: 'POST',
        body: JSON.stringify(apiRequest),
      }
    );
  }

  // マッチング状態を更新
  async updateMatchStatus(
    tenantId: string,
    matchId: string,
    status: string,
    comment?: string,
    reviewedBy?: string
  ): Promise<{ status: string; message: string; match_id: string; new_status: string }> {
    const params = new URLSearchParams();
    params.append('status', status);
    if (comment) params.append('comment', comment);
    if (reviewedBy) params.append('reviewed_by', reviewedBy);

    return this.makeRequest(
      `/api/v1/ai-matching/matches/${tenantId}/${matchId}/status?${params.toString()}`,
      { method: 'PUT' }
    );
  }

  // マッチング履歴を取得
  async getMatchingHistory(
    tenantId: string,
    limit: number = 20,
    matchingType?: string
  ): Promise<MatchingHistory[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (matchingType) params.append('matching_type', matchingType);

    return this.makeRequest<MatchingHistory[]>(
      `/api/v1/ai-matching/history/${tenantId}?${params.toString()}`
    );
  }

  // 履歴IDからマッチング結果を取得
  async getMatchesByHistoryId(
    tenantId: string,
    historyId: string,
    limit: number = 100,
    minScore: number = 0
  ): Promise<(MatchedEngineer | MatchedProject)[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('min_score', minScore.toString());

    return this.makeRequest(
      `/api/v1/ai-matching/matches/${tenantId}/${historyId}?${params.toString()}`
    );
  }

  // 一括マッチングAPI
  async performBulkMatching(
    request: BulkMatchingRequest
  ): Promise<BulkMatchingResponse> {
    const apiRequest: any = {
      tenant_id: request.tenant_id,
      project_ids: request.project_ids,
      engineer_ids: request.engineer_ids,
      max_matches: request.max_matches || 100,
      min_score: request.min_score || 0.7,
      executed_by: request.executed_by,
      matching_type: request.matching_type || 'bulk_matching',
      trigger_type: request.trigger_type || 'api',
      batch_size: request.batch_size || 50
    };

    // 案件の所属が指定されている場合のみ追加
    if (request.project_company_type) {
      apiRequest.project_company_type = request.project_company_type;
    }

    // 技術者の所属が指定されている場合のみ追加
    if (request.engineer_company_type) {
      apiRequest.engineer_company_type = request.engineer_company_type;
    }

    // 案件開始時期が指定されている場合のみ追加
    if (request.project_start_date) {
      apiRequest.project_start_date = request.project_start_date;
    }

    return this.makeRequest<BulkMatchingResponse>(
      '/api/v1/ai-matching/bulk-matching',
      {
        method: 'POST',
        body: JSON.stringify(apiRequest),
      }
    );
  }
}

// 一括マッチング用の型定義
export interface BulkMatchingRequest {
  tenant_id: string;
  project_ids?: string[];
  engineer_ids?: string[];
  max_matches?: number;
  min_score?: number;
  executed_by?: string;
  matching_type?: string;
  trigger_type?: string;
  batch_size?: number;
  generate_top_matches_only?: boolean;
  engineer_company_type?: string;
  project_company_type?: string;
  project_start_date?: string;
  filters?: Record<string, any>;
}

export interface BulkMatchingResponse {
  matching_history: {
    id: string;
    tenant_id: string;
    executed_by?: string;
    matching_type: string;
    trigger_type: string;
    execution_status: string;
    started_at: string;
    completed_at?: string;
    total_projects_input: number;
    total_engineers_input: number;
    total_matches_generated: number;
    high_quality_matches: number;
    processing_time_seconds?: number;
    project_ids: string[];
    engineer_ids: string[];
    ai_config: Record<string, any>;
    ai_model_version: string;
    statistics: Record<string, any>;
    filters: Record<string, any>;
    error_message?: string;
  };
  matches: BulkMatchItem[];
  total_matches: number;
  high_quality_matches: number;
  processing_time_seconds: number;
  recommendations: string[];
  warnings: string[];
  batch_summary: {
    total_projects: number;
    total_engineers: number;
    processed_projects: number;
    average_match_score: number;
    algorithm: string;
  };
  top_matches_by_project: Record<string, BulkMatchItem[]>;
  top_matches_by_engineer: Record<string, BulkMatchItem[]>;
}

export interface BulkMatchItem {
  id: string;
  project_id: string;
  engineer_id: string;
  match_score: number;
  confidence_score: number;
  skill_match_score?: number;
  experience_match_score?: number;
  project_experience_match_score?: number;
  japanese_level_match_score?: number;
  budget_match_score?: number;
  location_match_score?: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_experiences: string[];
  missing_experiences: string[];
  project_experience_match: string[];
  missing_project_experience: string[];
  match_reasons: string[];
  concerns: string[];
  project_title: string;
  engineer_name: string;
  status: string;
  created_at: string;
  project_manager_name?: string;
  project_manager_email?: string;
  project_created_by?: string;
  engineer_company_name?: string;
  engineer_company_type?: string;
  engineer_manager_name?: string;
  engineer_manager_email?: string;
}

// シングルトンインスタンスをエクスポート
export const aiMatchingService = new AIMatchingService();

// カスタムフック: 案件から人材を探す
export const useProjectToEngineersMatching = () => {
  const { currentTenant, user } = useAuth();

  const findEngineersForProject = async (
    projectId: string,
    options?: Partial<ProjectToEngineersRequest>
  ) => {
    if (!currentTenant?.id) {
      throw new ApiErrorImpl('テナントIDが取得できません', 400);
    }

    const request: ProjectToEngineersRequest = {
      tenant_id: currentTenant.id,
      project_id: projectId,
      executed_by: user?.id,
      ...options,
    };

    return aiMatchingService.findEngineersForProject(request);
  };

  return { findEngineersForProject };
};

// カスタムフック: 人材から案件を探す
export const useEngineerToProjectsMatching = () => {
  const { currentTenant, user } = useAuth();

  const findProjectsForEngineer = async (
    engineerId: string,
    options?: Partial<EngineerToProjectsRequest>
  ) => {
    if (!currentTenant?.id) {
      throw new ApiErrorImpl('テナントIDが取得できません', 400);
    }

    const request: EngineerToProjectsRequest = {
      tenant_id: currentTenant.id,
      engineer_id: engineerId,
      executed_by: user?.id,
      ...options,
    };

    return aiMatchingService.findProjectsForEngineer(request);
  };

  return { findProjectsForEngineer };
};

// カスタムフック: 一括マッチング
export const useBulkMatching = () => {
  const { currentTenant, user } = useAuth();

  const performBulkMatching = async (
    options?: Partial<BulkMatchingRequest>
  ) => {
    if (!currentTenant?.id) {
      throw new ApiErrorImpl('テナントIDが取得できません', 400);
    }

    const request: BulkMatchingRequest = {
      tenant_id: currentTenant.id,
      executed_by: user?.id,
      ...options,
    };

    return aiMatchingService.performBulkMatching(request);
  };

  return { performBulkMatching };
};

// ユーティリティ関数
export const getMatchScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600 bg-green-50';
  if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export const getMatchScoreLabel = (score: number): string => {
  if (score >= 0.8) return '高品質マッチ';
  if (score >= 0.6) return '中程度マッチ';
  return '低品質マッチ';
};

export const formatMatchScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};