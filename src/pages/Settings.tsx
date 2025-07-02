
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { EmailTemplateSettings } from '@/components/settings/EmailTemplateSettings';

export function Settings() {
  const { currentTenant } = useAuth();
  
  // Check if user has access to general settings based on subscription plan
  const hasGeneralSettingsAccess = React.useMemo(() => {
    const subscriptionPlan = currentTenant?.subscription_plan?.toLowerCase();
    return subscriptionPlan !== 'basic' && subscriptionPlan !== 'free';
  }, [currentTenant?.subscription_plan]);

  // Determine default tab based on subscription access
  const defaultTab = hasGeneralSettingsAccess ? "general" : "templates";

  return (
    <MainLayout>
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight japanese-text">設定</h2>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            {hasGeneralSettingsAccess && (
              <TabsTrigger value="general" className="japanese-text">一般設定</TabsTrigger>
            )}
            <TabsTrigger value="templates" className="japanese-text">メールテンプレート設定</TabsTrigger>
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
          
          <TabsContent value="templates" className="space-y-6">
            <EmailTemplateSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default Settings;
