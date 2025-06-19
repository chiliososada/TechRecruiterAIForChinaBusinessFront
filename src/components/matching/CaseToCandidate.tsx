
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileText, Loader } from 'lucide-react';
import { CaseSelectionDialog } from './CaseSelectionDialog';
import { MatchingProgressCard } from './MatchingProgressCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CaseTextInput } from './CaseTextInput';
import { Badge } from '@/components/ui/badge';
import { CaseDetailDisplay } from './CaseDetailDisplay';
import { EnhancedMatchingResultsTable } from './EnhancedMatchingResultsTable';
import { EnhancedMatchingResult } from './types';

interface CaseItem {
  id: number;
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
  const [matchingResults, setMatchingResults] = useState<EnhancedMatchingResult[]>([
    {
      id: 1,
      caseId: 'c101',
      candidateId: 'u1',
      caseName: 'Java開発エンジニア',
      candidateName: '鈴木太郎',
      matchingRate: '92%',
      matchingReason: 'スキル・経験年数・単価が一致',
      caseCompany: 'システム開発株式会社',
      candidateCompany: 'テック株式会社',
      caseManager: '田中課長',
      caseManagerEmail: 'tanaka@system-dev.co.jp',
      affiliationManager: '山本部長',
      affiliationManagerEmail: 'yamamoto@tech-co.jp',
      memo: '希望単価70万円/月',
      recommendationComment: 'コミュニケーション能力も高いため推薦します'
    },
    {
      id: 2,
      caseId: 'c102',
      candidateId: 'u2',
      caseName: 'フロントエンドエンジニア',
      candidateName: '田中花子',
      matchingRate: '89%',
      matchingReason: 'React経験が案件要件に一致',
      caseCompany: 'ウェブ開発株式会社',
      candidateCompany: 'エンジニア株式会社',
      caseManager: '伊藤課長',
      caseManagerEmail: 'ito@web-dev.co.jp',
      affiliationManager: '佐藤課長',
      affiliationManagerEmail: 'sato@engineer.co.jp',
    },
    {
      id: 3,
      caseId: 'c103',
      candidateId: 'u3',
      caseName: 'インフラエンジニア',
      candidateName: '佐藤一郎',
      matchingRate: '94%',
      matchingReason: 'AWS/Dockerの経験が豊富',
      caseCompany: 'クラウドサービス株式会社',
      candidateCompany: 'ITソリューション株式会社',
      caseManager: '小林部長',
      caseManagerEmail: 'kobayashi@cloud.co.jp',
      affiliationManager: '高橋マネージャー',
      affiliationManagerEmail: 'takahashi@it-solutions.co.jp',
      recommendationComment: '自動化スキルが高く、迅速な対応が可能',
    },
    {
      id: 4,
      caseId: 'c104',
      candidateId: 'u4',
      caseName: 'バックエンドエンジニア',
      candidateName: '山田健太',
      matchingRate: '75%',
      matchingReason: 'Python経験あるが、年数不足',
      caseCompany: 'サーバー株式会社',
      candidateCompany: 'デベロップ株式会社',
      caseManager: '加藤部長',
      caseManagerEmail: 'kato@server.co.jp',
      affiliationManager: '木村リーダー',
      affiliationManagerEmail: 'kimura@develop.co.jp',
      memo: '研修後に参画可能',
    },
    {
      id: 5,
      caseId: 'c105',
      candidateId: 'u5',
      caseName: 'モバイルアプリ開発',
      candidateName: '伊藤誠',
      matchingRate: '88%',
      matchingReason: 'iOSとAndroid両方の開発経験あり',
      caseCompany: 'アプリケーション株式会社',
      candidateCompany: 'モバイル株式会社',
      caseManager: '斎藤課長',
      caseManagerEmail: 'saito@app.co.jp',
      affiliationManager: '渡辺マネージャー',
      affiliationManagerEmail: 'watanabe@mobile.co.jp',
    },
    {
      id: 6,
      caseId: 'c106',
      candidateId: 'u6',
      caseName: 'データサイエンティスト',
      candidateName: '高橋直樹',
      matchingRate: '91%',
      matchingReason: 'Pythonと機械学習のスキルが一致',
      caseCompany: '分析株式会社',
      candidateCompany: 'データ株式会社',
      caseManager: '佐々木部長',
      caseManagerEmail: 'sasaki@analysis.co.jp',
      affiliationManager: '中村リーダー',
      affiliationManagerEmail: 'nakamura@data.co.jp',
      recommendationComment: 'デモ実績多数あり、即戦力として期待できる',
    }
  ]);

  // Handle Case to Candidate matching
  const startMatching = () => {
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

    // Show toast notification
    toast({
      title: "マッチング処理を開始しました",
      description: "処理が完了するまでお待ちください",
    });

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setMatchingInProgress(false);
          
          // Show completion toast
          toast({
            title: "マッチング完了",
            description: "6人の候補者が見つかりました",
          });
          
          return 100;
        }
        
        return newProgress;
      });
    }, 500);
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
  const handleStructuredData = (data: any) => {
    // Update selected case with extracted data
    const extractedCase = {
      id: Date.now(),
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
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <CaseSelectionDialog onSelect={handleCaseSelect} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full japanese-text">
                    <FileText className="mr-2 h-4 w-4" />
                    案件テキスト検索
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="japanese-text">案件テキスト検索</DialogTitle>
                    <DialogDescription className="japanese-text">
                      案件のテキスト情報を入力して構造化データに変換します。
                    </DialogDescription>
                  </DialogHeader>
                  <CaseTextInput onStructuredData={handleStructuredData} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Display selected case info using the new component */}
            {selectedCase && <CaseDetailDisplay caseData={selectedCase} />}
            
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
                <span className="japanese-text">マッチングを開始</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Matching Progress Card */}
        <MatchingProgressCard 
          progress={progress}
          isInProgress={matchingInProgress}
          completionMessage="6人の候補者が見つかりました"
          processingMessage="候補者データを分析中..."
        />
      </div>

      {/* Enhanced Matching Results Table - replacing the MatchingResultsCard */}
      {matchingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="japanese-text">マッチング結果</CardTitle>
            <CardDescription className="japanese-text">
              {selectedCase?.title || '選択された案件'}に合う候補者が見つかりました
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedMatchingResultsTable results={matchingResults} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
