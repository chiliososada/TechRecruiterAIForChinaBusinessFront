// 業務データベース用の型定義
// 既存のtypes.tsの構造を継承し、業務専用のテーブルに対応

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// 業務データベース専用の型定義
export interface ProjectRow {
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
    source: string | null
    source_document_url: string | null
    ai_processed: boolean | null
    ai_extracted_project_data: Json | null
    ai_match_embedding: string | null
    ai_match_paraphrase: string | null
    primary_manager_id: string | null
    received_date: string | null
    registered_at: string | null
    application_deadline: string | null
    key_technologies: string | null
    max_candidates: number | null
}

export interface ProjectInsert {
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
    source?: string | null
    source_document_url?: string | null
    ai_processed?: boolean | null
    ai_extracted_project_data?: Json | null
    ai_match_embedding?: string | null
    ai_match_paraphrase?: string | null
    primary_manager_id?: string | null
    received_date?: string | null
    registered_at?: string | null
    application_deadline?: string | null
    key_technologies?: string | null
    max_candidates?: number | null
}

export interface ProjectUpdate {
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
    source?: string | null
    source_document_url?: string | null
    ai_processed?: boolean | null
    ai_extracted_project_data?: Json | null
    ai_match_embedding?: string | null
    ai_match_paraphrase?: string | null
    primary_manager_id?: string | null
    received_date?: string | null
    registered_at?: string | null
    application_deadline?: string | null
    key_technologies?: string | null
    max_candidates?: number | null
}

export interface EngineerRow {
    id: string
    name: string
    email: string | null
    phone: string | null
    gender: string | null
    age: string | null
    nationality: string | null
    nearest_station: string | null
    education: string | null
    arrival_year_japan: string | null
    certifications: string[] | null
    skills: string[] | null
    technical_keywords: string[] | null
    experience: string
    work_scope: string | null
    work_experience: string | null
    japanese_level: string | null
    english_level: string | null
    availability: string | null
    current_status: string | null
    company_type: string
    company_name: string | null
    preferred_work_style: string[] | null
    preferred_locations: string[] | null
    self_promotion: string | null
    remarks: string | null
    recommendation: string | null
    resume_url: string | null
    resume_text: string | null
    source: string | null
    source_details: string | null
    skills_detail: Json | null
    project_history: Json | null
    desired_rate_min: number | null
    desired_rate_max: number | null
    overtime_available: boolean | null
    business_trip_available: boolean | null
    documents: Json | null
    ai_extracted_data: Json | null
    ai_match_embedding: string | null
    ai_match_paraphrase: string | null
    evaluations: Json | null
    last_active_at: string | null
    profile_completion_rate: number | null
    is_active: boolean | null
    tenant_id: string
    created_by: string | null
    created_at: string | null
    updated_at: string | null
    deleted_at: string | null
}

// 工程师插入和更新类型（简化版）
export interface EngineerInsert extends Partial<EngineerRow> {
    name: string
    experience: string
    company_type: string
    tenant_id: string
}

export interface EngineerUpdate extends Partial<EngineerRow> { }

// 其他业务相关的类型定义
export interface ProjectEngineerMatchRow {
    id: string
    project_id: string
    engineer_id: string
    tenant_id: string
    match_score: number | null
    skill_match_score: number | null
    experience_match_score: number | null
    japanese_level_match_score: number | null
    budget_match_score: number | null
    location_match_score: number | null
    matched_skills: string[] | null
    missing_skills: string[] | null
    matched_experiences: string[] | null
    missing_experiences: string[] | null
    match_reasons: string[] | null
    concerns: string[] | null
    comment: string | null
    status: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    ai_match_data: Json | null
    is_active: boolean | null
    created_at: string | null
    updated_at: string | null
    deleted_at: string | null
}

// 其他類型定義...
export type TenantType = "personal" | "enterprise"
export type UserRole = "owner" | "admin" | "member" | "viewer" | "test_user" | "developer" | "manager"