import { Engineer } from '@/components/candidates/types';
import { EmailTemplate } from '../hooks/useEmailTemplates';

/**
 * Apply template placeholders for single or multiple engineers
 */
export const applyTemplateWithEngineers = (
  template: EmailTemplate,
  engineers: Engineer[],
  additionalData?: Record<string, string>
): { subject: string; body: string; signature: string } => {
  const engineerCount = engineers.length;
  
  // Prepare basic placeholder data
  const placeholderData: Record<string, string> = {
    // Engineer count and names
    engineer_count: engineerCount.toString(),
    engineer_names: engineers.map(eng => eng.name).join('、'),
    
    // Main skills (combined from all engineers)
    main_skills: extractMainSkills(engineers),
    
    // Experience range
    experience_range: extractExperienceRange(engineers),
    
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
【経験年数】${engineer.experience || ''}
【日本語レベル】${engineer.japaneseLevel || ''}
【最寄り駅】${engineer.nearestStation || ''}
【希望単価】${formatDesiredRate(engineer)}
【稼働可能日】${engineer.availability || ''}`;
  }).join('\n\n');
};

/**
 * Generate engineer table (tab-separated for email)
 */
const generateEngineerTable = (engineers: Engineer[]): string => {
  const header = '技術者名\tスキル\t経験年数\t日本語レベル\t希望単価';
  const rows = engineers.map(engineer => {
    return [
      engineer.name,
      formatSkills(engineer.skills),
      engineer.experience || '',
      engineer.japaneseLevel || '',
      formatDesiredRate(engineer)
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
  経験：${engineer.experience || ''}、日本語：${engineer.japaneseLevel || ''}
  最寄り駅：${engineer.nearestStation || ''}、希望単価：${formatDesiredRate(engineer)}
  稼働可能日：${engineer.availability || ''}`;
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
  // This would need to be implemented based on your engineer data structure
  // For now, return empty string as this field might not be available
  return '';
};

/**
 * Format certifications for display
 */
const formatCertifications = (certifications: string[] | undefined): string => {
  if (Array.isArray(certifications)) {
    return certifications.join(', ');
  }
  return '';
};