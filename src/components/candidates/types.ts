
export interface Engineer {
  id: string;
  name: string;
  skills?: string[];
  japaneseLevel: string;
  experience: string;
  availability: string;
  status: string[];  // Changed to array to support multiple statuses
  remarks: string;   // Changed from desiredConditions to remarks
  companyType: string;
  companyName?: string;
  source: string;
  recommendation?: string;
  email?: string;
  phone?: string;
  nationality?: string; // New field
  age?: string;        // New field
  gender?: string;     // New field
  nearestStation?: string; // New field
  education?: string;  // New field
  arrivalYear?: string; // New field for when they came to Japan
  certifications?: string[]; // New field for qualifications
  englishLevel?: string; // New field
  technicalKeywords?: string[]; // New field
  selfPromotion?: string; // New field
  workScope?: string; // New field (manufacturing, testing, etc.)
  workExperience?: string; // New field (finance, insurance, etc.)
  managerName?: string; // 担当者名
  managerEmail?: string; // 担当者メール
  desiredRate?: string; // 希望単価
  resumeUrl?: string; // 履歴書ファイルURL
  resumeText?: string; // 履歴書テキスト内容
  resumeFileName?: string; // 履歴書ファイル名
  registeredAt: string;
  updatedAt: string;
}

export interface CategoryType {
  id: string;
  name: string;
}

export interface FiltersType {
  name: string;
  companyType: string;
  companyName: string;
  skills: string;
  experience: string;
  japaneseLevel: string;
  nationality: string; // Added nationality filter
  remarks: string;     // Changed from desiredConditions to remarks
  status: string;
}

export interface NewEngineerType {
  name: string;
  skills: string;
  japaneseLevel: string;
  englishLevel: string;
  experience: string;
  availability: string;
  status: string;
  nationality: string;
  age: string;
  gender: string;
  nearestStation: string;
  education: string;
  arrivalYear: string;
  certifications: string;
  remarks: string;
  companyType: string;
  companyName: string;
  source: string;
  selfPromotion: string;
  workScope: string;
  workExperience: string;
  email: string;
  phone: string;
  managerName: string; // 担当者名
  managerEmail: string; // 担当者メール
  desiredRate: string; // 希望単価
  resumeUrl?: string; // 履歴書ファイルURL
  resumeText?: string; // 履歴書テキスト内容
  resumeFileName?: string; // 履歴書ファイル名
  registeredAt: string;
  updatedAt: string;
}
