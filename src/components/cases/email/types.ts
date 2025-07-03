
export interface MailCase {
  id: string;
  title?: string;
  company?: string;
  skills?: string[];
  senders?: {
    name?: string;
    email?: string;
    position?: string;
  }[];
  sender?: string;
  senderName?: string;
  senderEmail?: string;
  keyTechnologies?: string;
  registrationType?: string;
  registeredAt?: string;
  selectedRowId?: string;
  selectedSenderName?: string;
  selectedSenderEmail?: string;
  selectedSenderPosition?: string;
  startDate?: string;
  description?: string; // Added missing description property
  
  // Add the missing properties used in the codebase
  status?: string;
  location?: string;
  budget?: string;
  desiredBudget?: string;
  interviewCount?: string;
  foreignerAccepted?: boolean;
  freelancerAccepted?: boolean;
  processes?: string[];
  detailDescription?: string;
  createdAt?: string;
  manager?: string;
  managerEmail?: string;
  experience?: string;
  workType?: string;
  duration?: string;
  japanese?: string;
  priority?: string;
  source?: string;
  receivedDate?: string;
  japaneseLevel?: string;
  maxCandidates?: number;
}

export interface Engineer {
  id: string;
  name: string;
  skills: string[] | string;
  experience: string;
  currentStatus?: string;
  company?: string;
  
  // Add the missing properties used in components
  status?: string[] | string;
  japaneseLevel?: string;
  availability?: string;
  remarks?: string;
  companyType?: string;
  companyName?: string;
  source?: string;
  recommendation?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  age?: string;
  gender?: string;
  nearestStation?: string;
  education?: string;
  arrivalYear?: string;
  certifications?: string[];
  englishLevel?: string;
  technicalKeywords?: string[];
  selfPromotion?: string;
  workScope?: string;
  workExperience?: string;
  registeredAt?: string;
  updatedAt?: string;
  isActive?: boolean; // Add the isActive property to match database structure
  resumeUrl?: string; // 履歴書ファイルのURL
  desiredRate?: string; // 希望単価
}

// Define EmailTemplate interface
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
}

// Add email templates array
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'intro',
    name: '案件紹介テンプレート',
    subject: '【案件紹介】{{title}} - {{company}}',
    body: `お世話になっております。

{{companyContact}}と申します。

以下の案件をご紹介させていただきます。

【案件名】{{title}}
【会社名】{{company}}
【案件概要】
{{description}}

ご検討いただけますと幸いです。
よろしくお願いいたします。`,
    description: '基本的な案件紹介用テンプレート'
  },
  {
    id: 'engineer-intro',
    name: 'エンジニア紹介テンプレート',
    subject: '【エンジニア紹介】{{engineerName}} - {{title}}案件',
    body: `お世話になっております。

{{companyContact}}と申します。

{{title}}案件について、以下のエンジニアを紹介させていただきます。

【エンジニア名】{{engineerName}}
【スキル】{{engineerSkills}}
【経験年数】{{engineerYears}}

ご検討いただけますと幸いです。
よろしくお願いいたします。`,
    description: 'エンジニア紹介用テンプレート'
  },
  {
    id: 'follow-up',
    name: 'フォローアップテンプレート',
    subject: 'Re: 【案件紹介】{{title}} - フォローアップ',
    body: `{{sender}}様

お世話になっております。
先日ご連絡いたしました、{{title}}案件についてフォローアップのご連絡をさせていただきます。

案件についてご検討いただけましたでしょうか？
ご質問などございましたら、お気軽にお問い合わせください。

よろしくお願いいたします。`,
    description: 'フォローアップ用テンプレート'
  }
];
