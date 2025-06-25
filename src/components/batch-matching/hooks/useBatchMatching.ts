
import { useState } from 'react';
import { EnhancedMatchingResult } from '@/components/matching/types';
import { 
  useBulkMatching, 
  BulkMatchingResponse, 
  BulkMatchItem,
  formatMatchScore,
  isApiError
} from '@/services/aiMatchingService';
import { projectService, Project } from '@/services/projectService';
import { engineerService, Engineer } from '@/services/engineerService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 3;

export const useBatchMatching = () => {
  // Filter states
  const [filterCaseAffiliation, setFilterCaseAffiliation] = useState<string>('all');
  const [filterCandidateAffiliation, setFilterCandidateAffiliation] = useState<string>('all');
  const [filterCaseStartDate, setFilterCaseStartDate] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0.7);
  
  // Search result states
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [matchingResults, setMatchingResults] = useState<EnhancedMatchingResult[]>([]);
  const [apiResponse, setApiResponse] = useState<BulkMatchingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Pagination states
  const [matchingResultsCurrentPage, setMatchingResultsCurrentPage] = useState<number>(1);
  
  // Dialog states
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState<boolean>(false);
  const [isCaseDetailDialogOpen, setIsCaseDetailDialogOpen] = useState<boolean>(false);
  const [isCandidateDetailDialogOpen, setIsCandidateDetailDialogOpen] = useState<boolean>(false);
  
  // Selected item states
  const [selectedMatch, setSelectedMatch] = useState<EnhancedMatchingResult | null>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // API hook
  const { performBulkMatching } = useBulkMatching();
  const { currentTenant } = useAuth();

  // APIレスポンスをEnhancedMatchingResult形式に変換（詳細データを後で補完）
  const convertBulkMatchesToResults = async (matches: BulkMatchItem[]): Promise<EnhancedMatchingResult[]> => {
    console.log('Converting matches:', matches);
    
    if (!currentTenant?.id) {
      console.error('テナントIDが見つかりません');
      return [];
    }

    // 安全な配列処理のヘルパー関数
    const safeJoin = (arr: any, separator: string = ', '): string => {
      if (!arr) return '';
      if (!Array.isArray(arr)) return '';
      return arr.join(separator);
    };

    // 並行してプロジェクトとエンジニアの詳細データを取得
    const resultPromises = matches.map(async (match, index) => {
      console.log(`Converting match ${index}:`, match);
      
      // プロジェクトとエンジニアの詳細データを並行取得
      const [projectDetail, engineerDetail] = await Promise.all([
        match.project_id ? projectService.getProjectById(match.project_id, currentTenant.id) : null,
        match.engineer_id ? engineerService.getEngineerById(match.engineer_id, currentTenant.id) : null
      ]);

      console.log(`Project detail for ${match.project_id}:`, projectDetail);
      console.log(`Engineer detail for ${match.engineer_id}:`, engineerDetail);

      const result = {
        id: match.id || (index + 1).toString(),
        caseId: match.project_id || '',
        candidateId: match.engineer_id || '',
        caseName: projectDetail?.title || match.project_title || '案件名未設定',
        candidateName: engineerDetail?.name || match.engineer_name || '候補者名未設定',
        matchingRate: formatMatchScore(match.match_score || 0),
        matchingReason: safeJoin(match.match_reasons, ', '),
        caseCompany: projectDetail?.client_company || projectDetail?.partner_company || '未設定',
        candidateCompany: engineerDetail?.company_name || match.engineer_company_name || '未設定',
        caseManager: projectDetail?.manager_name || match.project_manager_name || '',
        caseManagerEmail: projectDetail?.manager_email || match.project_manager_email || '',
        affiliationManager: match.engineer_manager_name || engineerDetail?.name || '',
        affiliationManagerEmail: match.engineer_manager_email || engineerDetail?.email || '',
        memo: safeJoin(match.concerns, ', '),
        recommendationComment: safeJoin(match.match_reasons?.slice(0, 2), ', '),
        // MatchResultItemで使用される追加フィールド
        skills: engineerDetail?.skills || match.matched_skills || [],
        matchedSkills: safeJoin(engineerDetail?.skills || match.matched_skills, ', '),
        experience: engineerDetail?.experience || '未設定',
        nationality: engineerDetail?.nationality || '未設定',
        age: engineerDetail?.age || '未設定',
        gender: engineerDetail?.gender || '未設定',
        // 詳細データを保存
        projectDetail,
        engineerDetail,
      };
      
      console.log(`Converted result ${index}:`, result);
      return result;
    });

    return Promise.all(resultPromises);
  };

  // Handle search action
  const handleSearch = async () => {
    setIsLoading(true);
    setIsSearched(false);
    
    try {
      const requestOptions = {
        min_score: minScore,
        max_matches: 100,
        engineer_company_type: filterCandidateAffiliation === 'all' ? undefined : filterCandidateAffiliation,
        project_company_type: filterCaseAffiliation === 'all' ? undefined : filterCaseAffiliation,
        project_start_date: filterCaseStartDate || undefined,
      };

      console.log('一括マッチング開始:', requestOptions);
      
      const response = await performBulkMatching(requestOptions);
      
      console.log('一括マッチングレスポンス:', response);
      console.log('マッチデータ:', response.matches);
      
      // マッチングデータを詳細情報で補完
      const enrichedResults = await convertBulkMatchesToResults(response.matches || []);
      
      setApiResponse(response);
      setMatchingResults(enrichedResults);
      setIsSearched(true);
      setMatchingResultsCurrentPage(1);
      
      toast.success('一括マッチング完了', {
        description: `${response.total_matches}件のマッチが見つかりました`,
      });
      
    } catch (error) {
      console.error('一括マッチングエラー:', error);
      
      if (isApiError(error)) {
        toast.error('一括マッチング失敗', {
          description: error.message,
        });
      } else {
        toast.error('一括マッチング失敗', {
          description: 'マッチング処理中にエラーが発生しました',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get paginated results
  const getPaginatedResults = (results: EnhancedMatchingResult[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return results.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Handle sending a message to a candidate
  const handleSendMessage = (match: EnhancedMatchingResult) => {
    setSelectedMatch(match);
    setIsSendMessageDialogOpen(true);
  };

  // Handle showing case details
  const handleCaseDetail = (result: EnhancedMatchingResult) => {
    const project = result.projectDetail;
    
    const caseDetail = {
      id: result.caseId,
      name: result.caseName,
      company: result.caseCompany,
      location: project?.location || '未設定', // projectsテーブルのlocationフィールド
      workType: project?.work_type || '未設定', // projectsテーブルのwork_typeフィールド
      budget: project?.budget || project?.desired_budget || '未設定', // projectsテーブルのbudgetフィールド
      experienceRequired: project?.experience || '未設定', // projectsテーブルのexperienceフィールド
      skills: project?.skills || result.skills || [],
      manager: result.caseManager,
      managerEmail: result.caseManagerEmail,
      priority: project?.priority || 'medium', // projectsテーブルのpriorityフィールド
      detailDescription: project?.detail_description || project?.description || '案件の詳細情報が登録されていません。',
      projectDetail: result.projectDetail
    };
    
    console.log('Case detail data:', caseDetail);
    setSelectedCase(caseDetail);
    setIsCaseDetailDialogOpen(true);
  };

  // Handle showing candidate details
  const handleCandidateDetail = (result: EnhancedMatchingResult) => {
    const engineer = result.engineerDetail;
    
    const candidateDetail = {
      id: result.candidateId,
      name: result.candidateName,
      company: result.candidateCompany,
      skills: result.skills || [],
      experience: engineer?.experience || result.experience,
      japaneseLevel: engineer?.japanese_level || '未設定', // japanese_level フィールド
      englishLevel: engineer?.english_level || '未設定', // english_level フィールド
      currentStatus: engineer?.current_status || '未設定', // current_status フィールド
      nearestStation: engineer?.nearest_station || '未設定', // nearest_station フィールド
      companyType: engineer?.company_type || '未設定', // company_type フィールド
      arrivalYearJapan: engineer?.arrival_year_japan || '未設定', // arrival_year_japan フィールド
      manager: result.affiliationManager,
      managerEmail: result.affiliationManagerEmail,
      nationality: result.nationality,
      age: result.age,
      gender: result.gender,
      bio: engineer?.self_promotion || engineer?.work_experience || '技術者の詳細情報が登録されていません。',
      engineerDetail: result.engineerDetail
    };
    
    setSelectedCandidate(candidateDetail);
    setIsCandidateDetailDialogOpen(true);
  };

  return {
    // Filter state
    filterCaseAffiliation,
    setFilterCaseAffiliation,
    filterCandidateAffiliation,
    setFilterCandidateAffiliation,
    filterCaseStartDate,
    setFilterCaseStartDate,
    minScore,
    setMinScore,
    
    // Search state
    isSearched,
    isLoading,
    matchingResults,
    apiResponse,
    
    // Pagination state
    matchingResultsCurrentPage,
    setMatchingResultsCurrentPage,
    
    // Dialog state
    isSendMessageDialogOpen,
    setIsSendMessageDialogOpen,
    isCaseDetailDialogOpen,
    setIsCaseDetailDialogOpen,
    isCandidateDetailDialogOpen,
    setIsCandidateDetailDialogOpen,
    selectedMatch,
    selectedCase,
    selectedCandidate,
    
    // Derived data
    totalPages: Math.ceil(matchingResults.length / ITEMS_PER_PAGE),
    paginatedResults: getPaginatedResults(matchingResults, matchingResultsCurrentPage),
    
    // Handlers
    handleSearch,
    handleSendMessage,
    handleCaseDetail,
    handleCandidateDetail
  };
};
