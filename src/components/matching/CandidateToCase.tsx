import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CandidateSelectionDialog } from './CandidateSelectionDialog';
import { MatchingProgressCard } from './MatchingProgressCard';
import { Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { candidatesData } from '@/components/candidates/data/candidatesData';
import { toast } from 'sonner';
import { CandidateItem, EnhancedMatchingResult } from './types';
import { EnhancedMatchingResultsTable } from './EnhancedMatchingResultsTable';
import { 
  useEngineerToProjectsMatching,
  EngineerToProjectsRequest,
  EngineerToProjectsResponse,
  isApiError,
  formatMatchScore
} from '@/services/aiMatchingService';
import { projectService } from '@/services/projectService';

export function CandidateToCase() {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [matchingStarted, setMatchingStarted] = useState(false);
  const [matchingComplete, setMatchingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchingResults, setMatchingResults] = useState<EnhancedMatchingResult[]>([]);
  const [apiResponse, setApiResponse] = useState<EngineerToProjectsResponse | null>(null);
  
  // デフォルトのマッチング設定
  const defaultFilters: EngineerToProjectsRequest['filters'] = {};
  const defaultWeights: EngineerToProjectsRequest['weights'] = {
    skill_match: 0.35,
    experience_match: 0.3,
    budget_match: 0.2,
    location_match: 0.15,
  };
  const defaultMaxMatches = 10;
  const defaultMinScore = 0.6;
  
  // API呼び出し用のカスタムフック
  const { findProjectsForEngineer } = useEngineerToProjectsMatching();

  const handleCandidateSelect = (candidate: CandidateItem) => {
    setSelectedCandidate(candidate);
    console.log("Selected candidate:", candidate);
    
    toast("候補者を選択しました", {
      description: `${candidate.name}が選択されました`,
    });
  };

  // API レスポンスをEnhancedMatchingResult形式に変換
  const convertApiResponseToResults = async (response: EngineerToProjectsResponse): Promise<EnhancedMatchingResult[]> => {
    console.log('=== Converting Engineer-to-Projects API Response ===', response);
    const projects = response.matches || response.matched_projects || [];
    console.log('=== Projects to convert ===', projects);
    
    // 各プロジェクトの詳細情報を並行して取得
    const projectDetailsPromises = projects.map(async (project, index) => {
      console.log(`=== Converting Project ${index + 1} ===`, project);
      console.log(`=== Project Manager Fields ===`, {
        project_manager_name: project.project_manager_name,
        project_manager_email: project.project_manager_email,
        engineer_manager_name: project.engineer_manager_name,
        engineer_manager_email: project.engineer_manager_email,
        engineer_company_name: project.engineer_company_name
      });
      let caseCompany = '未設定';
      
      // project_idがある場合、詳細情報を取得
      if (project.project_id) {
        try {
          const projectDetail = await projectService.getProjectById(project.project_id);
          if (projectDetail) {
            caseCompany = projectDetail.client_company || projectDetail.partner_company || '未設定';
          }
        } catch (error) {
          console.error('プロジェクト詳細の取得に失敗:', error);
        }
      }
      
      const result = {
        id: project.id || (index + 1).toString(),
        caseId: project.project_id || '',
        candidateId: response.engineer_info.id,
        caseName: project.project_title || '案件名未設定',
        candidateName: response.engineer_info.name || '候補者名未設定',
        matchingRate: formatMatchScore(project.match_score || 0),
        matchingReason: project.match_reasons?.join(', ') || '',
        caseCompany: caseCompany,
        candidateCompany: project.engineer_company_name || response.engineer_info.company_name || response.engineer_info.company_type || selectedCandidate?.companyName || '未設定',
        caseManager: project.project_manager_name || '',
        caseManagerEmail: project.project_manager_email || '',
        affiliationManager: project.engineer_manager_name || response.engineer_info.name || '', // 新しいフィールドengineer_manager_nameを使用
        affiliationManagerEmail: project.engineer_manager_email || response.engineer_info.manager_email || selectedCandidate?.managerEmail || '', // 新しいフィールドengineer_manager_emailを使用
        memo: project.concerns && project.concerns.length > 0 ? project.concerns.join(', ') : '',
        recommendationComment: project.match_reasons?.slice(0, 2).join(', ') || '',
      };
      console.log(`=== Converted Project Result ${index + 1} ===`, result);
      return result;
    });
    
    const finalResults = await Promise.all(projectDetailsPromises);
    console.log('=== Final Engineer-to-Projects Results ===', finalResults);
    return finalResults;
  };

  const startMatching = async () => {
    if (!selectedCandidate) {
      toast("エラー", {
        description: "候補者を選択してください",
        style: { backgroundColor: 'hsl(var(--destructive))' },
      });
      return;
    }

    setMatchingStarted(true);
    setMatchingComplete(false);
    setProgress(0);
    setApiResponse(null);
    
    // Show toast notification
    toast("マッチング処理を開始しました", {
      description: "処理が完了するまでお待ちください",
    });

    try {
      // プログレスシミュレーション開始
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 200);

      // 実際のAPI呼び出し
      // selectedCandidate.id は既にstring型（UUID）
      const engineerId = selectedCandidate.id;
      const response = await findProjectsForEngineer(
        engineerId,
        {
          max_matches: defaultMaxMatches,
          min_score: defaultMinScore,
          weights: defaultWeights,
          filters: defaultFilters,
        }
      );

      // デバッグログ：新しいAPIレスポンス構造を確認
      console.log('=== Engineer-to-Projects API Response ===', response);
      console.log('=== Matched Projects ===', response.matched_projects);
      if (response.matched_projects && response.matched_projects.length > 0) {
        console.log('=== First Project Sample ===', response.matched_projects[0]);
      }

      // プログレス完了
      clearInterval(progressInterval);
      setProgress(100);
      
      // レスポンスを保存
      setApiResponse(response);
      
      // 結果を変換して表示
      const convertedResults = await convertApiResponseToResults(response);
      setMatchingResults(convertedResults);
      setMatchingComplete(true);
      
      // 完了通知
      toast("マッチング完了", {
        description: `${response.total_matches}件の案件が見つかりました（高品質マッチ: ${response.high_quality_matches}件）`,
      });
      
    } catch (error) {
      console.error('マッチングエラー:', error);
      
      // エラー時は空の結果を表示
      setMatchingResults([]);
      setMatchingComplete(true);
      setProgress(100);
      
      const errorMessage = isApiError(error) 
        ? error.message 
        : 'マッチング処理中にエラーが発生しました。しばらくしてから再度お試しください。';
      
      toast("エラー", {
        description: errorMessage,
        style: { backgroundColor: 'hsl(var(--destructive))' },
      });
    } finally {
      setMatchingStarted(false);
    }
  };



  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Parameter Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="japanese-text">マッチングパラメータ設定</CardTitle>
            <CardDescription className="japanese-text">
              人材に合った案件を探すためのパラメータを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show only the candidate selection dialog */}
            <div className="mb-4">
              <CandidateSelectionDialog onSelect={handleCandidateSelect} />
            </div>

            {/* Display selected candidate info */}
            {selectedCandidate && (
              <Card className="mb-4 bg-muted/50">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium japanese-text">氏名:</p>
                        <p className="japanese-text">{selectedCandidate.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium japanese-text">所属:</p>
                        <p className="japanese-text">{selectedCandidate.companyType || '自社'}</p>
                      </div>
                    </div>
                    
                    {selectedCandidate.companyType === '他社' && (
                      <div>
                        <p className="text-sm font-medium japanese-text">会社名:</p>
                        <p className="japanese-text">{selectedCandidate.companyName || '未設定'}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium japanese-text">国籍:</p>
                        <p className="japanese-text">{selectedCandidate.nationality || '未設定'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium japanese-text">年齢:</p>
                        <p className="japanese-text">{selectedCandidate.age || '未設定'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium japanese-text">性別:</p>
                        <p className="japanese-text">{selectedCandidate.gender || '未設定'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium japanese-text">経験年数:</p>
                        <p className="japanese-text">{selectedCandidate.experience || '未設定'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium japanese-text">スキル:</p>
                      <p className="japanese-text">{selectedCandidate.skills}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium japanese-text">日本語レベル:</p>
                        <p className="japanese-text">{selectedCandidate.japaneseLevel || '未設定'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium japanese-text">稼働可能時期:</p>
                        <p className="japanese-text">{selectedCandidate.availability || '未設定'}</p>
                      </div>
                    </div>
                    
                    {/* Status badges */}
                    <div>
                      <p className="text-sm font-medium japanese-text">ステータス:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCandidate.status && selectedCandidate.status.map((status, index) => (
                          <Badge key={index} variant="outline" className={`
                            japanese-text
                            ${status === '提案中' ? 'bg-blue-100 text-blue-800' : ''}
                            ${status === '事前面談' ? 'bg-green-100 text-green-800' : ''}
                            ${status === '面談' ? 'bg-amber-100 text-amber-800' : ''}
                            ${status === '結果待ち' ? 'bg-purple-100 text-purple-800' : ''}
                            ${status === '営業終了' ? 'bg-gray-100 text-gray-800' : ''}
                            ${status === '未提案' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}


            <Button 
              onClick={startMatching} 
              className="w-full japanese-text mt-6" 
              disabled={matchingStarted || !selectedCandidate}
            >
              {matchingStarted ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span className="japanese-text">マッチング処理中...</span>
                </>
              ) : (
                <span className="japanese-text">AIマッチングを開始</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Matching Progress Card */}
        <MatchingProgressCard 
          progress={progress}
          isInProgress={matchingStarted && !matchingComplete}
          completionMessage={apiResponse ? `${apiResponse.total_matches}件の案件が見つかりました` : "5件の案件が見つかりました"}
          processingMessage="AIが案件データを分析中..."
        />
      </div>

      {/* Enhanced Matching Results Table */}
      {matchingComplete && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="japanese-text">AIマッチング結果</CardTitle>
                <CardDescription className="japanese-text">
                  {selectedCandidate?.name || '候補者'}に合う案件が見つかりました
                  {apiResponse && (
                    <span className="block mt-1">
                      総マッチ数: {apiResponse.total_matches}件 | 
                      高品質マッチ: {apiResponse.high_quality_matches}件 | 
                      処理時間: {apiResponse.processing_time_seconds.toFixed(1)}秒
                    </span>
                  )}
                </CardDescription>
              </div>
              {apiResponse && (
                <div className="text-right">
                  <Badge variant="outline" className="japanese-text">
                    スコア閾値: {formatMatchScore(defaultMinScore)}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedMatchingResultsTable results={matchingResults} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}