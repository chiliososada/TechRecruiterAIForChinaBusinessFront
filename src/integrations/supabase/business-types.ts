// 業務データベース用の型定義
// 既存のtypes.tsと同じ構造だが、業務専用データベース用
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            // 案件管理テーブル
            projects: {
                Row: {
                    id: string
                    title: string
                    client_company: string | null
                    partner_company: string | null
                    manager_name: string | null
                    manager_email: string | null
                    skills: string[]
                    experience: string | null
                    location: string | null
                    budget: string | null
                    desired_budget: string | null
                    work_type: string | null
                    duration: string | null
                    start_date: string | null
                    japanese_level: string | null
                    status: string | null
                    priority: string | null
                    foreigner_accepted: boolean | null
                    freelancer_accepted: boolean | null
                    processes: string[]
                    interview_count: string | null
                    description: string | null
                    detail_description: string | null
                    company_type: string
                    is_active: boolean | null
                    tenant_id: string
                    created_at: string | null
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    client_company?: string | null
                    partner_company?: string | null
                    manager_name?: string | null
                    manager_email?: string | null
                    skills: string[]
                    experience?: string | null
                    location?: string | null
                    budget?: string | null
                    desired_budget?: string | null
                    work_type?: string | null
                    duration?: string | null
                    start_date?: string | null
                    japanese_level?: string | null
                    status?: string | null
                    priority?: string | null
                    foreigner_accepted?: boolean | null
                    freelancer_accepted?: boolean | null
                    processes: string[]
                    interview_count?: string | null
                    description?: string | null
                    detail_description?: string | null
                    company_type: string
                    is_active?: boolean | null
                    tenant_id: string
                    created_at?: string | null
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    client_company?: string | null
                    partner_company?: string | null
                    manager_name?: string | null
                    manager_email?: string | null
                    skills?: string[]
                    experience?: string | null
                    location?: string | null
                    budget?: string | null
                    desired_budget?: string | null
                    work_type?: string | null
                    duration?: string | null
                    start_date?: string | null
                    japanese_level?: string | null
                    status?: string | null
                    priority?: string | null
                    foreigner_accepted?: boolean | null
                    freelancer_accepted?: boolean | null
                    processes?: string[]
                    interview_count?: string | null
                    description?: string | null
                    detail_description?: string | null
                    company_type?: string
                    is_active?: boolean | null
                    tenant_id?: string
                    created_at?: string | null
                    updated_at?: string | null
                    created_by?: string | null
                }
                Relationships: []
            }
            // エンジニア管理テーブル
            engineers: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    phone: string | null
                    skills: string[]
                    experience_years: number | null
                    japanese_level: string | null
                    location: string | null
                    availability: string | null
                    hourly_rate: string | null
                    work_type_preference: string | null
                    is_active: boolean | null
                    tenant_id: string
                    created_at: string | null
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    skills: string[]
                    experience_years?: number | null
                    japanese_level?: string | null
                    location?: string | null
                    availability?: string | null
                    hourly_rate?: string | null
                    work_type_preference?: string | null
                    is_active?: boolean | null
                    tenant_id: string
                    created_at?: string | null
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    skills?: string[]
                    experience_years?: number | null
                    japanese_level?: string | null
                    location?: string | null
                    availability?: string | null
                    hourly_rate?: string | null
                    work_type_preference?: string | null
                    is_active?: boolean | null
                    tenant_id?: string
                    created_at?: string | null
                    updated_at?: string | null
                    created_by?: string | null
                }
                Relationships: []
            }
            // その他必要なテーブル...
            ai_matching_results: {
                Row: {
                    id: string
                    project_id: string
                    engineer_id: string
                    match_score: number | null
                    match_reasons: Json | null
                    tenant_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    project_id: string
                    engineer_id: string
                    match_score?: number | null
                    match_reasons?: Json | null
                    tenant_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    project_id?: string
                    engineer_id?: string
                    match_score?: number | null
                    match_reasons?: Json | null
                    tenant_id?: string
                    created_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            tenant_type: "individual" | "enterprise" | "company"
            user_role: "owner" | "admin" | "member" | "viewer" | "test_user" | "developer" | "manager"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// 型ヘルパー
type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never