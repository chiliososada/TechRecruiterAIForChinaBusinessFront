import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { emailTemplateService } from '@/services/emailTemplateService';

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject_template: string;
  body_template_text: string;
  signature_template?: string;
  multi_engineer_format?: 'individual' | 'table' | 'summary' | 'categorized';
  engineer_block_template?: string;
  table_header_template?: string;
  table_row_template?: string;
  summary_block_template?: string;
  category_block_template?: string;
}

export const useBulkEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useAuth();

  const fetchTemplates = async () => {
    if (!currentTenant?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch templates for engineer introduction and multi-engineer introduction
      const engineerTemplates = await emailTemplateService.getTemplatesByCategory(
        currentTenant.id,
        'engineer_introduction'
      );

      const multiEngineerTemplates = await emailTemplateService.getTemplatesByCategory(
        currentTenant.id,
        'multi_engineer_introduction'
      );

      // Combine both types
      const allTemplates = [...engineerTemplates, ...multiEngineerTemplates];
      
      // Transform to match our interface
      const transformedTemplates: EmailTemplate[] = allTemplates.map(template => ({
        id: template.id,
        name: template.name,
        category: template.category,
        subject_template: template.subject_template,
        body_template_text: template.body_template_text,
        signature_template: template.signature_template || undefined,
        // These fields would need to be added to the database schema for full multi-engineer support
        // For now, we'll use default values if not present
        multi_engineer_format: 'individual',
        engineer_block_template: undefined,
        table_header_template: undefined,
        table_row_template: undefined,
        summary_block_template: undefined,
        category_block_template: undefined,
      }));

      setTemplates(transformedTemplates);
    } catch (err) {
      console.error('テンプレート取得エラー:', err);
      setError('テンプレートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentTenant?.id]);

  return {
    templates,
    loading,
    error,
    refreshTemplates: fetchTemplates,
  };
};