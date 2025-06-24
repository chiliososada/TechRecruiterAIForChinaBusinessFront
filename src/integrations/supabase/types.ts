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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          request_id: string | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_configuration_templates: {
        Row: {
          created_at: string | null
          default_parameters: Json | null
          difficulty_level: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_recommended: boolean | null
          provider_id: string
          recommended_model: string | null
          template_description: string | null
          template_name: string
          updated_at: string | null
          usage_limits: Json | null
          use_case: string | null
        }
        Insert: {
          created_at?: string | null
          default_parameters?: Json | null
          difficulty_level?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          provider_id: string
          recommended_model?: string | null
          template_description?: string | null
          template_name: string
          updated_at?: string | null
          usage_limits?: Json | null
          use_case?: string | null
        }
        Update: {
          created_at?: string | null
          default_parameters?: Json | null
          difficulty_level?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_recommended?: boolean | null
          provider_id?: string
          recommended_model?: string | null
          template_description?: string | null
          template_name?: string
          updated_at?: string | null
          usage_limits?: Json | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_configuration_templates_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_matching_history: {
        Row: {
          ai_config: Json | null
          ai_model_version: string | null
          completed_at: string | null
          engineer_ids: string[] | null
          error_message: string | null
          executed_by: string | null
          execution_status: string | null
          filters: Json | null
          high_quality_matches: number | null
          id: string
          matching_type: string | null
          processing_time_seconds: number | null
          project_ids: string[] | null
          started_at: string | null
          statistics: Json | null
          tenant_id: string
          total_engineers_input: number | null
          total_matches_generated: number | null
          total_projects_input: number | null
          trigger_type: string | null
        }
        Insert: {
          ai_config?: Json | null
          ai_model_version?: string | null
          completed_at?: string | null
          engineer_ids?: string[] | null
          error_message?: string | null
          executed_by?: string | null
          execution_status?: string | null
          filters?: Json | null
          high_quality_matches?: number | null
          id?: string
          matching_type?: string | null
          processing_time_seconds?: number | null
          project_ids?: string[] | null
          started_at?: string | null
          statistics?: Json | null
          tenant_id: string
          total_engineers_input?: number | null
          total_matches_generated?: number | null
          total_projects_input?: number | null
          trigger_type?: string | null
        }
        Update: {
          ai_config?: Json | null
          ai_model_version?: string | null
          completed_at?: string | null
          engineer_ids?: string[] | null
          error_message?: string | null
          executed_by?: string | null
          execution_status?: string | null
          filters?: Json | null
          high_quality_matches?: number | null
          id?: string
          matching_type?: string | null
          processing_time_seconds?: number | null
          project_ids?: string[] | null
          started_at?: string | null
          statistics?: Json | null
          tenant_id?: string
          total_engineers_input?: number | null
          total_matches_generated?: number | null
          total_projects_input?: number | null
          trigger_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_matching_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_matching_settings: {
        Row: {
          auto_matching_enabled: boolean | null
          auto_matching_trigger_engineer_create: boolean | null
          auto_matching_trigger_project_create: boolean | null
          batch_matching_schedule: string | null
          batch_size: number | null
          config_data: Json | null
          created_at: string | null
          created_by: string | null
          default_filters: Json | null
          deleted_at: string | null
          exclusions: Json | null
          id: string
          is_active: boolean | null
          min_match_score: number | null
          setting_name: string
          setting_type: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          auto_matching_enabled?: boolean | null
          auto_matching_trigger_engineer_create?: boolean | null
          auto_matching_trigger_project_create?: boolean | null
          batch_matching_schedule?: string | null
          batch_size?: number | null
          config_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_filters?: Json | null
          deleted_at?: string | null
          exclusions?: Json | null
          id?: string
          is_active?: boolean | null
          min_match_score?: number | null
          setting_name: string
          setting_type?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          auto_matching_enabled?: boolean | null
          auto_matching_trigger_engineer_create?: boolean | null
          auto_matching_trigger_project_create?: boolean | null
          batch_matching_schedule?: string | null
          batch_size?: number | null
          config_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_filters?: Json | null
          deleted_at?: string | null
          exclusions?: Json | null
          id?: string
          is_active?: boolean | null
          min_match_score?: number | null
          setting_name?: string
          setting_type?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_matching_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_matching_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_service_providers: {
        Row: {
          api_base_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          documentation_url: string | null
          id: string
          is_active: boolean | null
          optional_fields: Json | null
          provider_code: string
          provider_name: string
          required_fields: Json | null
          supported_models: Json | null
          updated_at: string | null
        }
        Insert: {
          api_base_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          optional_fields?: Json | null
          provider_code: string
          provider_name: string
          required_fields?: Json | null
          supported_models?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_base_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          documentation_url?: string | null
          id?: string
          is_active?: boolean | null
          optional_fields?: Json | null
          provider_code?: string
          provider_name?: string
          required_fields?: Json | null
          supported_models?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          config_id: string
          cost_currency: string | null
          created_at: string | null
          error_message: string | null
          estimated_cost: number | null
          function_type: string
          id: string
          model_used: string
          related_email_id: string | null
          related_engineer_id: string | null
          related_project_id: string | null
          request_metadata: Json | null
          request_tokens: number | null
          response_metadata: Json | null
          response_time_ms: number | null
          response_tokens: number | null
          status: string
          tenant_id: string
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          config_id: string
          cost_currency?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          function_type: string
          id?: string
          model_used: string
          related_email_id?: string | null
          related_engineer_id?: string | null
          related_project_id?: string | null
          request_metadata?: Json | null
          request_tokens?: number | null
          response_metadata?: Json | null
          response_time_ms?: number | null
          response_tokens?: number | null
          status: string
          tenant_id: string
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          config_id?: string
          cost_currency?: string | null
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number | null
          function_type?: string
          id?: string
          model_used?: string
          related_email_id?: string | null
          related_engineer_id?: string | null
          related_project_id?: string | null
          request_metadata?: Json | null
          request_tokens?: number | null
          response_metadata?: Json | null
          response_time_ms?: number | null
          response_tokens?: number | null
          status?: string
          tenant_id?: string
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "user_ai_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_related_email_id_fkey"
            columns: ["related_email_id"]
            isOneToOne: false
            referencedRelation: "receive_emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_related_engineer_id_fkey"
            columns: ["related_engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sending_logs: {
        Row: {
          attachment_transfer_log: Json | null
          bounce_reason: string | null
          bounce_type: string | null
          clicked_at: string | null
          complaint_reason: string | null
          complaint_type: string | null
          delivery_status: string | null
          id: string
          logged_at: string | null
          message_id: string | null
          opened_at: string | null
          queue_id: string | null
          replied_at: string | null
          response_time_ms: number | null
          send_end_time: string | null
          send_start_time: string | null
          smtp_response: string | null
          tenant_id: string
          unsubscribed_at: string | null
        }
        Insert: {
          attachment_transfer_log?: Json | null
          bounce_reason?: string | null
          bounce_type?: string | null
          clicked_at?: string | null
          complaint_reason?: string | null
          complaint_type?: string | null
          delivery_status?: string | null
          id?: string
          logged_at?: string | null
          message_id?: string | null
          opened_at?: string | null
          queue_id?: string | null
          replied_at?: string | null
          response_time_ms?: number | null
          send_end_time?: string | null
          send_start_time?: string | null
          smtp_response?: string | null
          tenant_id: string
          unsubscribed_at?: string | null
        }
        Update: {
          attachment_transfer_log?: Json | null
          bounce_reason?: string | null
          bounce_type?: string | null
          clicked_at?: string | null
          complaint_reason?: string | null
          complaint_type?: string | null
          delivery_status?: string | null
          id?: string
          logged_at?: string | null
          message_id?: string | null
          opened_at?: string | null
          queue_id?: string | null
          replied_at?: string | null
          response_time_ms?: number | null
          send_end_time?: string | null
          send_start_time?: string | null
          smtp_response?: string | null
          tenant_id?: string
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sending_logs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "email_sending_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sending_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sending_queue: {
        Row: {
          attachments: Json | null
          bcc_emails: string[] | null
          body_html: string | null
          body_text: string | null
          cc_emails: string[] | null
          created_at: string | null
          created_by: string | null
          current_retry_count: number | null
          email_metadata: Json | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_retry_count: number | null
          priority: number | null
          related_engineer_id: string | null
          related_project_id: string | null
          scheduled_at: string | null
          send_duration_ms: number | null
          sent_at: string | null
          smtp_setting_id: string | null
          status: string | null
          subject: string
          template_id: string | null
          tenant_id: string
          to_emails: string[]
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_retry_count?: number | null
          email_metadata?: Json | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retry_count?: number | null
          priority?: number | null
          related_engineer_id?: string | null
          related_project_id?: string | null
          scheduled_at?: string | null
          send_duration_ms?: number | null
          sent_at?: string | null
          smtp_setting_id?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          tenant_id: string
          to_emails: string[]
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_retry_count?: number | null
          email_metadata?: Json | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retry_count?: number | null
          priority?: number | null
          related_engineer_id?: string | null
          related_project_id?: string | null
          scheduled_at?: string | null
          send_duration_ms?: number | null
          sent_at?: string | null
          smtp_setting_id?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          tenant_id?: string
          to_emails?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sending_queue_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sending_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sending_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_smtp_settings: {
        Row: {
          connection_status: string | null
          created_at: string | null
          created_by: string | null
          daily_send_limit: number | null
          deleted_at: string | null
          from_email: string
          from_name: string | null
          hourly_send_limit: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_test_at: string | null
          last_test_error: string | null
          reply_to_email: string | null
          security_protocol: string | null
          setting_name: string
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port: number
          smtp_username: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_send_limit?: number | null
          deleted_at?: string | null
          from_email: string
          from_name?: string | null
          hourly_send_limit?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_test_at?: string | null
          last_test_error?: string | null
          reply_to_email?: string | null
          security_protocol?: string | null
          setting_name: string
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port?: number
          smtp_username: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_send_limit?: number | null
          deleted_at?: string | null
          from_email?: string
          from_name?: string | null
          hourly_send_limit?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_test_at?: string | null
          last_test_error?: string | null
          reply_to_email?: string | null
          security_protocol?: string | null
          setting_name?: string
          smtp_host?: string
          smtp_password_encrypted?: string
          smtp_port?: number
          smtp_username?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_smtp_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_smtp_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          ai_summary_enabled: boolean | null
          available_placeholders: string[] | null
          body_template_html: string | null
          body_template_text: string
          category: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          required_placeholders: string[] | null
          subject_template: string
          tenant_id: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          ai_summary_enabled?: boolean | null
          available_placeholders?: string[] | null
          body_template_html?: string | null
          body_template_text: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          required_placeholders?: string[] | null
          subject_template: string
          tenant_id: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          ai_summary_enabled?: boolean | null
          available_placeholders?: string[] | null
          body_template_html?: string | null
          body_template_text?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          required_placeholders?: string[] | null
          subject_template?: string
          tenant_id?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      engineer_senders: {
        Row: {
          address: string | null
          company: string | null
          contact_preferences: Json | null
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_contact_at: string | null
          name: string | null
          phone: string | null
          position: string | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          contact_preferences?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_contact_at?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          contact_preferences?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_contact_at?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineer_senders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      engineers: {
        Row: {
          age: string | null
          ai_extracted_data: Json | null
          ai_match_embedding: string | null
          ai_match_paraphrase: string | null
          arrival_year_japan: string | null
          availability: string | null
          business_trip_available: boolean | null
          certifications: string[] | null
          company_name: string | null
          company_type: string
          created_at: string | null
          created_by: string | null
          current_status: string | null
          deleted_at: string | null
          desired_rate_max: number | null
          desired_rate_min: number | null
          documents: Json | null
          education: string | null
          email: string | null
          english_level: string | null
          evaluations: Json | null
          experience: string
          gender: string | null
          id: string
          is_active: boolean | null
          japanese_level: string | null
          last_active_at: string | null
          manager_email: string | null
          manager_name: string | null
          name: string
          nationality: string | null
          nearest_station: string | null
          overtime_available: boolean | null
          phone: string | null
          preferred_locations: string[] | null
          preferred_work_style: string[] | null
          profile_completion_rate: number | null
          project_history: Json | null
          recommendation: string | null
          remarks: string | null
          resume_text: string | null
          resume_url: string | null
          self_promotion: string | null
          skills: string[] | null
          skills_detail: Json | null
          source: string | null
          source_details: string | null
          technical_keywords: string[] | null
          tenant_id: string
          updated_at: string | null
          work_experience: string | null
          work_scope: string | null
        }
        Insert: {
          age?: string | null
          ai_extracted_data?: Json | null
          ai_match_embedding?: string | null
          ai_match_paraphrase?: string | null
          arrival_year_japan?: string | null
          availability?: string | null
          business_trip_available?: boolean | null
          certifications?: string[] | null
          company_name?: string | null
          company_type: string
          created_at?: string | null
          created_by?: string | null
          current_status?: string | null
          deleted_at?: string | null
          desired_rate_max?: number | null
          desired_rate_min?: number | null
          documents?: Json | null
          education?: string | null
          email?: string | null
          english_level?: string | null
          evaluations?: Json | null
          experience: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          japanese_level?: string | null
          last_active_at?: string | null
          manager_email?: string | null
          manager_name?: string | null
          name: string
          nationality?: string | null
          nearest_station?: string | null
          overtime_available?: boolean | null
          phone?: string | null
          preferred_locations?: string[] | null
          preferred_work_style?: string[] | null
          profile_completion_rate?: number | null
          project_history?: Json | null
          recommendation?: string | null
          remarks?: string | null
          resume_text?: string | null
          resume_url?: string | null
          self_promotion?: string | null
          skills?: string[] | null
          skills_detail?: Json | null
          source?: string | null
          source_details?: string | null
          technical_keywords?: string[] | null
          tenant_id: string
          updated_at?: string | null
          work_experience?: string | null
          work_scope?: string | null
        }
        Update: {
          age?: string | null
          ai_extracted_data?: Json | null
          ai_match_embedding?: string | null
          ai_match_paraphrase?: string | null
          arrival_year_japan?: string | null
          availability?: string | null
          business_trip_available?: boolean | null
          certifications?: string[] | null
          company_name?: string | null
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          current_status?: string | null
          deleted_at?: string | null
          desired_rate_max?: number | null
          desired_rate_min?: number | null
          documents?: Json | null
          education?: string | null
          email?: string | null
          english_level?: string | null
          evaluations?: Json | null
          experience?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          japanese_level?: string | null
          last_active_at?: string | null
          manager_email?: string | null
          manager_name?: string | null
          name?: string
          nationality?: string | null
          nearest_station?: string | null
          overtime_available?: boolean | null
          phone?: string | null
          preferred_locations?: string[] | null
          preferred_work_style?: string[] | null
          profile_completion_rate?: number | null
          project_history?: Json | null
          recommendation?: string | null
          remarks?: string | null
          resume_text?: string | null
          resume_url?: string | null
          self_promotion?: string | null
          skills?: string[] | null
          skills_detail?: Json | null
          source?: string | null
          source_details?: string | null
          technical_keywords?: string[] | null
          tenant_id?: string
          updated_at?: string | null
          work_experience?: string | null
          work_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engineers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          feature_code: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_code: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          feature_code?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number | null
          amount_total: number
          created_at: string | null
          currency: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_pdf_url: string | null
          metadata: Json | null
          paid_at: string | null
          status: string
          stripe_charge_id: string | null
          stripe_invoice_id: string
          subscription_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          amount_total: number
          created_at?: string | null
          currency: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_invoice_id: string
          subscription_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          amount_total?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_invoice_id?: string
          subscription_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_clients: {
        Row: {
          client_id: string
          client_name: string
          client_secret: string
          created_at: string | null
          id: string
          is_active: boolean | null
          redirect_uris: string[] | null
          scopes: string[] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          client_name: string
          client_secret: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          redirect_uris?: string[] | null
          scopes?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          client_name?: string
          client_secret?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          redirect_uris?: string[] | null
          scopes?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          created_at: string | null
          feature_id: string
          is_enabled: boolean | null
          limit_description: string | null
          plan_id: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string | null
          feature_id: string
          is_enabled?: boolean | null
          limit_description?: string | null
          plan_id: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string | null
          feature_id?: string
          is_enabled?: boolean | null
          limit_description?: string | null
          plan_id?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          expires_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_company_admin: boolean | null
          is_test_account: boolean | null
          job_title: string | null
          last_login_at: string | null
          last_name: string | null
          permissions: Json | null
          position: string | null
          role: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          is_company_admin?: boolean | null
          is_test_account?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          last_name?: string | null
          permissions?: Json | null
          position?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_company_admin?: boolean | null
          is_test_account?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          last_name?: string | null
          permissions?: Json | null
          position?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_archives: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          id: string
          original_project_id: string
          project_data: Json
          tenant_id: string
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          id?: string
          original_project_id: string
          project_data: Json
          tenant_id: string
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          id?: string
          original_project_id?: string
          project_data?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_archives_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_archives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_engineer_matches: {
        Row: {
          ai_match_data: Json | null
          budget_match_score: number | null
          comment: string | null
          concerns: string[] | null
          confidence_score: number | null
          created_at: string | null
          deleted_at: string | null
          engineer_id: string
          experience_match_score: number | null
          id: string
          is_active: boolean | null
          japanese_level_match_score: number | null
          location_match_score: number | null
          match_reasons: string[] | null
          match_score: number | null
          matched_experiences: string[] | null
          matched_skills: string[] | null
          matching_history_id: string | null
          missing_experiences: string[] | null
          missing_project_experience: string[] | null
          missing_skills: string[] | null
          project_experience_match: string[] | null
          project_experience_match_score: number | null
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          skill_match_score: number | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          ai_match_data?: Json | null
          budget_match_score?: number | null
          comment?: string | null
          concerns?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          engineer_id: string
          experience_match_score?: number | null
          id?: string
          is_active?: boolean | null
          japanese_level_match_score?: number | null
          location_match_score?: number | null
          match_reasons?: string[] | null
          match_score?: number | null
          matched_experiences?: string[] | null
          matched_skills?: string[] | null
          matching_history_id?: string | null
          missing_experiences?: string[] | null
          missing_project_experience?: string[] | null
          missing_skills?: string[] | null
          project_experience_match?: string[] | null
          project_experience_match_score?: number | null
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_match_score?: number | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          ai_match_data?: Json | null
          budget_match_score?: number | null
          comment?: string | null
          concerns?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          deleted_at?: string | null
          engineer_id?: string
          experience_match_score?: number | null
          id?: string
          is_active?: boolean | null
          japanese_level_match_score?: number | null
          location_match_score?: number | null
          match_reasons?: string[] | null
          match_score?: number | null
          matched_experiences?: string[] | null
          matched_skills?: string[] | null
          matching_history_id?: string | null
          missing_experiences?: string[] | null
          missing_project_experience?: string[] | null
          missing_skills?: string[] | null
          project_experience_match?: string[] | null
          project_experience_match_score?: number | null
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_match_score?: number | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_engineer_matches_matching_history_id_fkey"
            columns: ["matching_history_id"]
            isOneToOne: false
            referencedRelation: "ai_matching_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_engineer_matches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      project_senders: {
        Row: {
          address: string | null
          company: string | null
          contact_preferences: Json | null
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_contact_at: string | null
          name: string | null
          phone: string | null
          position: string | null
          tenant_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          contact_preferences?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_contact_at?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          tenant_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          contact_preferences?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_contact_at?: string | null
          name?: string | null
          phone?: string | null
          position?: string | null
          tenant_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_senders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          ai_extracted_project_data: Json | null
          ai_match_embedding: string | null
          ai_match_paraphrase: string | null
          ai_processed: boolean | null
          application_deadline: string | null
          budget: string | null
          client_company: string | null
          company_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          desired_budget: string | null
          detail_description: string | null
          duration: string | null
          experience: string | null
          foreigner_accepted: boolean | null
          freelancer_accepted: boolean | null
          id: string
          interview_count: string | null
          is_active: boolean | null
          japanese_level: string | null
          key_technologies: string | null
          location: string | null
          manager_email: string | null
          manager_name: string | null
          max_candidates: number | null
          partner_company: string | null
          primary_manager_id: string | null
          priority: string | null
          processes: string[] | null
          received_date: string | null
          registered_at: string | null
          skills: string[] | null
          source: string | null
          source_document_url: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          work_type: string | null
        }
        Insert: {
          ai_extracted_project_data?: Json | null
          ai_match_embedding?: string | null
          ai_match_paraphrase?: string | null
          ai_processed?: boolean | null
          application_deadline?: string | null
          budget?: string | null
          client_company?: string | null
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          desired_budget?: string | null
          detail_description?: string | null
          duration?: string | null
          experience?: string | null
          foreigner_accepted?: boolean | null
          freelancer_accepted?: boolean | null
          id?: string
          interview_count?: string | null
          is_active?: boolean | null
          japanese_level?: string | null
          key_technologies?: string | null
          location?: string | null
          manager_email?: string | null
          manager_name?: string | null
          max_candidates?: number | null
          partner_company?: string | null
          primary_manager_id?: string | null
          priority?: string | null
          processes?: string[] | null
          received_date?: string | null
          registered_at?: string | null
          skills?: string[] | null
          source?: string | null
          source_document_url?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          work_type?: string | null
        }
        Update: {
          ai_extracted_project_data?: Json | null
          ai_match_embedding?: string | null
          ai_match_paraphrase?: string | null
          ai_processed?: boolean | null
          application_deadline?: string | null
          budget?: string | null
          client_company?: string | null
          company_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          desired_budget?: string | null
          detail_description?: string | null
          duration?: string | null
          experience?: string | null
          foreigner_accepted?: boolean | null
          freelancer_accepted?: boolean | null
          id?: string
          interview_count?: string | null
          is_active?: boolean | null
          japanese_level?: string | null
          key_technologies?: string | null
          location?: string | null
          manager_email?: string | null
          manager_name?: string | null
          max_candidates?: number | null
          partner_company?: string | null
          primary_manager_id?: string | null
          priority?: string | null
          processes?: string[] | null
          received_date?: string | null
          registered_at?: string | null
          skills?: string[] | null
          source?: string | null
          source_document_url?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_primary_manager_id_fkey"
            columns: ["primary_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      receive_emails: {
        Row: {
          ai_extracted_data: Json | null
          ai_extraction_status: string | null
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string | null
          email_type: string | null
          engineer_id: string | null
          engineer_sender_id: string | null
          id: string
          processing_attempts: number | null
          processing_error: string | null
          processing_status: string | null
          project_id: string | null
          project_sender_id: string | null
          raw_email: string | null
          received_at: string | null
          recipient_bcc: string[] | null
          recipient_cc: string[] | null
          recipient_to: string[] | null
          sender_company: string | null
          sender_email: string | null
          sender_name: string | null
          subject: string | null
          tenant_id: string
        }
        Insert: {
          ai_extracted_data?: Json | null
          ai_extraction_status?: string | null
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          email_type?: string | null
          engineer_id?: string | null
          engineer_sender_id?: string | null
          id?: string
          processing_attempts?: number | null
          processing_error?: string | null
          processing_status?: string | null
          project_id?: string | null
          project_sender_id?: string | null
          raw_email?: string | null
          received_at?: string | null
          recipient_bcc?: string[] | null
          recipient_cc?: string[] | null
          recipient_to?: string[] | null
          sender_company?: string | null
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
          tenant_id: string
        }
        Update: {
          ai_extracted_data?: Json | null
          ai_extraction_status?: string | null
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          email_type?: string | null
          engineer_id?: string | null
          engineer_sender_id?: string | null
          id?: string
          processing_attempts?: number | null
          processing_error?: string | null
          processing_status?: string | null
          project_id?: string | null
          project_sender_id?: string | null
          raw_email?: string | null
          received_at?: string | null
          recipient_bcc?: string[] | null
          recipient_cc?: string[] | null
          recipient_to?: string[] | null
          sender_company?: string | null
          sender_email?: string | null
          sender_name?: string | null
          subject?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receive_emails_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "engineers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_emails_engineer_sender_id_fkey"
            columns: ["engineer_sender_id"]
            isOneToOne: false
            referencedRelation: "engineer_senders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_emails_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_emails_project_sender_id_fkey"
            columns: ["project_sender_id"]
            isOneToOne: false
            referencedRelation: "project_senders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_emails_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          display_name: Json | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          max_engineers: number | null
          max_monthly_matches: number | null
          max_projects: number | null
          name: string
          price_annually: number | null
          price_monthly: number | null
          stripe_price_id_annually: string | null
          stripe_price_id_monthly: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_name?: Json | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_engineers?: number | null
          max_monthly_matches?: number | null
          max_projects?: number | null
          name: string
          price_annually?: number | null
          price_monthly?: number | null
          stripe_price_id_annually?: string | null
          stripe_price_id_monthly?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_name?: Json | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_engineers?: number | null
          max_monthly_matches?: number | null
          max_projects?: number | null
          name?: string
          price_annually?: number | null
          price_monthly?: number | null
          stripe_price_id_annually?: string | null
          stripe_price_id_monthly?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      statistics_summary: {
        Row: {
          active_engineers_count: number | null
          active_projects_count: number | null
          additional_metrics: Json | null
          ai_insights: Json | null
          avg_time_to_fill_project_days: number | null
          completed_projects_count: number | null
          created_at: string | null
          emails_clicked_rate: number | null
          emails_opened_rate: number | null
          emails_sent_count: number | null
          engineer_placement_rate: number | null
          high_quality_matches_count: number | null
          id: string
          match_success_rate: number | null
          matches_generated_count: number | null
          new_engineers_count: number | null
          new_projects_count: number | null
          project_fill_rate: number | null
          successful_placements_count: number | null
          summary_date: string
          summary_type: string
          tenant_id: string
          total_engineers_count: number | null
          total_projects_count: number | null
          updated_at: string | null
        }
        Insert: {
          active_engineers_count?: number | null
          active_projects_count?: number | null
          additional_metrics?: Json | null
          ai_insights?: Json | null
          avg_time_to_fill_project_days?: number | null
          completed_projects_count?: number | null
          created_at?: string | null
          emails_clicked_rate?: number | null
          emails_opened_rate?: number | null
          emails_sent_count?: number | null
          engineer_placement_rate?: number | null
          high_quality_matches_count?: number | null
          id?: string
          match_success_rate?: number | null
          matches_generated_count?: number | null
          new_engineers_count?: number | null
          new_projects_count?: number | null
          project_fill_rate?: number | null
          successful_placements_count?: number | null
          summary_date: string
          summary_type: string
          tenant_id: string
          total_engineers_count?: number | null
          total_projects_count?: number | null
          updated_at?: string | null
        }
        Update: {
          active_engineers_count?: number | null
          active_projects_count?: number | null
          additional_metrics?: Json | null
          ai_insights?: Json | null
          avg_time_to_fill_project_days?: number | null
          completed_projects_count?: number | null
          created_at?: string | null
          emails_clicked_rate?: number | null
          emails_opened_rate?: number | null
          emails_sent_count?: number | null
          engineer_placement_rate?: number | null
          high_quality_matches_count?: number | null
          id?: string
          match_success_rate?: number | null
          matches_generated_count?: number | null
          new_engineers_count?: number | null
          new_projects_count?: number | null
          project_fill_rate?: number | null
          successful_placements_count?: number | null
          summary_date?: string
          summary_type?: string
          tenant_id?: string
          total_engineers_count?: number | null
          total_projects_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_summary_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_ends_at: string | null
          current_period_starts_at: string | null
          ends_at: string | null
          grace_period_ends_at: string | null
          id: string
          metadata: Json | null
          plan_id: string
          status: string
          stripe_latest_invoice_id: string | null
          stripe_payment_method_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          current_period_starts_at?: string | null
          ends_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id: string
          status?: string
          stripe_latest_invoice_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          current_period_starts_at?: string | null
          ends_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string
          status?: string
          stripe_latest_invoice_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system_setting: boolean | null
          setting_key: string
          setting_value: Json
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_setting?: boolean | null
          setting_key: string
          setting_value: Json
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_setting?: boolean | null
          setting_key?: string
          setting_value?: Json
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          id: string
          invited_by: string | null
          is_active: boolean
          joined_at: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          company_email: string | null
          company_info: Json | null
          company_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          domain: string | null
          id: string
          is_active: boolean
          locale: string | null
          max_users: number | null
          name: string
          stripe_customer_id: string | null
          subscription_plan: string | null
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          time_zone: string | null
          updated_at: string
        }
        Insert: {
          company_email?: string | null
          company_info?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          max_users?: number | null
          name: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          time_zone?: string | null
          updated_at?: string
        }
        Update: {
          company_email?: string | null
          company_info?: Json | null
          company_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          max_users?: number | null
          name?: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          time_zone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_ai_configurations: {
        Row: {
          actual_monthly_cost: number | null
          allowed_functions: string[] | null
          api_base_url: string | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          api_version: string | null
          available_models: string[] | null
          config_name: string
          connection_status: string | null
          cost_currency: string | null
          cost_tracking_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          current_day_usage: number | null
          current_month_usage: number | null
          custom_parameters: Json | null
          daily_request_limit: number | null
          default_max_tokens: number | null
          default_model: string | null
          default_temperature: number | null
          default_top_p: number | null
          deleted_at: string | null
          description: string | null
          enabled_for_document_extraction: boolean | null
          enabled_for_email_generation: boolean | null
          enabled_for_matching: boolean | null
          enabled_for_reporting: boolean | null
          estimated_monthly_cost: number | null
          id: string
          ip_whitelist: string[] | null
          is_active: boolean | null
          is_default: boolean | null
          last_test_at: string | null
          last_test_error: string | null
          last_usage_reset_date: string | null
          last_used_at: string | null
          monthly_request_limit: number | null
          organization_id: string | null
          provider_id: string
          rate_limit_settings: Json | null
          retry_settings: Json | null
          tenant_id: string
          timeout_seconds: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_monthly_cost?: number | null
          allowed_functions?: string[] | null
          api_base_url?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          api_version?: string | null
          available_models?: string[] | null
          config_name: string
          connection_status?: string | null
          cost_currency?: string | null
          cost_tracking_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          current_day_usage?: number | null
          current_month_usage?: number | null
          custom_parameters?: Json | null
          daily_request_limit?: number | null
          default_max_tokens?: number | null
          default_model?: string | null
          default_temperature?: number | null
          default_top_p?: number | null
          deleted_at?: string | null
          description?: string | null
          enabled_for_document_extraction?: boolean | null
          enabled_for_email_generation?: boolean | null
          enabled_for_matching?: boolean | null
          enabled_for_reporting?: boolean | null
          estimated_monthly_cost?: number | null
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          is_default?: boolean | null
          last_test_at?: string | null
          last_test_error?: string | null
          last_usage_reset_date?: string | null
          last_used_at?: string | null
          monthly_request_limit?: number | null
          organization_id?: string | null
          provider_id: string
          rate_limit_settings?: Json | null
          retry_settings?: Json | null
          tenant_id: string
          timeout_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_monthly_cost?: number | null
          allowed_functions?: string[] | null
          api_base_url?: string | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          api_version?: string | null
          available_models?: string[] | null
          config_name?: string
          connection_status?: string | null
          cost_currency?: string | null
          cost_tracking_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          current_day_usage?: number | null
          current_month_usage?: number | null
          custom_parameters?: Json | null
          daily_request_limit?: number | null
          default_max_tokens?: number | null
          default_model?: string | null
          default_temperature?: number | null
          default_top_p?: number | null
          deleted_at?: string | null
          description?: string | null
          enabled_for_document_extraction?: boolean | null
          enabled_for_email_generation?: boolean | null
          enabled_for_matching?: boolean | null
          enabled_for_reporting?: boolean | null
          estimated_monthly_cost?: number | null
          id?: string
          ip_whitelist?: string[] | null
          is_active?: boolean | null
          is_default?: boolean | null
          last_test_at?: string | null
          last_test_error?: string | null
          last_usage_reset_date?: string | null
          last_used_at?: string | null
          monthly_request_limit?: number | null
          organization_id?: string | null
          provider_id?: string
          rate_limit_settings?: Json | null
          retry_settings?: Json | null
          tenant_id?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ai_configurations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ai_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ai_configurations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_user_tenant_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_tenants: {
        Args: Record<PropertyKey, never>
        Returns: {
          tenant_id: string
          tenant_name: string
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          user_role: Database["public"]["Enums"]["user_role"]
          is_default: boolean
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_tenant_permission: {
        Args: {
          _tenant_id: string
          _permission: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      reset_daily_ai_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_ai_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      test_ai_configuration: {
        Args: { config_id: string }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      tenant_type: "individual" | "enterprise" | "company"
      user_role:
        | "owner"
        | "admin"
        | "member"
        | "viewer"
        | "test_user"
        | "developer"
        | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tenant_type: ["individual", "enterprise", "company"],
      user_role: [
        "owner",
        "admin",
        "member",
        "viewer",
        "test_user",
        "developer",
        "manager",
      ],
    },
  },
} as const
