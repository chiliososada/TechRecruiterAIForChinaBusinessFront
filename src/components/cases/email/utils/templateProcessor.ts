import { Engineer } from '@/components/candidates/types';
import { EmailTemplate } from '../hooks/useEmailTemplates';
import { ProjectRow } from '@/integrations/supabase/business-types';

/**
 * Apply template placeholders with engineers and projects
 */
export const applyTemplateWithData = (
  template: EmailTemplate,
  data: {
    engineers?: Engineer[];
    projects?: ProjectRow[];
    additionalData?: Record<string, string>;
  }
): { subject: string; body: string; signature: string } => {
  const engineers = data.engineers || [];
  const projects = data.projects || [];
  const additionalData = data.additionalData || {};
  
  const engineerCount = engineers.length;
  const project = projects.length > 0 ? projects[0] : null;
  
  // Prepare basic placeholder data
  const placeholderData: Record<string, string> = {
    // Engineer count and names
    engineer_count: engineerCount.toString(),
    engineer_names: engineers.map(eng => eng.name).join('、'),
    
    // Main skills (combined from all engineers)
    main_skills: extractMainSkills(engineers),
    
    // Experience range
    experience_range: extractExperienceRange(engineers),
    
    // Project data placeholders
    project_title: project?.title || '',
    project_description: project?.description || project?.detail_description || '',
    project_skills: formatProjectSkills(project?.skills),
    project_location: project?.location || '',
    project_budget: project?.budget || project?.desired_budget || '',
    project_duration: project?.duration || '',
    project_start_date: formatDate(project?.start_date),
    project_japanese_level: project?.japanese_level || '',
    project_experience: project?.experience || '',
    project_key_technologies: project?.key_technologies || '',
    project_work_type: project?.work_type || '',
    project_max_candidates: project?.max_candidates?.toString() || '',
    
    // Apply additional data if provided
    ...additionalData,
  };

  // Generate detailed engineer information based on template category and count
  if (template.category === 'multi_engineer_introduction' && engineerCount > 1) {
    // Multi-engineer template placeholders
    placeholderData.engineer_list_detailed = generateDetailedEngineerList(engineers);
    placeholderData.engineer_table = generateEngineerTable(engineers);
    placeholderData.engineer_list_summary = generateSummaryEngineerList(engineers);
    placeholderData.engineer_categories = generateCategorizedEngineerList(engineers);
  } else {
    // Single engineer template placeholders
    if (engineers.length > 0) {
      const engineer = engineers[0];
      placeholderData.engineer_name = engineer.name;
      placeholderData.engineer_email = engineer.email || '';
      placeholderData.engineer_skills = formatSkills(engineer.skills);
      placeholderData.engineer_experience = engineer.experience || '';
      placeholderData.engineer_japanese_level = engineer.japaneseLevel || '';
      placeholderData.engineer_nearest_station = engineer.nearestStation || '';
      placeholderData.engineer_desired_rate = formatDesiredRate(engineer);
      placeholderData.engineer_availability = engineer.availability || '';
      placeholderData.engineer_nationality = engineer.nationality || '';
      placeholderData.engineer_education = engineer.education || '';
      placeholderData.engineer_certifications = formatCertifications(engineer.certifications);
      placeholderData.engineer_self_promotion = engineer.selfPromotion || '';
    }
  }

  // Apply placeholders to template fields
  const subject = replacePlaceholders(template.subject_template, placeholderData);
  const body = replacePlaceholders(template.body_template_text, placeholderData);
  const signature = template.signature_template 
    ? replacePlaceholders(template.signature_template, placeholderData)
    : '';

  return { subject, body, signature };
};

/**
 * Apply template placeholders for single or multiple engineers (legacy function)
 */
export const applyTemplateWithEngineers = (
  template: EmailTemplate,
  engineers: Engineer[],
  additionalData?: Record<string, string>
): { subject: string; body: string; signature: string } => {
  return applyTemplateWithData(template, { engineers, additionalData });
};

/**
 * Format project skills for display
 */
const formatProjectSkills = (skills: string[] | undefined): string => {
  if (Array.isArray(skills)) {
    return skills.join(', ');
  }
  return '';
};

/**
 * Format date for display
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ja-JP');
  } catch {
    return '';
  }
};

/**
 * Replace placeholders in text with actual values
 */
const replacePlaceholders = (text: string, data: Record<string, string>): string => {
  let result = text;
  
  // Replace each placeholder
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return result;
};

/**
 * Extract main skills from all engineers
 */
const extractMainSkills = (engineers: Engineer[]): string => {
  const allSkills = new Set<string>();
  
  engineers.forEach(engineer => {
    const skills = engineer.skills || [];
    skills.forEach(skill => allSkills.add(skill));
  });
  
  return Array.from(allSkills).slice(0, 5).join(', '); // Top 5 skills
};

/**
 * Extract experience range from all engineers
 */
const extractExperienceRange = (engineers: Engineer[]): string => {
  const experiences = engineers
    .map(eng => eng.experience)
    .filter(exp => exp)
    .map(exp => {
      const match = exp.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(years => years > 0);
  
  if (experiences.length === 0) return '';
  
  const min = Math.min(...experiences);
  const max = Math.max(...experiences);
  
  return min === max ? `${min}年` : `${min}〜${max}年`;
};

/**
 * Generate detailed engineer list
 */
const generateDetailedEngineerList = (engineers: Engineer[]): string => {
  return engineers.map((engineer, index) => {
    return `【技術者${index + 1}】
【技術者名】${engineer.name}
【スキル】${formatSkills(engineer.skills)}
【経験年数】${engineer.experience || '未設定'}
【日本語レベル】${engineer.japaneseLevel || '未設定'}
【最寄り駅】${engineer.nearestStation || '未設定'}
【希望単価】${formatDesiredRate(engineer)}
【稼働可能日】${engineer.availability || '未設定'}
【国籍】${engineer.nationality || '未設定'}
【学歴】${engineer.education || '未設定'}
【資格】${formatCertifications(engineer.certifications)}`;
  }).join('\n\n');
};

/**
 * Generate engineer table (tab-separated for email)
 */
const generateEngineerTable = (engineers: Engineer[]): string => {
  const header = '技術者名\tスキル\t経験年数\t日本語レベル\t希望単価\t最寄り駅\t国籍';
  const rows = engineers.map(engineer => {
    return [
      engineer.name,
      formatSkills(engineer.skills),
      engineer.experience || '未設定',
      engineer.japaneseLevel || '未設定',
      formatDesiredRate(engineer),
      engineer.nearestStation || '未設定',
      engineer.nationality || '未設定'
    ].join('\t');
  });
  
  return [header, ...rows].join('\n');
};

/**
 * Generate summary engineer list
 */
const generateSummaryEngineerList = (engineers: Engineer[]): string => {
  return engineers.map(engineer => {
    return `・${engineer.name}
  スキル：${formatSkills(engineer.skills)}
  経験：${engineer.experience || '未設定'}、日本語：${engineer.japaneseLevel || '未設定'}
  最寄り駅：${engineer.nearestStation || '未設定'}、希望単価：${formatDesiredRate(engineer)}
  稼働可能日：${engineer.availability || '未設定'}、国籍：${engineer.nationality || '未設定'}`;
  }).join('\n\n');
};

/**
 * Generate categorized engineer list
 */
const generateCategorizedEngineerList = (engineers: Engineer[]): string => {
  // Group engineers by their main skill category
  const categories: Record<string, Engineer[]> = {};
  
  engineers.forEach(engineer => {
    const skills = engineer.skills || [];
    const mainSkill = skills[0] || 'その他';
    const category = determineSkillCategory(mainSkill);
    
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(engineer);
  });
  
  // Format categorized list
  return Object.entries(categories).map(([category, categoryEngineers]) => {
    const engineerList = categoryEngineers.map(eng => eng.name).join('、');
    return `【${category}系エンジニア】\n${engineerList}`;
  }).join('\n\n');
};

/**
 * Determine skill category from skill name
 */
const determineSkillCategory = (skill: string): string => {
  const skill_lower = skill.toLowerCase();
  
  if (skill_lower.includes('java') || skill_lower.includes('spring')) return 'Java';
  if (skill_lower.includes('python') || skill_lower.includes('django')) return 'Python';
  if (skill_lower.includes('javascript') || skill_lower.includes('react') || skill_lower.includes('vue') || skill_lower.includes('node')) return 'JavaScript';
  if (skill_lower.includes('php') || skill_lower.includes('laravel')) return 'PHP';
  if (skill_lower.includes('ruby') || skill_lower.includes('rails')) return 'Ruby';
  if (skill_lower.includes('c#') || skill_lower.includes('.net')) return 'C#';
  if (skill_lower.includes('go') || skill_lower.includes('golang')) return 'Go';
  if (skill_lower.includes('swift') || skill_lower.includes('ios')) return 'iOS';
  if (skill_lower.includes('kotlin') || skill_lower.includes('android')) return 'Android';
  if (skill_lower.includes('aws') || skill_lower.includes('azure') || skill_lower.includes('docker')) return 'インフラ';
  
  return 'その他';
};

/**
 * Format skills for display
 */
const formatSkills = (skills: string[] | undefined): string => {
  if (skills && Array.isArray(skills)) {
    return skills.join(', ');
  }
  return '';
};

/**
 * Format desired rate for display
 */
const formatDesiredRate = (engineer: Engineer): string => {
  // UI型のengineerの場合（candidates/types.tsのEngineer型）
  if (engineer.desiredRate) {
    // 既に数字と単位が含まれている場合はそのまま返す
    if (engineer.desiredRate.includes('円')) {
      return engineer.desiredRate;
    }
    // 数字のみの場合は単位を追加
    const rate = parseInt(engineer.desiredRate.replace(/[^\d]/g, ''));
    return rate > 0 ? `${rate.toLocaleString()}円/月` : '';
  }
  
  // DB型のengineerの場合（最小値・最大値対応）
  const minRate = (engineer as any).desired_rate_min;
  const maxRate = (engineer as any).desired_rate_max;
  const singleRate = (engineer as any).desired_rate;
  
  // 最小値と最大値の両方がある場合
  if (minRate && maxRate && minRate !== maxRate) {
    return `${minRate.toLocaleString()}〜${maxRate.toLocaleString()}円/月`;
  }
  // 最小値のみまたは最小値と最大値が同じ場合
  else if (minRate) {
    return `${minRate.toLocaleString()}円/月`;
  }
  // 最大値のみの場合
  else if (maxRate) {
    return `${maxRate.toLocaleString()}円/月`;
  }
  // 単一値の場合
  else if (singleRate) {
    return `${singleRate.toLocaleString()}円/月`;
  }
  
  return '未設定';
};

/**
 * Format certifications for display
 */
const formatCertifications = (certifications: string[] | undefined | null): string => {
  if (Array.isArray(certifications) && certifications.length > 0) {
    // 空文字列や null 値を除外
    const validCertifications = certifications.filter(cert => cert && cert.trim() !== '');
    return validCertifications.length > 0 ? validCertifications.join('、') : '未設定';
  }
  return '未設定';
};