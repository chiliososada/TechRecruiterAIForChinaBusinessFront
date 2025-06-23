
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

export function Settings() {
  const { currentTenant } = useAuth();
  
  // Check if user has access to general settings based on subscription plan
  const hasGeneralSettingsAccess = React.useMemo(() => {
    const subscriptionPlan = currentTenant?.subscription_plan?.toLowerCase();
    return subscriptionPlan !== 'basic' && subscriptionPlan !== 'free';
  }, [currentTenant?.subscription_plan]);

  // Determine default tab based on subscription access
  const defaultTab = hasGeneralSettingsAccess ? "general" : "ai";

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight japanese-text">設定</h2>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            {hasGeneralSettingsAccess && (
              <TabsTrigger value="general" className="japanese-text">一般設定</TabsTrigger>
            )}
            <TabsTrigger value="ai" className="japanese-text">AI設定</TabsTrigger>
            <TabsTrigger value="templates" className="japanese-text">テンプレート</TabsTrigger>
          </TabsList>
          
          {hasGeneralSettingsAccess && (
            <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="japanese-text">アカウント設定</CardTitle>
                <CardDescription className="japanese-text">
                  アカウント情報と通知設定を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="japanese-text">表示名</Label>
                  <Input id="name" defaultValue="Tech Recruiter" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="japanese-text">メールアドレス</Label>
                  <Input id="email" type="email" defaultValue="tech.recruiter@example.com" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="japanese-text">メール通知</Label>
                    <p className="text-sm text-muted-foreground japanese-text">
                      新しい案件や候補者が登録されたときに通知します
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="matching-alerts" className="japanese-text">マッチングアラート</Label>
                    <p className="text-sm text-muted-foreground japanese-text">
                      高マッチング率の候補者が見つかったときに通知します
                    </p>
                  </div>
                  <Switch id="matching-alerts" defaultChecked />
                </div>
                <Button className="w-full japanese-text">設定を保存</Button>
              </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="japanese-text">AI設定</CardTitle>
                <CardDescription className="japanese-text">
                  AIエンジンのパラメータ設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="matching-threshold" className="japanese-text">マッチング閾値</Label>
                      <span className="text-sm">75%</span>
                    </div>
                    <Slider
                      id="matching-threshold"
                      defaultValue={[75]}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground japanese-text">
                      マッチング候補として表示する最低一致率を設定します
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="semantic-matching" className="japanese-text">セマンティックマッチング</Label>
                      <p className="text-sm text-muted-foreground japanese-text">
                        意味的な関連性を考慮したマッチングを行います
                      </p>
                    </div>
                    <Switch id="semantic-matching" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-recommendation" className="japanese-text">自動レコメンデーション</Label>
                      <p className="text-sm text-muted-foreground japanese-text">
                        高マッチング率の案件・候補者を自動的に推薦します
                      </p>
                    </div>
                    <Switch id="auto-recommendation" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="japanese-text">APIキー</Label>
                    <Input id="api-key" type="password" value="sk-••••••••••••••••••••••••" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      外部AIサービスのAPIキーを設定します（オプション）
                    </p>
                  </div>
                </div>
                <Button className="w-full japanese-text">設定を保存</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="japanese-text">テンプレート設定</CardTitle>
                <CardDescription className="japanese-text">
                  自動生成されるテキストのテンプレートを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recommendation-template" className="japanese-text">推薦文テンプレート</Label>
                  <Textarea 
                    id="recommendation-template" 
                    className="min-h-[120px] japanese-text"
                    defaultValue="{name}さんは{primarySkill}を中心に{experienceYears}年以上の開発経験があり、日本語は{japaneseLevel}です。{industry}系のプロジェクトに強みがあります。希望条件は{location}で、単価は{salary}です。"
                  />
                  <p className="text-sm text-muted-foreground japanese-text">
                    {'{変数名}'} の形式で変数を使用できます
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-template" className="japanese-text">案件案内メールテンプレート</Label>
                  <Textarea 
                    id="email-template" 
                    className="min-h-[120px] japanese-text"
                    defaultValue="お世話になっております。
新規案件のご紹介です。

【案件名】{title}
【必須スキル】{skills}
【勤務地】{location}
【単価】{budget}
【期間】{duration}

ご検討のほど、よろしくお願いいたします。"
                  />
                </div>
                
                <Button className="w-full japanese-text">テンプレートを保存</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default Settings;
