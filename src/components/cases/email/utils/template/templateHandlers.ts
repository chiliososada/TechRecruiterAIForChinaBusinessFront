
import { MailCase, EmailTemplate, EMAIL_TEMPLATES } from '../../types';
import { Engineer } from '@/components/candidates/types';

// Update template placeholders in text
export const replacePlaceholders = (text: string, data: Record<string, any>) => {
  let result = text;
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    const value = data[key] !== undefined && data[key] !== null ? data[key] : '';
    result = result.replace(placeholder, value);
  });
  return result;
};

// Apply selected template to subject and body fields
export const applyTemplate = (templateId: string, data: { 
  selectedCases: MailCase[],
  selectedEngineers: Engineer[]
}) => {
  // Ensure templateId is valid and not empty
  if (!templateId || templateId === 'no-template') {
    return { 
      subject: '',
      body: '' 
    };
  }

  // Find the template by ID
  const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
  
  if (!template) {
    console.warn(`Template with ID ${templateId} not found`);
    return { 
      subject: '',
      body: '' 
    };
  }

  // Get the first case and engineer for placeholder replacement
  const firstCase = data.selectedCases && data.selectedCases.length > 0 ? data.selectedCases[0] : null;
  const firstEngineer = data.selectedEngineers && data.selectedEngineers.length > 0 ? data.selectedEngineers[0] : null;
  
  // Create placeholder data with safe defaults
  const placeholderData = {
    // Legacy placeholders for backward compatibility
    title: firstCase?.title || '',
    sender: firstCase?.sender || firstCase?.selectedSenderName || '',
    description: firstCase?.description || firstCase?.detailDescription || '',
    company: firstCase?.company || '',
    companyContact: 'AI採用担当',
    engineerName: firstEngineer?.name || '',
    engineerYears: firstEngineer?.experience || '',
    engineerSkills: firstEngineer?.skills ? (Array.isArray(firstEngineer.skills) ? firstEngineer.skills.join('、') : firstEngineer.skills) : '',
    
    // New standardized placeholders
    project_title: firstCase?.title || '',
    project_description: firstCase?.description || firstCase?.detailDescription || '',
    project_skills: firstCase?.skills ? (Array.isArray(firstCase.skills) ? firstCase.skills.join('、') : firstCase.skills) : '',
    project_location: firstCase?.location || '',
    project_budget: firstCase?.budget || '',
    project_duration: firstCase?.duration || '',
    project_start_date: firstCase?.startDate || '',
    project_japanese_level: firstCase?.japaneseLevel || '',
    project_experience: firstCase?.experience || '',
    project_key_technologies: firstCase?.keyTechnologies || '',
    project_work_type: firstCase?.workType || '',
    project_max_candidates: firstCase?.maxCandidates?.toString() || '',
    
    engineer_name: firstEngineer?.name || '',
    engineer_email: firstEngineer?.email || '',
    engineer_skills: firstEngineer?.skills ? (Array.isArray(firstEngineer.skills) ? firstEngineer.skills.join('、') : firstEngineer.skills) : '',
    engineer_experience: firstEngineer?.experience || '',
    engineer_japanese_level: firstEngineer?.japaneseLevel || '',
    engineer_nearest_station: firstEngineer?.nearestStation || '',
    engineer_desired_rate: firstEngineer?.desiredRate || '',
    engineer_availability: firstEngineer?.availability || '',
    engineer_nationality: firstEngineer?.nationality || '',
    engineer_education: firstEngineer?.education || '',
    engineer_certifications: firstEngineer?.certifications ? (Array.isArray(firstEngineer.certifications) ? firstEngineer.certifications.join('、') : firstEngineer.certifications) : '',
    engineer_self_promotion: firstEngineer?.selfPromotion || ''
  };
  
  // Replace placeholders
  const subject = replacePlaceholders(template.subject, placeholderData);
  const body = replacePlaceholders(template.body, placeholderData);
  
  return { subject, body };
};

// Handle template change
export const handleTemplateChange = (
  templateId: string,
  setSelectedTemplate: (template: string) => void,
  setSubject: (subject: string) => void,
  setEmailBody: (body: string) => void
) => {
  setSelectedTemplate(templateId);
  
  const { subject, body } = applyTemplate(templateId, {
    selectedCases: [],
    selectedEngineers: []
  });
  
  setSubject(subject);
  setEmailBody(body);
};

// Create template handlers
export const createTemplateHandlers = ({
  setSelectedTemplate,
  setSubject,
  setEmailBody
}: {
  setSelectedTemplate: (template: string) => void;
  setSubject: (subject: string) => void;
  setEmailBody: (body: string) => void;
}) => {
  return {
    handleTemplateChange: (templateId: string) => 
      handleTemplateChange(templateId, setSelectedTemplate, setSubject, setEmailBody)
  };
};
