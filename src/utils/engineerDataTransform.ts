
import { DatabaseEngineer } from '@/hooks/useEngineers';
import { Engineer } from '@/components/candidates/types';

// Helper function to ensure array format
const ensureArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
};

// Helper function to convert empty strings to null for database constraints
const emptyStringToNull = (value: string | undefined | null): string | null => {
  if (!value || value.trim() === '') return null;
  return value;
};

// Helper function to convert string to number for database int fields
const stringToNumber = (value: string | undefined | null): number => {
  if (!value || value.trim() === '') return 0;
  const num = parseInt(value.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

// 将数据库engineer转换为UI engineer格式
export const transformDatabaseToUIEngineer = (dbEngineer: DatabaseEngineer): Engineer => {
  return {
    id: dbEngineer.id,
    name: dbEngineer.name,
    skills: ensureArray(dbEngineer.skills),
    japaneseLevel: dbEngineer.japanese_level || '',
    englishLevel: dbEngineer.english_level || '',
    experience: dbEngineer.experience,
    availability: dbEngineer.availability || '',
    status: dbEngineer.current_status ? [dbEngineer.current_status] : ['提案中'],
    remarks: dbEngineer.remarks || '',
    companyType: dbEngineer.company_type,
    companyName: dbEngineer.company_name || '',
    source: dbEngineer.source || 'manual',
    technicalKeywords: ensureArray(dbEngineer.technical_keywords),
    selfPromotion: dbEngineer.self_promotion || '',
    workScope: dbEngineer.work_scope || '',
    workExperience: dbEngineer.work_experience || '',
    nationality: dbEngineer.nationality || '',
    age: dbEngineer.age || '',
    gender: dbEngineer.gender || '',
    nearestStation: dbEngineer.nearest_station || '',
    education: dbEngineer.education || '',
    arrivalYear: dbEngineer.arrival_year_japan || '',
    certifications: ensureArray(dbEngineer.certifications),
    email: dbEngineer.email || '',
    phone: dbEngineer.phone || '',
    managerName: dbEngineer.manager_name || '',
    managerEmail: dbEngineer.manager_email || '',
    desiredRate: dbEngineer.desired_rate ? dbEngineer.desired_rate.toString() : '',
    resumeUrl: dbEngineer.resume_url || '',
    resumeText: dbEngineer.resume_text || '',
    resumeFileName: dbEngineer.resume_file_name || '',
    recommendation: dbEngineer.recommendation || '',
    registeredAt: new Date(dbEngineer.created_at).toLocaleDateString('ja-JP'),
    updatedAt: new Date(dbEngineer.updated_at).toLocaleDateString('ja-JP')
  };
};

// 将UI engineer转换为数据库格式
export const transformUIToDatabaseEngineer = (uiEngineer: any) => {
  console.log('=== transformUIToDatabaseEngineer Debug ===');
  console.log('Input uiEngineer.resumeUrl:', uiEngineer.resumeUrl);
  console.log('Input uiEngineer.resumeText:', uiEngineer.resumeText ? `${uiEngineer.resumeText.substring(0, 100)}...` : 'No text');
  
  // 处理状态值 - 确保使用正确的数据库状态值
  let dbStatus = '提案中'; // 默认状态
  if (uiEngineer.status) {
    if (Array.isArray(uiEngineer.status) && uiEngineer.status.length > 0) {
      dbStatus = uiEngineer.status[0];
    } else if (typeof uiEngineer.status === 'string') {
      dbStatus = uiEngineer.status;
    }
  }
  
  const transformedData = {
    name: uiEngineer.name,
    skills: ensureArray(uiEngineer.skills),
    japanese_level: emptyStringToNull(uiEngineer.japaneseLevel),
    english_level: emptyStringToNull(uiEngineer.englishLevel),
    experience: uiEngineer.experience,
    availability: emptyStringToNull(uiEngineer.availability),
    current_status: dbStatus,
    remarks: emptyStringToNull(uiEngineer.remarks),
    company_name: emptyStringToNull(uiEngineer.companyName),
    technical_keywords: [], // 已删除此字段，设为空数组
    self_promotion: emptyStringToNull(uiEngineer.selfPromotion),
    work_scope: emptyStringToNull(uiEngineer.workScope),
    work_experience: emptyStringToNull(uiEngineer.workExperience),
    nationality: emptyStringToNull(uiEngineer.nationality),
    age: emptyStringToNull(uiEngineer.age),
    gender: emptyStringToNull(uiEngineer.gender),
    nearest_station: emptyStringToNull(uiEngineer.nearestStation),
    education: emptyStringToNull(uiEngineer.education),
    arrival_year_japan: emptyStringToNull(uiEngineer.arrivalYear),
    certifications: ensureArray(uiEngineer.certifications),
    email: emptyStringToNull(uiEngineer.email),
    phone: emptyStringToNull(uiEngineer.phone),
    manager_name: emptyStringToNull(uiEngineer.managerName),
    manager_email: emptyStringToNull(uiEngineer.managerEmail),
    desired_rate: stringToNumber(uiEngineer.desiredRate),
    resume_url: uiEngineer.resumeUrl || null,
    resume_text: uiEngineer.resumeText || null,
    resume_file_name: uiEngineer.resumeFileName || null,
    recommendation: emptyStringToNull(uiEngineer.recommendation)
  };
  
  console.log('=== Output transformedData ===');
  console.log('Output resume_url:', transformedData.resume_url);
  console.log('Output resume_text:', transformedData.resume_text ? `${transformedData.resume_text.substring(0, 100)}...` : 'No text');
  
  return transformedData;
};
