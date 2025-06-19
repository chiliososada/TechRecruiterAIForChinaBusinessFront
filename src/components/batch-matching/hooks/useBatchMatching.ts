
import { useState } from 'react';
import { combinedMatchingResults, caseDetails, candidateDetails } from '../data/sampleData';
import { EnhancedMatchingResult } from '@/components/matching/types';

const ITEMS_PER_PAGE = 3;

export const useBatchMatching = () => {
  // Filter states
  const [filterCaseAffiliation, setFilterCaseAffiliation] = useState<string>('');
  const [filterCandidateAffiliation, setFilterCandidateAffiliation] = useState<string>('');
  const [filterCaseStartDate, setFilterCaseStartDate] = useState<string>('');
  
  // Search result states
  const [isSearched, setIsSearched] = useState<boolean>(false);
  
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

  // Handle search action
  const handleSearch = () => {
    setIsSearched(true);
  };

  // Get paginated results
  const getPaginatedResults = (results: any[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return results.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Handle sending a message to a candidate
  const handleSendMessage = (match: any) => {
    // Create a match object with the necessary data
    const matchData: EnhancedMatchingResult = {
      id: match.id,
      caseId: 'c101',
      candidateId: `u${match.id}`,
      caseName: match.caseName,
      candidateName: match.candidateName,
      matchingRate: match.matchingRate,
      matchingReason: match.matchingReason || 'スキル・経験年数が一致',
      caseCompany: match.caseCompany,
      candidateCompany: match.candidateCompany,
      caseManager: match.caseManager,
      caseManagerEmail: match.caseManagerEmail,
      affiliationManager: match.affiliationManager,
      affiliationManagerEmail: match.affiliationManagerEmail,
      memo: match.memo || `経験年数: ${match.experience}`,
      recommendationComment: `${Array.isArray(match.skills) ? match.skills.join(', ') : match.skills}のスキルが案件に適合`
    };
    
    setSelectedMatch(matchData);
    setIsSendMessageDialogOpen(true);
  };

  // Handle showing case details
  const handleCaseDetail = (result: any) => {
    // Find the corresponding case details
    const caseDetail = caseDetails.find(c => c.name === result.caseName) || {
      id: `c${result.id}`,
      name: result.caseName,
      company: result.caseCompany,
      skills: result.skills,
      manager: result.caseManager,
      managerEmail: result.caseManagerEmail,
      detailDescription: '案件の詳細情報が登録されていません。'
    };
    
    setSelectedCase(caseDetail);
    setIsCaseDetailDialogOpen(true);
  };

  // Handle showing candidate details
  const handleCandidateDetail = (result: any) => {
    // Find the corresponding candidate details
    const candidateDetail = candidateDetails.find(c => c.name === result.candidateName) || {
      id: `u${result.id}`,
      name: result.candidateName,
      company: result.candidateCompany,
      skills: result.skills,
      experience: result.experience,
      manager: result.affiliationManager,
      managerEmail: result.affiliationManagerEmail,
      nationality: result.nationality,
      age: result.age,
      gender: result.gender,
      bio: '技術者の詳細情報が登録されていません。'
    };
    
    setSelectedCandidate(candidateDetail);
    setIsCandidateDetailDialogOpen(true);
  };

  return {
    // State
    filterCaseAffiliation,
    setFilterCaseAffiliation,
    filterCandidateAffiliation,
    setFilterCandidateAffiliation,
    filterCaseStartDate,
    setFilterCaseStartDate,
    isSearched,
    matchingResultsCurrentPage,
    setMatchingResultsCurrentPage,
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
    totalPages: Math.ceil(combinedMatchingResults.length / ITEMS_PER_PAGE),
    paginatedResults: getPaginatedResults(combinedMatchingResults, matchingResultsCurrentPage),
    
    // Handlers
    handleSearch,
    handleSendMessage,
    handleCaseDetail,
    handleCandidateDetail
  };
};
