-- 1. 项目表
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client_company text,
  partner_company text,
  description text,
  detail_description text,
  status text DEFAULT '募集中'::text,
  priority text DEFAULT '中'::text,
  manager_name text,
  manager_email text,
  skills text[] DEFAULT '{}'::text[],
  experience text,
  key_technologies text,
  location text,
  budget text,
  desired_budget text,
  work_type text,
  duration text,
  start_date date,
  application_deadline date,
  japanese_level text,
  processes text[] DEFAULT '{}'::text[],
  interview_count text DEFAULT '1'::text,
  max_candidates integer DEFAULT 5,
  foreigner_accepted boolean DEFAULT false,
  freelancer_accepted boolean DEFAULT false,
  company_type text NOT NULL DEFAULT '自社'::text,
  source text DEFAULT 'manual_entry'::text,
  source_document_url text,
  ai_processed boolean DEFAULT false,
  ai_extracted_project_data jsonb DEFAULT '{}'::jsonb,
  ai_match_embedding vector,
  ai_match_paraphrase text,
  primary_manager_id uuid,
  received_date timestamptz,
  is_active boolean DEFAULT true,
  tenant_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  registered_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. 工程师表
CREATE TABLE public.engineers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  gender text,
  age text,
  nationality text,
  nearest_station text,
  education text,
  arrival_year_japan text,
  certifications text[] DEFAULT '{}'::text[],
  skills text[] DEFAULT '{}'::text[],
  technical_keywords text[] DEFAULT '{}'::text[],
  experience text NOT NULL,
  work_scope text,
  work_experience text,
  japanese_level text,
  english_level text,
  availability text,
  current_status text DEFAULT 'available'::text,
  company_type text NOT NULL,
  company_name text,
  preferred_work_style text[] DEFAULT '{}'::text[],
  preferred_locations text[] DEFAULT '{}'::text[],
  self_promotion text,
  remarks text,
  recommendation text,
  resume_url text,
  resume_text text,
  source text,
  source_details text,
  skills_detail jsonb DEFAULT '{}'::jsonb,
  project_history jsonb DEFAULT '{}'::jsonb,
  desired_rate_min integer,
  desired_rate_max integer,
  overtime_available boolean DEFAULT false,
  business_trip_available boolean DEFAULT false,
  documents jsonb DEFAULT '{}'::jsonb,
  ai_extracted_data jsonb DEFAULT '{}'::jsonb,
  ai_match_embedding vector,
  ai_match_paraphrase text,
  evaluations jsonb DEFAULT '{}'::jsonb,
  last_active_at timestamptz,
  profile_completion_rate numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  tenant_id uuid NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (id)
);

-- 3. 项目工程师匹配表
CREATE TABLE public.project_engineer_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  engineer_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  matching_history_id uuid,
  match_score numeric,
  confidence_score numeric,
  skill_match_score numeric,
  project_experience_match_score numeric,
  experience_match_score numeric,
  japanese_level_match_score numeric,
  budget_match_score numeric,
  location_match_score numeric,
  matched_skills text[] DEFAULT '{}'::text[],
  missing_skills text[] DEFAULT '{}'::text[],
  project_experience_match text[] DEFAULT '{}'::text[],
  missing_project_experience text[] DEFAULT '{}'::text[],
  matched_experiences text[] DEFAULT '{}'::text[],
  missing_experiences text[] DEFAULT '{}'::text[],
  match_reasons text[] DEFAULT '{}'::text[],
  concerns text[] DEFAULT '{}'::text[],
  comment text,
  status text DEFAULT '未保存'::text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  ai_match_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (id)
);

-- 4. 项目归档表
CREATE TABLE public.project_archives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_project_id uuid NOT NULL,
  project_data jsonb NOT NULL,
  archive_reason text,
  archived_by uuid,
  archived_at timestamptz DEFAULT now(),
  tenant_id uuid NOT NULL,
  PRIMARY KEY (id)
);

-- 5. 邮件发送队列表
CREATE TABLE public.email_sending_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  to_emails text[] NOT NULL,
  cc_emails text[] DEFAULT '{}'::text[],
  bcc_emails text[] DEFAULT '{}'::text[],
  subject text NOT NULL,
  body_html text,
  body_text text,
  attachments jsonb DEFAULT '{}'::jsonb,
  template_id uuid,
  smtp_setting_id uuid,
  status text DEFAULT 'queued'::text,
  priority integer DEFAULT 5,
  scheduled_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  current_retry_count integer DEFAULT 0,
  max_retry_count integer DEFAULT 3,
  last_attempt_at timestamptz,
  error_message text,
  send_duration_ms integer,
  email_metadata jsonb DEFAULT '{}'::jsonb,
  related_project_id uuid,
  related_engineer_id uuid,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 6. SMTP设置表
CREATE TABLE public.email_smtp_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  setting_name text NOT NULL,
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_username text NOT NULL,
  smtp_password_encrypted text NOT NULL,
  security_protocol text DEFAULT 'TLS'::text,
  from_email text NOT NULL,
  from_name text,
  reply_to_email text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  connection_status text DEFAULT 'untested'::text,
  last_test_at timestamptz,
  last_test_error text,
  daily_send_limit integer DEFAULT 1000,
  hourly_send_limit integer DEFAULT 100,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (id)
);

-- 7. 邮件模板表
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  subject_template text NOT NULL,
  body_template_text text NOT NULL,
  body_template_html text,
  available_placeholders text[] DEFAULT '{}'::text[],
  required_placeholders text[] DEFAULT '{}'::text[],
  ai_summary_enabled boolean DEFAULT false,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (id)
);

-- 8. 接收邮件表
CREATE TABLE public.receive_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  sender_name text,
  sender_email text,
  sender_company text,
  subject text,
  body_html text,
  body_text text,
  raw_email text,
  attachments jsonb DEFAULT '{}'::jsonb,
  recipient_to text[] DEFAULT '{}'::text[],
  recipient_cc text[] DEFAULT '{}'::text[],
  recipient_bcc text[] DEFAULT '{}'::text[],
  received_at timestamptz DEFAULT now(),
  email_type text,
  processing_status text DEFAULT 'pending'::text,
  ai_extraction_status text DEFAULT 'pending'::text,
  processing_attempts integer DEFAULT 0,
  processing_error text,
  project_id uuid,
  engineer_id uuid,
  project_sender_id uuid,
  engineer_sender_id uuid,
  ai_extracted_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 9. 统计汇总表
CREATE TABLE public.statistics_summary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  summary_date date NOT NULL,
  summary_type text NOT NULL,
  total_projects_count integer DEFAULT 0,
  active_projects_count integer DEFAULT 0,
  completed_projects_count integer DEFAULT 0,
  new_projects_count integer DEFAULT 0,
  project_fill_rate numeric,
  avg_time_to_fill_project_days numeric,
  total_engineers_count integer DEFAULT 0,
  active_engineers_count integer DEFAULT 0,
  new_engineers_count integer DEFAULT 0,
  engineer_placement_rate numeric,
  matches_generated_count integer DEFAULT 0,
  high_quality_matches_count integer DEFAULT 0,
  successful_placements_count integer DEFAULT 0,
  match_success_rate numeric,
  emails_sent_count integer DEFAULT 0,
  emails_opened_rate numeric,
  emails_clicked_rate numeric,
  ai_insights jsonb DEFAULT '{}'::jsonb,
  additional_metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 10. AI配置表
CREATE TABLE public.user_ai_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  provider_id uuid NOT NULL,
  config_name text NOT NULL,
  description text,
  api_key_encrypted text,
  api_secret_encrypted text,
  organization_id text,
  api_base_url text,
  api_version text,
  default_model text,
  available_models text[] DEFAULT '{}'::text[],
  default_temperature numeric DEFAULT 0.7,
  default_max_tokens integer DEFAULT 1000,
  default_top_p numeric DEFAULT 1.0,
  custom_parameters jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  connection_status text DEFAULT 'untested'::text,
  last_test_at timestamptz,
  last_test_error text,
  last_used_at timestamptz,
  cost_tracking_enabled boolean DEFAULT false,
  estimated_monthly_cost numeric DEFAULT 0,
  actual_monthly_cost numeric DEFAULT 0,
  cost_currency text DEFAULT 'USD'::text,
  daily_request_limit integer,
  monthly_request_limit integer,
  current_day_usage integer DEFAULT 0,
  current_month_usage integer DEFAULT 0,
  last_usage_reset_date date DEFAULT CURRENT_DATE,
  rate_limit_settings jsonb DEFAULT '{}'::jsonb,
  retry_settings jsonb DEFAULT '{"max_retries": 3, "retry_delay": 1}'::jsonb,
  timeout_seconds integer DEFAULT 30,
  allowed_functions text[] DEFAULT '{}'::text[],
  enabled_for_matching boolean DEFAULT true,
  enabled_for_email_generation boolean DEFAULT true,
  enabled_for_document_extraction boolean DEFAULT true,
  enabled_for_reporting boolean DEFAULT true,
  ip_whitelist text[] DEFAULT '{}'::text[],
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (id)
);
CREATE TABLE public.ai_matching_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  matching_type text DEFAULT 'auto',
  execution_status text DEFAULT 'pending',
  trigger_type text,
  executed_by uuid,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  processing_time_seconds integer,
  project_ids uuid[] DEFAULT '{}',
  engineer_ids uuid[] DEFAULT '{}',
  total_projects_input integer DEFAULT 0,
  total_engineers_input integer DEFAULT 0,
  total_matches_generated integer DEFAULT 0,
  high_quality_matches integer DEFAULT 0,
  ai_config jsonb DEFAULT '{}',
  ai_model_version text,
  filters jsonb DEFAULT '{}',
  statistics jsonb DEFAULT '{}',
  error_message text
);
-- 创建索引以提高查询性能
CREATE INDEX idx_ai_matching_history_tenant_id ON public.ai_matching_history(tenant_id);
-- 创建索引
CREATE INDEX idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_company_type ON public.projects(company_type);
CREATE INDEX idx_engineers_tenant_id ON public.engineers(tenant_id);
CREATE INDEX idx_engineers_company_type ON public.engineers(company_type);
CREATE INDEX idx_engineers_current_status ON public.engineers(current_status);
CREATE INDEX idx_project_engineer_matches_project_id ON public.project_engineer_matches(project_id);
CREATE INDEX idx_project_engineer_matches_engineer_id ON public.project_engineer_matches(engineer_id);
CREATE INDEX idx_project_engineer_matches_tenant_id ON public.project_engineer_matches(tenant_id);
人才和案件匹配API总结
根据查找到的信息，这里是您项目中人才（简历/工程师）和案件（项目）相关匹配的所有API详细信息：
1. 案件匹配简历 API
路径: /api/v1/ai-matching/project-to-engineers
方法: POST
描述: 为特定案件找到最合适的简历候选人
Request Body:
python{
    "tenant_id": "uuid",                    # 租户ID（必填）
    "project_id": "uuid",                   # 案件ID（必填）
    "executed_by": "uuid",                  # 执行人ID（可选）
    "matching_type": "string",              # 匹配类型，默认"auto"
    "trigger_type": "string",               # 触发类型，默认"api"
    "max_matches": 10,                      # 最大匹配数量（1-100），默认10
    "min_score": 0.6,                       # 最小匹配分数（0-1），默认0.6
    "weights": {                            # 匹配权重配置（可选）
        "skill_match": 0.3,                 # 技能匹配权重
        "experience_match": 0.25,           # 经验匹配权重
        "project_experience_match": 0.2,    # 项目经验匹配权重
        "japanese_level_match": 0.15,       # 日语水平匹配权重
        "location_match": 0.1               # 地点匹配权重
    },
    "filters": {                            # 筛选条件（可选）
        "japanese_level": ["N1", "N2"],     # 日语等级筛选
        "current_status": ["available"]     # 状态筛选
    }
}
Response (ProjectToEngineersResponse):
python{
    "matching_history": {                   # 匹配历史信息
        "id": "uuid",
        "tenant_id": "uuid",
        "executed_by": "uuid",
        "matching_type": "string",
        "trigger_type": "string",
        "execution_status": "string",
        "started_at": "datetime",
        "completed_at": "datetime",
        "total_projects_input": 1,
        "total_engineers_input": 100,
        "total_matches_generated": 10,
        "high_quality_matches": 5,
        "processing_time_seconds": 2,
        "project_ids": ["uuid"],
        "engineer_ids": ["uuid", ...],
        "ai_config": {...},
        "ai_model_version": "pgvector_database_similarity",
        "statistics": {...},
        "filters": {...},
        "error_message": null
    },
    "project_info": {                       # 项目信息
        "id": "uuid",
        "title": "项目名称",
        "skills": ["Java", "Spring"],
        ...
    },
    "matched_engineers": [                  # 匹配的工程师列表
        {
            "id": "uuid",
            "project_id": "uuid",
            "engineer_id": "uuid",
            "match_score": 0.85,            # 总匹配分数
            "confidence_score": 0.80,       # 置信度分数
            "skill_match_score": 0.90,     # 技能匹配分数
            "experience_match_score": 0.85,
            "project_experience_match_score": 0.80,
            "japanese_level_match_score": 0.75,
            "budget_match_score": 0.70,
            "location_match_score": 0.85,
            "matched_skills": ["Java", "Spring"],
            "missing_skills": ["Docker"],
            "matched_experiences": ["Web开发"],
            "missing_experiences": ["云架构"],
            "project_experience_match": ["电商系统"],
            "missing_project_experience": [],
            "match_reasons": ["技能高度匹配", "经验丰富"],
            "concerns": ["缺少Docker经验"],
            "project_title": "项目名称",
            "engineer_name": "工程师姓名",
            "status": "未保存",
            "created_at": "datetime"
        },
        ...
    ],
    "total_matches": 10,                    # 总匹配数
    "high_quality_matches": 5,              # 高质量匹配数
    "processing_time_seconds": 2.5,         # 处理时间
    "recommendations": ["建议1", "建议2"],  # 推荐建议
    "warnings": []                          # 警告信息
}

2. 简历匹配案件 API
路径: /api/v1/ai-matching/engineer-to-projects
方法: POST
描述: 为特定简历推荐最合适的案件机会
Request Body:
python{
    "tenant_id": "uuid",                    # 租户ID（必填）
    "engineer_id": "uuid",                  # 工程师ID（必填）
    "executed_by": "uuid",                  # 执行人ID（可选）
    "matching_type": "string",              # 匹配类型，默认"auto"
    "trigger_type": "string",               # 触发类型，默认"api"
    "max_matches": 10,                      # 最大匹配数量（1-100），默认10
    "min_score": 0.6,                       # 最小匹配分数（0-1），默认0.6
    "weights": {                            # 匹配权重配置（可选）
        "skill_match": 0.35,                # 技能匹配权重
        "experience_match": 0.3,            # 经验匹配权重
        "budget_match": 0.2,                # 预算匹配权重
        "location_match": 0.15              # 地点匹配权重
    },
    "filters": {                            # 筛选条件（可选）
        "status": ["募集中"],               # 案件状态筛选
        "company_type": ["自社"]            # 公司类型筛选
    }
}
Response (EngineerToProjectsResponse):
python{
    "matching_history": {...},              # 同上结构
    "engineer_info": {                      # 工程师信息
        "id": "uuid",
        "name": "工程师姓名",
        "skills": ["Java", "Python"],
        "japanese_level": "N2",
        ...
    },
    "matched_projects": [                   # 匹配的项目列表
        {
            # 同 matched_engineers 结构
        },
        ...
    ],
    "total_matches": 10,
    "high_quality_matches": 5,
    "processing_time_seconds": 2.5,
    "recommendations": [],
    "warnings": []
}

3. 批量匹配 API
路径: /api/v1/ai-matching/bulk-matching
方法: POST
描述: 大规模自动化匹配案件和简历
Request Body:
python{
    "tenant_id": "uuid",                    # 租户ID（必填）
    "project_ids": ["uuid1", "uuid2"],      # 项目ID列表（可选，None=所有）
    "engineer_ids": ["uuid3", "uuid4"],     # 工程师ID列表（可选，None=所有）
    "executed_by": "uuid",                  # 执行人ID（可选）
    "matching_type": "string",              # 匹配类型
    "trigger_type": "string",               # 触发类型
    "max_matches": 10,                      # 每个项目的最大匹配数
    "min_score": 0.6,                       # 最小匹配分数
    "batch_size": 50,                       # 批处理大小（10-100），默认50
    "generate_top_matches_only": true,      # 只生成高质量匹配，默认true
    "filters": {}                           # 筛选条件
}
Response (BulkMatchingResponse):
python{
    "matching_history": {...},              # 同上结构
    "matches": [                            # 所有匹配结果列表
        {...},
        ...
    ],
    "batch_summary": {                      # 批次摘要
        "total_projects": 20,
        "total_engineers": 100,
        "total_combinations": 2000,
        "matches_generated": 150
    },
    "top_matches_by_project": {             # 按项目分组的顶级匹配
        "project_uuid1": [{...}, {...}],
        "project_uuid2": [{...}, {...}]
    },
    "top_matches_by_engineer": {            # 按工程师分组的顶级匹配
        "engineer_uuid1": [{...}, {...}],
        "engineer_uuid2": [{...}, {...}]
    },
    "total_matches": 150,
    "high_quality_matches": 75,
    "processing_time_seconds": 10.5,
    "recommendations": [],
    "warnings": []
}

4. 获取匹配历史 API
路径: /api/v1/ai-matching/history/{tenant_id}
方法: GET
描述: 获取匹配历史记录
Query Parameters:

limit: 返回数量限制（1-100），默认20
matching_type: 匹配类型筛选（可选）

Response: List[MatchingHistoryResponse]

5. 获取匹配历史详情 API
路径: /api/v1/ai-matching/history/{tenant_id}/{history_id}
方法: GET
描述: 获取特定匹配历史详情
Response: MatchingHistoryResponse

6. 根据历史ID获取匹配结果 API
路径: /api/v1/ai-matching/matches/{tenant_id}/{history_id}
方法: GET
描述: 根据历史ID获取具体的匹配结果列表
Query Parameters:

limit: 返回数量限制（1-500），默认100
min_score: 最小分数筛选（0-1），默认0

Response: List[MatchResult]

7. 更新匹配状态 API
路径: /api/v1/ai-matching/matches/{tenant_id}/{match_id}/status
方法: PUT
描述: 更新特定匹配的状态
Query Parameters:

status: 新状态（必填）
comment: 备注（可选）
reviewed_by: 审核人ID（可选）

Response:
python{
    "status": "success",
    "message": "匹配状态更新成功",
    "match_id": "uuid",
    "new_status": "已保存"
}

8. 获取匹配统计 API
路径: /api/v1/ai-matching/statistics/{tenant_id}
方法: GET
描述: 获取匹配统计信息
Query Parameters:

days: 统计天数，默认30

Response (MatchingStatsResponse):
python{
    "total_matching_sessions": 100,         # 总匹配会话数
    "total_matches_generated": 1500,        # 总生成匹配数
    "average_match_score": 0.75,            # 平均匹配分数
    "high_quality_match_rate": 0.45,        # 高质量匹配率
    "stats_by_type": {                      # 按类型统计
        "project_to_engineers": {...},
        "engineer_to_projects": {...},
        "bulk_matching": {...}
    },
    "daily_stats": [                        # 每日统计
        {
            "date": "2024-01-20",
            "sessions": 10,
            "matches": 150
        },
        ...
    ],
    "top_matched_skills": [                 # 热门匹配技能
        {"skill": "Java", "count": 200},
        {"skill": "Python", "count": 180}
    ],
    "top_project_types": [                  # 热门项目类型
        {"type": "Web开发", "count": 50},
        {"type": "移动应用", "count": 30}
    ]
} 这些是我后台关于案件和技术者匹配的api
这是我的数据库表结构
之后所有代码中如果有文本的话都用日语