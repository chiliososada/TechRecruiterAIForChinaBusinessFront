
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, List } from 'lucide-react';
import { BatchMatchingTab3 } from '@/components/batch-matching/BatchMatchingTab3';
import { SendMessageDialog } from '@/components/matching/SendMessageDialog';
import { CandidateDetailDialog } from '@/components/batch-matching/CandidateDetailDialog';
import { CaseDetailDialog } from '@/components/batch-matching/CaseDetailDialog';
import { FilterArea } from '@/components/batch-matching/FilterArea';
import { MatchResultsList } from '@/components/batch-matching/MatchResultsList';
import { useBatchMatching } from '@/components/batch-matching/hooks/useBatchMatching';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function BatchMatching() {
  const [activeTab, setActiveTab] = useState<"combined-matching" | "matching-history">("combined-matching");
  const { toast } = useToast();
  
  // Custom state for saved matching history
  const [savedMatchingHistory, setSavedMatchingHistory] = useState<any[]>([]);
  
  const {
    // Filter states
    filterCaseAffiliation,
    setFilterCaseAffiliation,
    filterCandidateAffiliation,
    setFilterCandidateAffiliation,
    filterCaseStartDate,
    setFilterCaseStartDate,
    
    // Results state
    isSearched,
    
    // Pagination
    matchingResultsCurrentPage,
    setMatchingResultsCurrentPage,
    totalPages,
    paginatedResults,
    
    // Dialog states
    isSendMessageDialogOpen,
    setIsSendMessageDialogOpen,
    isCaseDetailDialogOpen,
    setIsCaseDetailDialogOpen,
    isCandidateDetailDialogOpen,
    setIsCandidateDetailDialogOpen,
    
    // Selected items
    selectedMatch,
    selectedCase,
    selectedCandidate,
    
    // Handlers
    handleSearch,
    handleSendMessage,
    handleCaseDetail,
    handleCandidateDetail
  } = useBatchMatching();

  // Handler for saving matching results to history
  const handleSaveToHistory = (result: any) => {
    const historyEntry = {
      id: Date.now(),
      date: new Date().toLocaleString('ja-JP'),
      user: 'Current User',
      result: result,
      status: 'マッチング保存済み',
    };
    
    setSavedMatchingHistory(prev => [historyEntry, ...prev]);
    toast({
      title: "マッチング結果を保存しました",
      description: `${result.caseName} と ${result.candidateName} のマッチングが履歴に保存されました。`,
    });
  };

  return (
    <MainLayout>
      <ScrollArea className="h-screen">
        <div className="p-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight japanese-text">一括マッチング</h2>
          </div>

          <Tabs defaultValue="combined-matching" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="combined-matching" className="japanese-text">
                <List className="mr-2 h-4 w-4" />
                マッチング検索
              </TabsTrigger>
              <TabsTrigger value="matching-history" className="japanese-text">
                <FileText className="mr-2 h-4 w-4" />
                マッチング結果履歴
              </TabsTrigger>
            </TabsList>
            
            {/* Combined Tab for bidirectional matching */}
            <TabsContent value="combined-matching">
              {/* Filter Area */}
              <FilterArea 
                filterCaseAffiliation={filterCaseAffiliation}
                setFilterCaseAffiliation={setFilterCaseAffiliation}
                filterCandidateAffiliation={filterCandidateAffiliation}
                setFilterCandidateAffiliation={setFilterCandidateAffiliation}
                filterCaseStartDate={filterCaseStartDate}
                setFilterCaseStartDate={setFilterCaseStartDate}
                handleSearch={handleSearch}
              />

              {/* Results Area */}
              {isSearched && (
                <div>
                  <MatchResultsList
                    results={paginatedResults}
                    currentPage={matchingResultsCurrentPage}
                    totalPages={totalPages}
                    onPageChange={setMatchingResultsCurrentPage}
                    onCaseDetail={handleCaseDetail}
                    onCandidateDetail={handleCandidateDetail}
                    onSendMessage={handleSendMessage}
                    onSaveToHistory={handleSaveToHistory}
                  />
                </div>
              )}
              
              {/* Dialogs */}
              <CaseDetailDialog
                isOpen={isCaseDetailDialogOpen}
                onClose={() => setIsCaseDetailDialogOpen(false)}
                caseData={selectedCase}
              />
              
              <CandidateDetailDialog
                isOpen={isCandidateDetailDialogOpen}
                onClose={() => setIsCandidateDetailDialogOpen(false)}
                candidateData={selectedCandidate}
              />
              
              <SendMessageDialog 
                isOpen={isSendMessageDialogOpen}
                onClose={() => setIsSendMessageDialogOpen(false)}
                matchData={selectedMatch}
              />
            </TabsContent>
            
            {/* Matching History Tab */}
            <TabsContent value="matching-history">
              <BatchMatchingTab3 savedMatchingHistory={savedMatchingHistory} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </MainLayout>
  );
}

export default BatchMatching;
