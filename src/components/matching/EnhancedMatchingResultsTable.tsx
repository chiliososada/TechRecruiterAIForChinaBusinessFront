
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Send, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { MatchDetailDialog } from './MatchDetailDialog';
import { SendMessageDialog } from './SendMessageDialog';
import { EnhancedMatchingResult, CaseDetailItem, CandidateItem } from './types';
import { toast } from 'sonner';
import { exportToCSV } from './utils/exportUtils';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedMatchingResultsTableProps {
  results: EnhancedMatchingResult[];
  itemsPerPage?: number;
}

export const EnhancedMatchingResultsTable: React.FC<EnhancedMatchingResultsTableProps> = ({
  results,
  itemsPerPage = 5,
}) => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof EnhancedMatchingResult>('matchingRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default to showing highest matches first
  const [selectedMatch, setSelectedMatch] = useState<EnhancedMatchingResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [caseDetails, setCaseDetails] = useState<CaseDetailItem | null>(null);
  const { currentTenant } = useAuth();

  // Get case details from database
  const fetchCaseDetails = async (caseId: number | string): Promise<CaseDetailItem | null> => {
    if (!currentTenant?.id) {
      console.error('テナントIDが見つかりません');
      return null;
    }

    try {
      const projectDetail = await projectService.getProjectById(caseId.toString(), currentTenant.id);
      if (!projectDetail) return null;
      
      return {
        id: caseId,
        title: projectDetail.title || selectedMatch?.caseName || 'Unknown',
        client: projectDetail.client_company || projectDetail.partner_company || selectedMatch?.caseCompany || 'Unknown',
        skills: projectDetail.skills || [],
        experience: projectDetail.experience || '未設定',
        budget: projectDetail.budget || projectDetail.desired_budget || '未設定',
        description: projectDetail.description || '未設定',
        detailDescription: projectDetail.detail_description || '未設定',
        manager: selectedMatch?.caseManager || '未設定'
      };
    } catch (error) {
      console.error('案件詳細の取得に失敗:', error);
      return null;
    }
  };

  // Get candidate details from the matching result
  const getCandidateDetails = (candidateId: number | string): CandidateItem | undefined => {
    return {
      id: candidateId.toString(),
      name: selectedMatch?.candidateName || 'Unknown',
      skills: 'JavaScript, React, TypeScript',
      companyName: selectedMatch?.candidateCompany,
      experience: '5年',
      managerName: selectedMatch?.affiliationManager,
      managerEmail: selectedMatch?.affiliationManagerEmail
    };
  };

  // Sort and paginate results
  const sortedResults = useMemo(() => {
    let sorted = [...results];
    
    if (sortField === 'matchingRate') {
      sorted.sort((a, b) => {
        // Convert matchingRate from string (e.g. "85%") to number
        const rateA = parseFloat(a.matchingRate.replace('%', ''));
        const rateB = parseFloat(b.matchingRate.replace('%', ''));
        
        return sortDirection === 'asc' ? rateA - rateB : rateB - rateA;
      });
    } else {
      // For other fields, sort as strings
      sorted.sort((a, b) => {
        const valueA = a[sortField]?.toString() || '';
        const valueB = b[sortField]?.toString() || '';
        
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB, 'ja') 
          : valueB.localeCompare(valueA, 'ja');
      });
    }
    
    return sorted;
  }, [results, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort change
  const handleSort = (field: keyof EnhancedMatchingResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to descending for matching rate, ascending for others
      setSortDirection(field === 'matchingRate' ? 'desc' : 'asc');
    }
  };

  // Handle view details
  const handleViewDetails = async (match: EnhancedMatchingResult) => {
    setSelectedMatch(match);
    
    // Fetch case details from database if caseId exists
    if (match.caseId) {
      const details = await fetchCaseDetails(match.caseId);
      setCaseDetails(details);
    } else {
      setCaseDetails(null);
    }
    
    setIsDetailOpen(true);
  };

  // Handle send message
  const handleSendMessage = (match: EnhancedMatchingResult) => {
    setSelectedMatch(match);
    setIsMessageOpen(true);
  };

  // Handle clicking on a manager to send a message
  const handleManagerClick = (match: EnhancedMatchingResult) => {
    if (match.caseManagerEmail || match.affiliationManagerEmail) {
      setSelectedMatch(match);
      setIsMessageOpen(true);
    } else {
      toast.error("メールアドレスが設定されていません", {
        description: "担当者のメールアドレスがありません"
      });
    }
  };


  // Handle export to CSV
  const handleExportCSV = () => {
    if (sortedResults.length === 0) {
      toast.error("エクスポートできるデータがありません", { 
        description: "マッチング結果がありません"
      });
      return;
    }
    
    exportToCSV(sortedResults, "matching-results");
    toast.success("CSVエクスポート完了", {
      description: "マッチング結果がエクスポートされました",
    });
  };

  // Get current candidate details
    
  const currentCandidateDetail = selectedMatch?.candidateId 
    ? getCandidateDetails(selectedMatch.candidateId)
    : undefined;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium japanese-text">マッチング結果</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCSV}
          className="japanese-text"
        >
          <Download className="mr-2 h-4 w-4" />
          CSVエクスポート
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[180px] cursor-pointer"
                onClick={() => handleSort('caseName')}
              >
                <div className="flex items-center japanese-text">
                  案件名
                  {sortField === 'caseName' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('candidateName')}
              >
                <div className="flex items-center japanese-text">
                  候補者名
                  {sortField === 'candidateName' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-[100px] cursor-pointer"
                onClick={() => handleSort('matchingRate')}
              >
                <div className="flex items-center japanese-text">
                  マッチング率
                  {sortField === 'matchingRate' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[300px]">
                <div className="japanese-text">マッチング理由</div>
              </TableHead>
              <TableHead>
                <div className="japanese-text">会社</div>
              </TableHead>
              <TableHead className="w-[200px]">
                <div className="japanese-text">案件担当者</div>
              </TableHead>
              <TableHead className="w-[200px]">
                <div className="japanese-text">所属担当者</div>
              </TableHead>
              <TableHead className="w-[120px]">
                <div className="japanese-text">アクション</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium japanese-text">{result.caseName}</TableCell>
                  <TableCell className="japanese-text">{result.candidateName}</TableCell>
                  <TableCell className="font-bold">{result.matchingRate}</TableCell>
                  <TableCell className="japanese-text whitespace-normal">
                    {result.matchingReason}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs japanese-text">
                      {result.candidateCompany && (
                        <div className="mb-1">
                          <span className="font-semibold text-blue-600">候補者:</span> {result.candidateCompany}
                        </div>
                      )}
                      {result.caseCompany && (
                        <div>
                          <span className="font-semibold text-green-600">案件:</span> {result.caseCompany}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    className="japanese-text cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleManagerClick(result)}
                    title={result.caseManagerEmail ? "クリックしてメール送信" : ""}
                  >
                    <div className={`border-l-4 ${result.caseManagerEmail ? 'border-blue-500 pl-2' : 'border-transparent pl-2'}`}>
                      <p>{result.caseManager || '未設定'}</p>
                      {result.caseManagerEmail && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.caseManagerEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    className="japanese-text cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => handleManagerClick(result)}
                    title={result.affiliationManagerEmail ? "クリックしてメール送信" : ""}
                  >
                    <div className={`border-l-4 ${result.affiliationManagerEmail ? 'border-green-500 pl-2' : 'border-transparent pl-2'}`}>
                      <p>{result.affiliationManager || '未設定'}</p>
                      {result.affiliationManagerEmail && (
                        <p className="text-xs text-gray-500 mt-1">
                          {result.affiliationManagerEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleViewDetails(result)}
                        title="詳細を見る"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleSendMessage(result)}
                        title="メッセージを送る"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 japanese-text">
                  マッチング結果がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="py-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <MatchDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        matchData={selectedMatch}
        caseData={caseDetails}
        candidateData={currentCandidateDetail}
      />

      {/* Message dialog */}
      <SendMessageDialog
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        matchData={selectedMatch}
      />
    </>
  );
};

export default EnhancedMatchingResultsTable;
