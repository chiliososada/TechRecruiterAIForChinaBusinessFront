import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Brain,
  Target,
  Zap
} from 'lucide-react';
import { formatMatchScore, getMatchScoreColor } from '@/services/aiMatchingService';

interface AIMatchingResultCardProps {
  totalMatches: number;
  highQualityMatches: number;
  processingTime: number;
  averageScore: number;
  recommendations?: string[];
  warnings?: string[];
  minScore: number;
}

export function AIMatchingResultCard({
  totalMatches,
  highQualityMatches,
  processingTime,
  averageScore,
  recommendations = [],
  warnings = [],
  minScore
}: AIMatchingResultCardProps) {
  const highQualityRate = totalMatches > 0 ? (highQualityMatches / totalMatches) * 100 : 0;
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <CardTitle className="japanese-text text-blue-900">AIマッチング分析結果</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white text-blue-600 border-blue-300">
            <Zap className="w-3 h-3 mr-1" />
            AI分析完了
          </Badge>
        </div>
        <CardDescription className="text-blue-700">
          高度なAIアルゴリズムによる詳細分析レポート
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 主要指標 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 japanese-text">総マッチ数</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{totalMatches}</div>
            <div className="text-xs text-blue-600 japanese-text">件</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 japanese-text">高品質マッチ</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">{highQualityMatches}</div>
            <div className="text-xs text-green-600 japanese-text">
              {formatMatchScore(highQualityRate / 100)} of total
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 japanese-text">平均スコア</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {formatMatchScore(averageScore)}
            </div>
            <div className="text-xs text-purple-600 japanese-text">品質指標</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 japanese-text">処理時間</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {processingTime.toFixed(1)}
            </div>
            <div className="text-xs text-orange-600 japanese-text">秒</div>
          </div>
        </div>

        {/* 品質分析 */}
        <div className="space-y-3">
          <h4 className="font-medium text-blue-900 japanese-text flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            マッチング品質分析
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 japanese-text">高品質マッチ率</span>
              <span className="font-medium text-blue-900">{formatMatchScore(highQualityRate / 100)}</span>
            </div>
            <Progress value={highQualityRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 japanese-text">スコア閾値達成率</span>
              <span className="font-medium text-blue-900">
                {totalMatches > 0 ? '100%' : '0%'}
              </span>
            </div>
            <Progress value={totalMatches > 0 ? 100 : 0} className="h-2" />
            <div className="text-xs text-blue-600 japanese-text">
              最小スコア {formatMatchScore(minScore)} 以上のマッチのみ表示
            </div>
          </div>
        </div>

        <Separator />

        {/* レコメンデーション */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-green-900 japanese-text flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              AIレコメンデーション
            </h4>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800 japanese-text">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 警告・注意事項 */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-amber-900 japanese-text flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              注意事項
            </h4>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-amber-800 japanese-text">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" className="japanese-text">
            <Star className="h-4 w-4 mr-2" />
            高品質マッチのみ表示
          </Button>
          <Button variant="outline" size="sm" className="japanese-text">
            <TrendingUp className="h-4 w-4 mr-2" />
            詳細分析レポート
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}