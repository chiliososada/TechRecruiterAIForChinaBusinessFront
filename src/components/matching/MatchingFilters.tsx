import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, RotateCcw } from 'lucide-react';
import { ProjectToEngineersRequest, EngineerToProjectsRequest } from '@/services/aiMatchingService';

interface MatchingFiltersProps {
  type: 'project-to-engineers' | 'engineer-to-projects';
  filters: Partial<ProjectToEngineersRequest['filters'] & EngineerToProjectsRequest['filters']>;
  weights: Partial<ProjectToEngineersRequest['weights'] & EngineerToProjectsRequest['weights']>;
  maxMatches: number;
  minScore: number;
  onFiltersChange: (filters: any) => void;
  onWeightsChange: (weights: any) => void;
  onMaxMatchesChange: (maxMatches: number) => void;
  onMinScoreChange: (minScore: number) => void;
  onReset: () => void;
}

export function MatchingFilters({
  type,
  filters,
  weights,
  maxMatches,
  minScore,
  onFiltersChange,
  onWeightsChange,
  onMaxMatchesChange,
  onMinScoreChange,
  onReset,
}: MatchingFiltersProps) {
  // 日本語レベルの選択肢
  const japaneseLevels = ['N1', 'N2', 'N3', 'N4', 'N5', 'ネイティブ', '日常会話', 'ビジネス'];
  
  // ステータスの選択肢（案件）
  const projectStatuses = ['募集中', 'active', '面談中', '決定', '終了', '保留'];
  
  // ステータスの選択肢（エンジニア）
  const engineerStatuses = ['available', '在職', '稼働中', '面談中', '休職中'];
  
  // 会社タイプの選択肢
  const companyTypes = ['自社', 'SES', '派遣', '客先常駐', '他社'];

  // フィルターの更新
  const updateFilters = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // 重みの更新
  const updateWeights = (key: string, value: number) => {
    onWeightsChange({ ...weights, [key]: value / 100 });
  };

  // 配列型フィルターの更新
  const updateArrayFilter = (key: string, value: string, checked: boolean) => {
    const currentArray = (filters as any)[key] || [];
    if (checked) {
      updateFilters(key, [...currentArray, value]);
    } else {
      updateFilters(key, currentArray.filter((item: string) => item !== value));
    }
  };

  // スキルタグの追加
  const addSkillTag = (skillInput: string) => {
    if (skillInput.trim() && !(filters.skills || []).includes(skillInput.trim())) {
      updateFilters('skills', [...(filters.skills || []), skillInput.trim()]);
    }
  };

  // スキルタグの削除
  const removeSkillTag = (skill: string) => {
    updateFilters('skills', (filters.skills || []).filter((s: string) => s !== skill));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="japanese-text flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            詳細フィルター設定
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset} className="japanese-text">
            <RotateCcw className="mr-2 h-4 w-4" />
            リセット
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本設定 */}
        <div className="space-y-4">
          <h4 className="font-medium japanese-text">基本設定</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="japanese-text">最大マッチング数: {maxMatches}</Label>
              <Slider
                value={[maxMatches]}
                onValueChange={(value) => onMaxMatchesChange(value[0])}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground japanese-text">
                1〜100件
              </div>
            </div>
            <div className="space-y-2">
              <Label className="japanese-text">最小マッチスコア: {Math.round(minScore * 100)}%</Label>
              <Slider
                value={[minScore * 100]}
                onValueChange={(value) => onMinScoreChange(value[0] / 100)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground japanese-text">
                0%〜100%
              </div>
            </div>
          </div>
        </div>

        {/* マッチング重み設定 */}
        <div className="space-y-4">
          <h4 className="font-medium japanese-text">マッチング重み設定</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="japanese-text">
                スキルマッチ: {Math.round((weights.skill_match || 0.3) * 100)}%
              </Label>
              <Slider
                value={[(weights.skill_match || 0.3) * 100]}
                onValueChange={(value) => updateWeights('skill_match', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="japanese-text">
                経験マッチ: {Math.round((weights.experience_match || 0.25) * 100)}%
              </Label>
              <Slider
                value={[(weights.experience_match || 0.25) * 100]}
                onValueChange={(value) => updateWeights('experience_match', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            {type === 'project-to-engineers' && (
              <>
                <div className="space-y-2">
                  <Label className="japanese-text">
                    プロジェクト経験マッチ: {Math.round((weights.project_experience_match || 0.2) * 100)}%
                  </Label>
                  <Slider
                    value={[(weights.project_experience_match || 0.2) * 100]}
                    onValueChange={(value) => updateWeights('project_experience_match', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="japanese-text">
                    日本語レベルマッチ: {Math.round((weights.japanese_level_match || 0.15) * 100)}%
                  </Label>
                  <Slider
                    value={[(weights.japanese_level_match || 0.15) * 100]}
                    onValueChange={(value) => updateWeights('japanese_level_match', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </>
            )}
            {type === 'engineer-to-projects' && (
              <div className="space-y-2">
                <Label className="japanese-text">
                  予算マッチ: {Math.round((weights.budget_match || 0.2) * 100)}%
                </Label>
                <Slider
                  value={[(weights.budget_match || 0.2) * 100]}
                  onValueChange={(value) => updateWeights('budget_match', value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="japanese-text">
                場所マッチ: {Math.round((weights.location_match || 0.1) * 100)}%
              </Label>
              <Slider
                value={[(weights.location_match || 0.1) * 100]}
                onValueChange={(value) => updateWeights('location_match', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* フィルター設定 */}
        <div className="space-y-4">
          <h4 className="font-medium japanese-text">フィルター条件</h4>
          
          {type === 'project-to-engineers' && (
            <>
              {/* 日本語レベル */}
              <div className="space-y-2">
                <Label className="japanese-text">日本語レベル</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {japaneseLevels.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`japanese-${level}`}
                        checked={(filters.japanese_level || []).includes(level)}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('japanese_level', level, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`japanese-${level}`} 
                        className="text-sm japanese-text"
                      >
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* エンジニアステータス */}
              <div className="space-y-2">
                <Label className="japanese-text">エンジニアステータス</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {engineerStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`engineer-status-${status}`}
                        checked={(filters.current_status || []).includes(status)}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('current_status', status, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`engineer-status-${status}`} 
                        className="text-sm japanese-text"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最小経験年数 */}
              <div className="space-y-2">
                <Label className="japanese-text">最小経験年数</Label>
                <Input
                  type="number"
                  placeholder="例: 3"
                  value={filters.min_experience || ''}
                  onChange={(e) => updateFilters('min_experience', parseInt(e.target.value) || 0)}
                  className="japanese-text"
                />
              </div>

              {/* 最大期待給与 */}
              <div className="space-y-2">
                <Label className="japanese-text">最大期待給与（月額万円）</Label>
                <Input
                  type="number"
                  placeholder="例: 80"
                  value={filters.max_expected_salary || ''}
                  onChange={(e) => updateFilters('max_expected_salary', parseInt(e.target.value) || 0)}
                  className="japanese-text"
                />
              </div>
            </>
          )}

          {type === 'engineer-to-projects' && (
            <>
              {/* 案件ステータス */}
              <div className="space-y-2">
                <Label className="japanese-text">案件ステータス</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {projectStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-status-${status}`}
                        checked={(filters.status || []).includes(status)}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('status', status, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`project-status-${status}`} 
                        className="text-sm japanese-text"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 会社タイプ */}
              <div className="space-y-2">
                <Label className="japanese-text">会社タイプ</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {companyTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`company-type-${type}`}
                        checked={(filters.company_type || []).includes(type)}
                        onCheckedChange={(checked) => 
                          updateArrayFilter('company_type', type, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`company-type-${type}`} 
                        className="text-sm japanese-text"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* リモート勤務オプション */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote-option"
                  checked={filters.remote_option || false}
                  onCheckedChange={(checked) => updateFilters('remote_option', checked)}
                />
                <Label htmlFor="remote-option" className="japanese-text">
                  リモート勤務対応案件のみ
                </Label>
              </div>

              {/* 予算範囲 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="japanese-text">最低予算（万円）</Label>
                  <Input
                    type="number"
                    placeholder="例: 50"
                    value={filters.min_budget || ''}
                    onChange={(e) => updateFilters('min_budget', parseInt(e.target.value) || 0)}
                    className="japanese-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="japanese-text">最高予算（万円）</Label>
                  <Input
                    type="number"
                    placeholder="例: 100"
                    value={filters.max_budget || ''}
                    onChange={(e) => updateFilters('max_budget', parseInt(e.target.value) || 0)}
                    className="japanese-text"
                  />
                </div>
              </div>
            </>
          )}

          {/* スキルフィルター（共通） */}
          <div className="space-y-2">
            <Label className="japanese-text">必須スキル</Label>
            <div className="space-y-2">
              <Input
                placeholder="スキルを入力してEnterで追加"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="japanese-text"
              />
              <div className="flex flex-wrap gap-2">
                {(filters.skills || []).map((skill) => (
                  <Badge key={skill} variant="secondary" className="japanese-text">
                    {skill}
                    <button
                      onClick={() => removeSkillTag(skill)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}