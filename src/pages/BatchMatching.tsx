
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
import { useAuth } from '@/contexts/AuthContext';

export function BatchMatching() {
  const [activeTab, setActiveTab] = useState<"combined-matching" | "matching-history">("combined-matching");
  const { toast } = useToast();
  const { currentTenant, user } = useAuth();
  
  // Custom state for saved matching history (removed since we'll fetch from database)
  
  const {
    // Filter states
    filterCaseAffiliation,
    setFilterCaseAffiliation,
    filterCandidateAffiliation,
    setFilterCandidateAffiliation,
    filterCaseStartDate,
    setFilterCaseStartDate,
    minScore,
    setMinScore,
    
    // Results state
    isSearched,
    isLoading,
    matchingResults,
    apiResponse,
    
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
  const handleSaveToHistory = async (result: any) => {
    try {
      if (!currentTenant?.id) {
        toast({
          title: "エラー",
          description: "テナント情報が見つかりません",
          variant: "destructive",
        });
        return;
      }

      console.log('保存対象のresult:', result);
      console.log('result.id:', result.id, 'typeof:', typeof result.id);
      console.log('result.caseId:', result.caseId);
      console.log('result.candidateId:', result.candidateId);

      // まず該当するレコードが存在するかを確認
      const { businessClientManager } = await import('@/integrations/supabase/business-client');
      const client = businessClientManager.getClient();
      
      // IDで直接検索する前に、project_idとengineer_idで検索
      const { data: existingRecords, error: searchError } = await client
        .from('project_engineer_matches')
        .select('*')
        .eq('project_id', result.caseId || result.projectId)
        .eq('engineer_id', result.candidateId || result.engineerId)
        .eq('tenant_id', currentTenant.id);

      console.log('既存レコード検索結果:', { existingRecords, searchError });

      if (searchError) {
        throw new Error(`レコード検索失敗: ${searchError.message}`);
      }

      let targetRecord = null;
      
      if (existingRecords && existingRecords.length > 0) {
        // 複数ある場合は最新のものを選択
        targetRecord = existingRecords[0];
      } else {
        // レコードが存在しない場合は新規作成
        const { data: newRecord, error: insertError } = await client
          .from('project_engineer_matches')
          .insert({
            project_id: result.caseId || result.projectId,
            engineer_id: result.candidateId || result.engineerId,
            tenant_id: currentTenant.id,
            match_score: parseFloat(result.matchingRate?.replace('%', '') || '0') / 100,
            matched_skills: Array.isArray(result.skills) ? result.skills : [],
            match_reasons: result.matchingReason ? [result.matchingReason] : [],
            status: '保存済み',
            comment: '履歴に保存',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            saved_at: new Date().toISOString(),
            is_active: true
          })
          .select()
          .single();

        console.log('新規レコード作成結果:', { newRecord, insertError });

        if (insertError) {
          throw new Error(`レコード作成失敗: ${insertError.message}`);
        }

        targetRecord = newRecord;
      }

      if (!targetRecord) {
        throw new Error('対象レコードの特定に失敗しました');
      }

      // 既存レコードの場合のみ更新
      if (existingRecords && existingRecords.length > 0) {
        const { data: updateData, error: updateError } = await client
          .from('project_engineer_matches')
          .update({
            status: '保存済み',
            comment: '履歴に保存',
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            saved_at: new Date().toISOString()
          })
          .eq('id', targetRecord.id)
          .eq('tenant_id', currentTenant.id)
          .select();

        console.log('レコード更新結果:', { updateData, updateError });

        if (updateError) {
          throw new Error(`レコード更新失敗: ${updateError.message}`);
        }
      }

      const response = { status: 'success' };

      if (response.status === 'success') {
        toast({
          title: "マッチング結果を保存しました",
          description: `${result.caseName} と ${result.candidateName} のマッチングが履歴に保存されました。`,
        });
        
        // 保存後少し待ってから履歴タブに切り替え
        setTimeout(() => {
          console.log('履歴タブに切り替え中...');
          setActiveTab('matching-history');
        }, 500);
      } else {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      console.error('履歴保存エラー:', error);
      toast({
        title: "保存に失敗しました",
        description: error instanceof Error ? error.message : '不明なエラーが発生しました',
        variant: "destructive",
      });
    }
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
                minScore={minScore}
                setMinScore={setMinScore}
                handleSearch={handleSearch}
                isLoading={isLoading}
              />

              {/* Results Area */}
              {isSearched && (
                <div>
                  {/* API Response Summary */}
                  {apiResponse && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-lg font-medium mb-2 japanese-text text-blue-900">マッチング結果サマリー</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium japanese-text">総マッチ数:</span>
                          <span className="ml-1">{apiResponse.total_matches}件</span>
                        </div>
                        <div>
                          <span className="font-medium japanese-text">高品質マッチ:</span>
                          <span className="ml-1">{apiResponse.high_quality_matches}件</span>
                        </div>
                        <div>
                          <span className="font-medium japanese-text">処理時間:</span>
                          <span className="ml-1">{apiResponse.processing_time_seconds.toFixed(1)}秒</span>
                        </div>
                        <div>
                          <span className="font-medium japanese-text">スコア閾値:</span>
                          <span className="ml-1">{Math.round(minScore * 100)}%</span>
                        </div>
                      </div>
                      {apiResponse.recommendations && apiResponse.recommendations.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium japanese-text text-green-700">推奨事項:</span>
                          <ul className="list-disc list-inside mt-1 text-green-600">
                            {apiResponse.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
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
              <BatchMatchingTab3 isActive={activeTab === "matching-history"} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </MainLayout>
  );
}

export default BatchMatching;
