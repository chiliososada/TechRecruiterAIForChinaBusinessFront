// Sample data for batch matching

export interface ProjectInfo {
  name: string;
  duration: string;
  role: string;
  startDate?: string;
  endDate?: string;
  workScope?: string[];
  nearestStation?: string;
}

export interface CandidateDetail {
  id?: string | number;
  name?: string;
  company?: string;
  skills?: string[] | string;
  experience?: string;
  japaneseLevel?: string;
  englishLevel?: string;
  availableFrom?: string;
  preferredWorkLocation?: string;
  hourlyRate?: string;
  manager?: string;
  managerEmail?: string;
  bio?: string;
  projects?: ProjectInfo[];
  nationality?: string;
  age?: string;
  gender?: string;
}

export interface CaseDetail {
  id: string | number;
  name: string;
  company: string;
  location?: string;
  skills: string[] | string;
  rate?: string;
  matchScore?: number;
  manager?: string;
  managerEmail?: string;
  detailDescription?: string;
  priority?: string;
  workType?: string;
  experienceRequired?: string;
  budget?: string;
}

export interface MatchingResult {
  id: string;
  caseName: string;
  caseCompany: string;
  candidateName: string;
  candidateCompany: string;
  matchingRate: string;
  skills: string[];
  experience: string;
  caseManager: string;
  caseManagerEmail: string;
  affiliationManager: string;
  affiliationManagerEmail: string;
  memo?: string;
  matchingReason?: string;
  nationality?: string;
  age?: string;
  gender?: string;
}

export const combinedMatchingResults: MatchingResult[] = [
  {
    id: "1",
    caseName: 'XX証券向けシステム開発',
    caseCompany: '株式会社A',
    candidateName: '山田太郎',
    candidateCompany: '技術者株式会社X',
    matchingRate: "92%",
    skills: ['Java', 'Spring Boot', 'AWS'],
    experience: '10年',
    caseManager: '佐藤部長',
    caseManagerEmail: 'sato@companyA.co.jp',
    affiliationManager: '鈴木課長',
    affiliationManagerEmail: 'suzuki@companyX.co.jp',
    memo: 'システム開発経験あり',
    matchingReason: 'JavaとSpring Boot経験が10年以上あり、案件に必要なスキルと経験年数が一致しています',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
  },
  {
    id: "2",
    caseName: 'ECサイト開発案件',
    caseCompany: '株式会社B',
    candidateName: '佐藤花子',
    candidateCompany: '技術者株式会社Y',
    matchingRate: "88%",
    skills: ['React', 'TypeScript', 'AWS'],
    experience: '7年',
    caseManager: '田中部長',
    caseManagerEmail: 'tanaka@companyB.co.jp',
    affiliationManager: '高橋課長',
    affiliationManagerEmail: 'takahashi@companyY.co.jp',
    memo: 'フロントエンド専門',
    matchingReason: 'React、TypeScript経験が豊富で、ECサイト開発経験あり',
    nationality: '中国',
    age: '32歳',
    gender: '女性',
  },
  {
    id: "3",
    caseName: '物流管理システム構築',
    caseCompany: '株式会社C',
    candidateName: '鈴木一郎',
    candidateCompany: '技術者株式会社Z',
    matchingRate: "85%",
    skills: ['Python', 'Django', 'PostgreSQL'],
    experience: '5年',
    caseManager: '渡辺部長',
    caseManagerEmail: 'watanabe@companyC.co.jp',
    affiliationManager: '伊藤課長',
    affiliationManagerEmail: 'ito@companyZ.co.jp',
    memo: 'バックエンド専門',
  },
  {
    id: "4",
    caseName: 'クラウド移行プロジェクト',
    caseCompany: '株式会社D',
    candidateName: '高橋次郎',
    candidateCompany: '技術者株式会社W',
    matchingRate: "90%",
    skills: ['AWS', 'Terraform', 'Docker'],
    experience: '8年',
    caseManager: '山本部長',
    caseManagerEmail: 'yamamoto@companyD.co.jp',
    affiliationManager: '中村課長',
    affiliationManagerEmail: 'nakamura@companyW.co.jp',
    memo: 'クラウド移行経験豊富',
  },
  {
    id: "5",
    caseName: 'AI推薦システム開発',
    caseCompany: '株式会社E',
    candidateName: '渡辺三郎',
    candidateCompany: '技術者株式会社V',
    matchingRate: "87%",
    skills: ['Python', 'TensorFlow', 'AWS'],
    experience: '6年',
    caseManager: '小林部長',
    caseManagerEmail: 'kobayashi@companyE.co.jp', 
    affiliationManager: '加藤課長',
    affiliationManagerEmail: 'kato@companyV.co.jp',
    memo: 'AI開発経験あり',
  },
  {
    id: "6",
    caseName: 'XX証券向けシステム開発',
    caseCompany: '株式会社A',
    candidateName: '伊藤健太',
    candidateCompany: '技術者株式会社U',
    matchingRate: "84%",
    skills: ['Java', 'Spring Boot', 'Oracle'],
    experience: '8年',
    caseManager: '佐藤部長',
    caseManagerEmail: 'sato@companyA.co.jp',
    affiliationManager: '吉田課長',
    affiliationManagerEmail: 'yoshida@companyU.co.jp',
    memo: 'Java専門',
  },
  {
    id: "7",
    caseName: 'ECサイト開発案件',
    caseCompany: '株式会社B',
    candidateName: '佐々木隆',
    candidateCompany: '技術者株式会社T',
    matchingRate: "83%",
    skills: ['React', 'Next.js', 'GraphQL'],
    experience: '6年',
    caseManager: '田中部長',
    caseManagerEmail: 'tanaka@companyB.co.jp',
    affiliationManager: '山田課長',
    affiliationManagerEmail: 'yamada@companyT.co.jp',
    memo: 'フロントエンド設計得意',
  }
];

export const caseDetails: CaseDetail[] = [
  {
    id: "1",
    name: 'XX証券向けシステム開発',
    company: '株式会社A',
    location: '東京（リモート可）',
    skills: ['Java', 'Spring Boot', 'AWS'],
    rate: '70万円/月',
    matchScore: 95,
    manager: '佐藤部長',
    managerEmail: 'sato@companyA.co.jp',
    detailDescription: '金融機関向けシステム開発案件です。Javaを使用したバックエンド開発を担当していただきます。Spring Bootのフレームワークを使用し、AWSでのデプロイも含まれます。開発期間は約6ヶ月を予定しています。',
    priority: 'high',
    workType: 'ハイブリッド',
    experienceRequired: '5年以上',
    budget: '65-75万円/月',
  },
  {
    id: "2",
    name: 'ECサイト開発案件',
    company: '株式会社B',
    location: '大阪（リモート可）',
    skills: ['React', 'TypeScript', 'AWS'],
    rate: '65万円/月',
    matchScore: 87,
    manager: '田中部長',
    managerEmail: 'tanaka@companyB.co.jp',
  },
  {
    id: "3",
    name: '物流管理システム構築',
    company: '株式会社C',
    location: '東京（リモート可）',
    skills: ['Python', 'Django', 'PostgreSQL'],
    rate: '60万円/月',
    matchScore: 80,
    manager: '渡辺部長',
    managerEmail: 'watanabe@companyC.co.jp',
  },
  {
    id: "4",
    name: 'クラウド移行プロジェクト',
    company: '株式会社D',
    location: '東京（リモート可）',
    skills: ['AWS', 'Terraform', 'Docker'],
    rate: '70万円/月',
    matchScore: 85,
    manager: '山本部長',
    managerEmail: 'yamamoto@companyD.co.jp',
  },
  {
    id: "5",
    name: 'AI推薦システム開発',
    company: '株式会社E',
    location: '大阪（リモート可）',
    skills: ['Python', 'TensorFlow', 'AWS'],
    rate: '75万円/月',
    matchScore: 90,
    manager: '小林部長',
    managerEmail: 'kobayashi@companyE.co.jp',
  },
  {
    id: "6",
    name: 'XX証券向けシステム開発',  // Same case as ID 1, different candidate
    company: '株式会社A',
    location: '東京（リモート可）',
    skills: ['Java', 'Spring Boot', 'Oracle'],
    rate: '60万円/月',
    matchScore: 85,
    manager: '佐藤部長',
    managerEmail: 'sato@companyA.co.jp',
  },
  {
    id: "7",
    name: 'ECサイト開発案件',  // Same case as ID 2, different candidate
    company: '株式会社B',
    location: '大阪（リモート可）',
    skills: ['React', 'Next.js', 'GraphQL'],
    rate: '60万円/月',
    matchScore: 80,
    manager: '田中部長',
    managerEmail: 'tanaka@companyB.co.jp',
  }
];

export const candidateDetails: CandidateDetail[] = [
  {
    id: "u1",
    name: '山田太郎',
    company: '技術者株式会社X',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
    experience: '10年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-07-01',
    preferredWorkLocation: '東京・リモート',
    hourlyRate: '7,000円',
    manager: '鈴木課長',
    managerEmail: 'suzuki@companyX.co.jp',
    bio: 'バックエンド開発とクラウドインフラ構築を専門としています。金融系システムの開発経験が豊富です。',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
    projects: [
      { 
        name: '大手銀行システム統合', 
        duration: '2年', 
        role: 'バックエンドリード',
        startDate: '2022-04-01',
        endDate: '2024-03-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        nearestStation: '東京駅'
      },
      { 
        name: '証券取引プラットフォーム', 
        duration: '1.5年', 
        role: 'フルスタック開発者',
        startDate: '2020-10-01',
        endDate: '2022-03-31',
        workScope: ['詳細設計', '実装', 'テスト'],
        nearestStation: '新宿駅'
      }
    ]
  },
  {
    id: "u2",
    name: '佐藤花子',
    company: '技術者株式会社Y',
    skills: ['React', 'TypeScript', 'AWS'],
    experience: '7年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-08-01',
    preferredWorkLocation: '大阪・リモート',
    hourlyRate: '6,000円',
    manager: '高橋課長',
    managerEmail: 'takahashi@companyY.co.jp',
    bio: 'フロントエンド開発を専門としています。ECサイト開発経験が豊富です。',
    nationality: '中国',
    age: '32歳',
    gender: '女性',
    projects: [
      { 
        name: 'ECサイトリニューアル', 
        duration: '1年', 
        role: 'フロントエンドリード',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装'],
        nearestStation: '梅田駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'フロントエンド開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  },
  {
    id: "u3",
    name: '鈴木一郎',
    company: '技術者株式会社Z',
    skills: ['Python', 'Django', 'PostgreSQL'],
    experience: '5年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-09-01',
    preferredWorkLocation: '東京・リモート',
    hourlyRate: '5,000円',
    manager: '伊藤課長',
    managerEmail: 'ito@companyZ.co.jp',
    bio: 'バックエンド開発を専門としています。物流管理システムの開発経験が豊富です。',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
    projects: [
      { 
        name: '物流管理システム構築', 
        duration: '2年', 
        role: 'バックエンドリード',
        startDate: '2022-04-01',
        endDate: '2024-03-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        nearestStation: '東京駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'バックエンド開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  },
  {
    id: "u4",
    name: '高橋次郎',
    company: '技術者株式会社W',
    skills: ['AWS', 'Terraform', 'Docker'],
    experience: '8年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-10-01',
    preferredWorkLocation: '東京・リモート',
    hourlyRate: '6,000円',
    manager: '中村課長',
    managerEmail: 'nakamura@companyW.co.jp',
    bio: 'クラウドインフラ構築を専門としています。クラウド移行プロジェクトの開発経験が豊富です。',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
    projects: [
      { 
        name: 'クラウド移行プロジェクト', 
        duration: '2年', 
        role: 'クラウドインフラリード',
        startDate: '2022-04-01',
        endDate: '2024-03-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        nearestStation: '東京駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'クラウドインフラ開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  },
  {
    id: "u5",
    name: '渡辺三郎',
    company: '技術者株式会社V',
    skills: ['Python', 'TensorFlow', 'AWS'],
    experience: '6年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-11-01',
    preferredWorkLocation: '大阪・リモート',
    hourlyRate: '7,000円',
    manager: '加藤課長',
    managerEmail: 'kato@companyV.co.jp',
    bio: 'AI開発を専門としています。AI推薦システムの開発経験が豊富です。',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
    projects: [
      { 
        name: 'AI推薦システム開発', 
        duration: '2年', 
        role: 'AI開発リード',
        startDate: '2022-04-01',
        endDate: '2024-03-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        nearestStation: '東京駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'AI開発開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  },
  {
    id: "u6",
    name: '伊藤健太',
    company: '技術者株式会社U',
    skills: ['Java', 'Spring Boot', 'Oracle'],
    experience: '8年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2024-12-01',
    preferredWorkLocation: '東京・リモート',
    hourlyRate: '6,000円',
    manager: '吉田課長',
    managerEmail: 'yoshida@companyU.co.jp',
    bio: 'Java開発を専門としています。システム開発経験が豊富です。',
    nationality: '日本',
    age: '35歳',
    gender: '男性',
    projects: [
      { 
        name: 'システム開発', 
        duration: '2年', 
        role: 'システム開発リード',
        startDate: '2022-04-01',
        endDate: '2024-03-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装', 'テスト'],
        nearestStation: '東京駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'システム開発開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  },
  {
    id: "u7",
    name: '佐々木隆',
    company: '技術者株式会社T',
    skills: ['React', 'Next.js', 'GraphQL'],
    experience: '6年',
    japaneseLevel: 'ネイティブ',
    englishLevel: 'ビジネスレベル',
    availableFrom: '2025-01-01',
    preferredWorkLocation: '大阪・リモート',
    hourlyRate: '5,000円',
    manager: '山田課長',
    managerEmail: 'yamada@companyT.co.jp',
    bio: 'フロントエンド開発を専門としています。ECサイト開発経験が豊富です。',
    nationality: '中国',
    age: '32歳',
    gender: '女性',
    projects: [
      { 
        name: 'ECサイト開発案件', 
        duration: '2年', 
        role: 'フロントエンドリード',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        workScope: ['要件定義', '基本設計', '詳細設計', '実装'],
        nearestStation: '梅田駅'
      },
      { 
        name: 'AIコンサルティング', 
        duration: '0.5年', 
        role: 'フロントエンド開発者',
        startDate: '2022-07-01',
        endDate: '2022-12-31',
        workScope: ['実装', 'テスト'],
        nearestStation: '難波駅'
      }
    ]
  }
];
