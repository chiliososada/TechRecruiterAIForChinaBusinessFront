
import { MailCase, Engineer } from '../types';

/**
 * Processes case data for display
 */
export const processCaseData = (
  cases: MailCase[],
  companyFilter: string,
  techFilter: string,
  page: number,
  itemsPerPage: number
) => {
  // Start with all cases
  let filteredCases = [...cases];
  
  // Filter by company if not "all"
  if (companyFilter && companyFilter !== "all") {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.company && caseItem.company.toLowerCase() === companyFilter.toLowerCase()
    );
  }
  
  // Filter by tech keywords
  if (techFilter && techFilter.trim() !== "") {
    const keywords = techFilter.toLowerCase().split(/\s+/);
    filteredCases = filteredCases.filter(caseItem => 
      keywords.some(keyword => 
        (caseItem.skills && caseItem.skills.some(skill => skill.toLowerCase().includes(keyword))) ||
        (caseItem.title && caseItem.title.toLowerCase().includes(keyword))
      )
    );
  }
  
  // Get a unique list of companies - ensure non-empty values
  const companyList = Array.from(
    new Set(
      cases
        .map(item => item.company || "未分類会社")  // Always provide a default company name
        // Filter out null, undefined or empty companies
        .filter(company => 
          company !== null && 
          company !== undefined && 
          company !== ''
        )
    )
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    paginatedCases,
    totalPages,
    companyList
  };
};

/**
 * Filter paginated cases based on filter criteria
 */
export const filterPaginatedCases = (
  cases: MailCase[],
  companyFilter: string,
  techFilter: string,
  currentPage: number
) => {
  // Use the processCaseData function to filter and paginate cases
  const result = processCaseData(cases, companyFilter, techFilter, currentPage, 10);
  return result.paginatedCases;
};

/**
 * Get total pages for pagination
 */
export const getTotalPages = (
  cases: MailCase[],
  companyFilter: string,
  techFilter: string
) => {
  // Filter cases first
  let filteredCases = [...cases];
  
  // Filter by company if not "all"
  if (companyFilter && companyFilter !== "all") {
    filteredCases = filteredCases.filter(caseItem => 
      caseItem.company && caseItem.company.toLowerCase() === companyFilter.toLowerCase()
    );
  }
  
  // Filter by tech keywords
  if (techFilter && techFilter.trim() !== "") {
    const keywords = techFilter.toLowerCase().split(/\s+/);
    filteredCases = filteredCases.filter(caseItem => 
      keywords.some(keyword => 
        (caseItem.skills && caseItem.skills.some(skill => skill.toLowerCase().includes(keyword))) ||
        (caseItem.title && caseItem.title.toLowerCase().includes(keyword))
      )
    );
  }
  
  // Calculate pagination with standard page size of 10
  return Math.ceil(filteredCases.length / 10);
};

/**
 * Processes engineer data for display
 */
export const processEngineerData = (
  engineerFilter: string,
  engineerCompanyFilter: string,
  currentPage: number,
  itemsPerPage: number
) => {
  // Mock data for engineers that matches the updated Engineer interface
  const mockEngineers: Engineer[] = [
    {
      id: 'eng-1',
      name: '山田太郎',
      skills: ['JavaScript', 'React', 'Node.js'],
      japaneseLevel: 'ネイティブレベル',
      experience: '5年',
      availability: '即日',
      status: ['提案中'],
      remarks: '週4日勤務希望, 出張可, リモート可',
      companyType: '自社',
      companyName: 'テックイノベーション株式会社',
      source: '直接応募',
      registeredAt: '2023-01-15',
      updatedAt: '2023-03-20',
      nationality: '日本',
      age: '32歳',
      gender: '男性',
    },
    {
      id: 'eng-2',
      name: '鈴木花子',
      skills: ['Python', 'Django', 'AWS'],
      japaneseLevel: 'ネイティブレベル',
      experience: '3年',
      availability: '1ヶ月後',
      status: ['事前面談'],
      remarks: 'リモート勤務希望, 週5日可',
      companyType: '他社',
      companyName: 'フロントエンドパートナーズ株式会社',
      source: 'エージェント紹介',
      registeredAt: '2023-02-20',
      updatedAt: '2023-04-15',
      nationality: '中国',
      age: '28歳',
      gender: '女性',
    },
    {
      id: 'eng-3',
      name: '田中誠',
      skills: ['Java', 'Spring Boot', 'Oracle'],
      japaneseLevel: 'ビジネスレベル',
      experience: '8年',
      availability: '応相談',
      status: ['面談'],
      remarks: '大手企業での勤務経験豊富, 長期案件希望',
      companyType: '自社',
      companyName: 'テックイノベーション株式会社',
      source: '直接応募',
      registeredAt: '2023-03-05',
      updatedAt: '2023-05-10',
      nationality: 'インド',
      age: '35歳',
      gender: '男性',
    }
  ];

  // Filter engineers based on criteria
  let filteredEngineers = [...mockEngineers];
  
  // Text search filter
  if (engineerFilter && engineerFilter.trim() !== "") {
    const keywords = engineerFilter.toLowerCase().split(/\s+/);
    filteredEngineers = filteredEngineers.filter(engineer => 
      keywords.some(keyword => 
        engineer.name.toLowerCase().includes(keyword) ||
        (engineer.skills && (Array.isArray(engineer.skills) 
          ? engineer.skills.some(skill => typeof skill === 'string' && skill.toLowerCase().includes(keyword))
          : typeof engineer.skills === 'string' && engineer.skills.toLowerCase().includes(keyword))
        )
      )
    );
  }
  
  // Filter by company type if not "all"
  if (engineerCompanyFilter && engineerCompanyFilter !== "all") {
    filteredEngineers = filteredEngineers.filter(engineer => 
      engineer.companyType === engineerCompanyFilter
    );
  }
  
  // Calculate pagination
  const totalEngineerPages = Math.ceil(filteredEngineers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEngineers = filteredEngineers.slice(startIndex, startIndex + itemsPerPage);
  
  return {
    paginatedEngineers,
    totalEngineerPages,
    filteredEngineers
  };
};
