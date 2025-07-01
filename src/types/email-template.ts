export interface EmailTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category?: string;
  subject_template: string;
  body_template_text: string;
  body_template_html?: string;
  signature_template?: string;
  available_placeholders?: string[];
  required_placeholders?: string[];
  ai_summary_enabled?: boolean;
  is_active?: boolean;
  usage_count?: number;
  last_used_at?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  subject_template: string;
  body_template_text: string;
  body_template_html?: string;
  signature_template?: string;
  available_placeholders?: string[];
  required_placeholders?: string[];
  ai_summary_enabled?: boolean;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  subject_template?: string;
  body_template_text?: string;
  body_template_html?: string;
  signature_template?: string;
  available_placeholders?: string[];
  required_placeholders?: string[];
  ai_summary_enabled?: boolean;
  is_active?: boolean;
}

export interface EmailTemplateFilters {
  category?: string;
  is_active?: boolean;
  created_by?: string;
  search?: string;
}

export interface EmailTemplateStats {
  total_templates: number;
  active_templates: number;
  categories: string[];
  most_used_template?: EmailTemplate;
  recent_templates: EmailTemplate[];
}