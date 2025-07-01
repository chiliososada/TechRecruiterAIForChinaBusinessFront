
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { CaseSelectionDialog } from './CaseSelectionDialog';
import { MatchingProgressCard } from './MatchingProgressCard';
import { Badge } from '@/components/ui/badge';
import { CaseDetailDisplay } from './CaseDetailDisplay';
import { EnhancedMatchingResultsTable } from './EnhancedMatchingResultsTable';
import {
  useProjectToEngineersMatching,
  ProjectToEngineersRequest,
  ProjectToEngineersResponse,
  isApiError,
  formatMatchScore
} from '@/services/aiMatchingService';
import { EnhancedMatchingResult } from './types';

interface CaseItem {
  id: string;
  title: string;
  client: string;
  skills?: string[];
  experience?: string;
  budget?: string;
  location?: string;
  workType?: string;
  priority?: string;
  description?: string;
  detailDescription?: string;
  companyType?: string;
}

export function CaseToCandidate() {
  // Case to candidate matching states
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [matchingResults, setMatchingResults] = useState<EnhancedMatchingResult[]>([]);
  const [apiResponse, setApiResponse] = useState<ProjectToEngineersResponse | null>(null);
  
  // ユーザー設定可能なマッチング設定
  const [maxMatches, setMaxMatches] = useState(10);
  const [minScore, setMinScore] = useState(0.6);

  // デフォルトのマッチング設定
  const defaultFilters: ProjectToEngineersRequest['filters'] = {};
  const defaultWeights: ProjectToEngineersRequest['weights'] = {
    skill_match: 0.3,
    experience_match: 0.25,
    project_experience_match: 0.2,
    japanese_level_match: 0.15,
    location_match: 0.1,
  };

  // API呼び出し用のカスタムフック
  const { findEngineersForProject } = useProjectToEngineersMatching();


  // API レスポンスをEnhancedMatchingResult形式に変換
  const convertApiResponseToResults = (response: ProjectToEngineersResponse): EnhancedMatchingResult[] => {
    console.log('=== Converting API Response to Results ===');
    const engineers = response.matches || response.matched_engineers || [];
    console.log('=== Engineers to convert ===', engineers);
    
    const results = engineers.map((engineer, index) => {
      console.log(`=== Converting Engineer ${index + 1} ===`, engineer);
      console.log(`=== Engineer Manager Fields ===`, {
        engineer_name: engineer.engineer_name,
        engineer_company_name: engineer.engineer_company_name,
        engineer_manager_name: engineer.engineer_manager_name,
        engineer_manager_email: engineer.engineer_manager_email,
        project_manager_name: engineer.project_manager_name,
        project_manager_email: engineer.project_manager_email
      });
      const result = {
        id: engineer.id || (index + 1).toString(),
        caseId: response.project_info.id,
        candidateId: engineer.engineer_id || '',
        caseName: response.project_info.title || '案件名未設定',
        candidateName: engineer.engineer_name || '候補者名未設定',
        matchingRate: formatMatchScore(engineer.match_score || 0),
        matchingReason: engineer.match_reasons?.join(', ') || '',
        caseCompany: response.project_info.company || '未設定',
        candidateCompany: engineer.engineer_company_name || engineer.engineer_company_type || '未設定',
        caseManager: engineer.project_manager_name || response.project_info.manager?.name || '',
        caseManagerEmail: engineer.project_manager_email || response.project_info.manager?.email || '',
        affiliationManager: engineer.engineer_manager_name || engineer.engineer_name || '', // engineer_manager_nameを優先使用
        affiliationManagerEmail: engineer.engineer_manager_email || '', // engineer_manager_emailを使用
        memo: engineer.concerns && engineer.concerns.length > 0 ? engineer.concerns.join(', ') : '',
        recommendationComment: engineer.match_reasons?.slice(0, 2).join(', ') || '',
      };
      console.log(`=== Converted Result ${index + 1} ===`, result);
      return result;
    });
    
    console.log('=== Final Converted Results ===', results);
    return results;
  };

  // Handle Case to Candidate matching
  const startMatching = async () => {
    if (!selectedCase) {
      toast({
        title: "エラー",
        description: "案件を選択してください",
        variant: "destructive",
      });
      return;
    }

    // Start the matching process
    setMatchingInProgress(true);
    setProgress(0);
    setApiResponse(null);

    // Show toast notification
    toast({
      title: "マッチング処理を開始しました",
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
      // selectedCase.id は既にstring型（UUID）
      const projectId = selectedCase.id;
      const response = await findEngineersForProject(
        projectId,
        {
          max_matches: maxMatches,
          min_score: minScore,
          weights: defaultWeights,
          filters: defaultFilters,
        }
      );

      // デバッグログ：新しいAPIレスポンス構造を確認
      console.log('=== Project-to-Engineers API Response ===', response);
      console.log('=== Matched Engineers ===', response.matched_engineers);
      if (response.matched_engineers && response.matched_engineers.length > 0) {
        console.log('=== First Engineer Sample ===', response.matched_engineers[0]);
      }

      // プログレス完了
      clearInterval(progressInterval);
      setProgress(100);

      // レスポンスを保存
      setApiResponse(response);

      // 結果を変換して表示
      const convertedResults = convertApiResponseToResults(response);
      setMatchingResults(convertedResults);

      // 完了通知
      toast({
        title: "マッチング完了",
        description: `${response.total_matches}人の候補者が見つかりました（高品質マッチ: ${response.high_quality_matches}人）`,
      });

    } catch (error) {
      console.error('マッチングエラー:', error);

      // エラー時は空の結果を表示
      setMatchingResults([]);
      setProgress(100);

      const errorMessage = isApiError(error)
        ? error.message
        : 'マッチング処理中にエラーが発生しました。しばらくしてから再度お試しください。';

      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Handle case selection
  const handleCaseSelect = (caseItem: CaseItem) => {
    setSelectedCase(caseItem);

    toast({
      title: "案件を選択しました",
      description: `${caseItem.title}を選択しました`,
    });
  };

  // Handle structured data from text input
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStructuredData = (data: any) => {
    // Update selected case with extracted data
    const extractedCase = {
      id: Date.now().toString(),
      title: data.title || "案件テキストから抽出",
      client: data.company || "未指定",
      skills: data.skills.split(',').map((s: string) => s.trim()),
      experience: data.experience,
      budget: data.budget,
      location: data.location,
      workType: data.workType,
      priority: "medium",
      description: data.originalText,
      detailDescription: data.detailDescription || data.originalText,
      companyType: data.companyType || "未設定"
    };

    setSelectedCase(extractedCase);

    toast({
      title: "データを抽出しました",
      description: "案件テキストからデータを抽出しました",
    });
  };


  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Parameter Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="japanese-text">マッチングパラメータ設定</CardTitle>
            <CardDescription className="japanese-text">
              案件に合った人材を探すためのパラメータを設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <CaseSelectionDialog onSelect={handleCaseSelect} />
            </div>

            {/* Display selected case info using the new component */}
            {selectedCase && <CaseDetailDisplay caseData={selectedCase} />}

            {/* マッチング設定 */}
            <div className="mt-6 space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxMatches" className="japanese-text">最大マッチ数</Label>
                  <Input
                    id="maxMatches"
                    type="number"
                    min="1"
                    max="50"
                    value={maxMatches}
                    onChange={(e) => setMaxMatches(parseInt(e.target.value) || 10)}
                    className="japanese-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minScore" className="japanese-text">最小スコア</Label>
                  <Input
                    id="minScore"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minScore}
                    onChange={(e) => setMinScore(parseFloat(e.target.value) || 0.6)}
                    className="japanese-text"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground japanese-text">
                最小スコア: 0.0（低い閾値）〜 1.0（高い閾値）
              </p>
            </div>


            <Button
              onClick={startMatching}
              className="w-full japanese-text mt-6"
              disabled={matchingInProgress || !selectedCase}
            >
              {matchingInProgress ? (
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
          isInProgress={matchingInProgress}
          completionMessage={apiResponse ? `${apiResponse.total_matches}人の候補者が見つかりました` : "6人の候補者が見つかりました"}
          processingMessage="候補者データを分析中..."
        />
      </div>

      {/* Enhanced Matching Results Table - replacing the MatchingResultsCard */}
      {matchingResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="japanese-text">マッチング結果</CardTitle>
                <CardDescription className="japanese-text">
                  {selectedCase?.title || '選択された案件'}に合う候補者が見つかりました
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
                    スコア閾値: {formatMatchScore(minScore)}
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
