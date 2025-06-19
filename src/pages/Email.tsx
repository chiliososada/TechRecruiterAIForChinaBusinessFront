import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Mail, History, Wifi } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Email() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "設定を保存しました",
      description: "メール連携の設定が正常に保存されました。",
    });
  };
  
  const restoreLastSettings = () => {
    toast({
      title: "前回の設定に戻しています",
      description: "以前の設定を復元しています。",
    });
    // 前回の設定を復元する処理
    setTimeout(() => {
      toast({
        title: "設定を復元しました",
        description: "前回の設定に正常に戻りました。",
      });
    }, 1000);
  };

  const testConnection = () => {
    toast({
      title: "接続テスト中...",
      description: "メールサーバーへの接続をテストしています。",
    });
    
    // 接続テスト処理をシミュレート
    setTimeout(() => {
      toast({
        title: "接続テスト成功",
        description: "メールサーバーに正常に接続できました。",
      });
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight japanese-text">メール連携</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="japanese-text flex items-center" 
              onClick={restoreLastSettings}
            >
              <History className="mr-1 h-4 w-4" />
              設定 前回の設定に戻す
            </Button>
          </div>
        </div>

        <Tabs defaultValue="execution" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="execution" className="japanese-text">実行条件</TabsTrigger>
            <TabsTrigger value="filter" className="japanese-text">フィルター条件</TabsTrigger>
            <TabsTrigger value="security" className="japanese-text">セキュリティ設定</TabsTrigger>
          </TabsList>

          {/* Tab 1: Frequency and Execution Conditions */}
          <TabsContent value="execution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center japanese-text">
                  <Mail className="mr-2 h-5 w-5" />
                  抽取頻度と実行条件
                </CardTitle>
                <CardDescription className="japanese-text">
                  メール取得の頻度や実行条件を設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="japanese-text">開始執行時間</Label>
                    <Input type="time" id="start-time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval" className="japanese-text">取込間隔</Label>
                    <Select defaultValue="60">
                      <SelectTrigger id="interval">
                        <SelectValue placeholder="取込間隔を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15分ごと</SelectItem>
                        <SelectItem value="30">30分ごと</SelectItem>
                        <SelectItem value="60">1時間ごと</SelectItem>
                        <SelectItem value="180">3時間ごと</SelectItem>
                        <SelectItem value="360">6時間ごと</SelectItem>
                        <SelectItem value="720">12時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="active-hours" className="japanese-text">稼働時間帯</Label>
                    <div className="flex space-x-2">
                      <Input type="time" id="active-hours-start" className="w-full" />
                      <span className="flex items-center">～</span>
                      <Input type="time" id="active-hours-end" className="w-full" />
                    </div>
                    <p className="text-xs text-muted-foreground japanese-text">
                      深夜帯実行を避けるために指定可能
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next-execution" className="japanese-text">次回実行予定</Label>
                    <Input type="text" id="next-execution" value="2025-05-15 15:00" disabled 
                      className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-emails" className="japanese-text">実行最大件数/回</Label>
                  <Input type="number" id="max-emails" placeholder="100" />
                  <p className="text-xs text-muted-foreground japanese-text">
                    1回の実行で処理する最大メール数
                  </p>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Label className="japanese-text font-medium">機能名称と用途</Label>
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="border rounded-md p-3 bg-muted/50">
                      <div className="flex items-center mb-2">
                        <History className="h-4 w-4 mr-2" />
                        <span className="font-medium japanese-text">設定 前回の設定に戻す</span>
                      </div>
                      <p className="text-xs text-muted-foreground japanese-text">
                        設定エラー時に前回の設定に戻すことができます
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Email Filter Conditions */}
          <TabsContent value="filter" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center japanese-text">
                  <Mail className="mr-2 h-5 w-5" />
                  対象メール・フィルター条件
                </CardTitle>
                <CardDescription className="japanese-text">
                  処理対象とするメールの条件を設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Allowed Domains */}
                <div className="space-y-2">
                  <Label htmlFor="allowed-domains" className="japanese-text">対象ドメイン（許可リスト）</Label>
                  <Input id="allowed-domains" placeholder="@abc.co.jp, @xyz-tech.com" />
                  <p className="text-xs text-muted-foreground japanese-text">
                    このドメインのみ処理対象
                  </p>
                </div>
                
                {/* Blocked Domains */}
                <div className="space-y-2">
                  <Label htmlFor="blocked-domains" className="japanese-text">無視するドメイン（拒否リスト）</Label>
                  <Input id="blocked-domains" placeholder="@newsletter.com, @noreply.x" />
                  <p className="text-xs text-muted-foreground japanese-text">
                    無視する送信元
                  </p>
                </div>
                
                {/* Ignored Keywords */}
                <div className="space-y-2">
                  <Label htmlFor="ignored-keywords" className="japanese-text">無視キーワード（件名）</Label>
                  <Input id="ignored-keywords" placeholder="広告, キャンペーン" />
                  <p className="text-xs text-muted-foreground japanese-text">
                    件名に含まれる場合はスキップ
                  </p>
                </div>
                
                {/* Error Handling */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-3 japanese-text">エラー処理と通知設定</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="error-email" className="japanese-text">エラー通知先メールアドレス</Label>
                      <Input id="error-email" placeholder="system-alert@yourcompany.co.jp" />
                      <p className="text-xs text-muted-foreground japanese-text">
                        処理失敗時に通知送信
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="error-threshold" className="japanese-text">エラー件数アラート閾値</Label>
                      <Input type="number" id="error-threshold" placeholder="10" />
                      <p className="text-xs text-muted-foreground japanese-text">
                        過剰な失敗時の監視目的
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Connection and Security Settings - Updated with detailed SMTP configuration */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center japanese-text">
                  <Shield className="mr-2 h-5 w-5" />
                  接続・セキュリティ設定
                </CardTitle>
                <CardDescription className="japanese-text">
                  メールアカウントの接続とセキュリティ設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-provider" className="japanese-text">メールプロバイダー</Label>
                  <Select defaultValue="gmail">
                    <SelectTrigger id="email-provider">
                      <SelectValue placeholder="メールプロバイダーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Microsoft 365 / Outlook</SelectItem>
                      <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                      <SelectItem value="imap">汎用 IMAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* SMTP Server Configuration */}
                <div className="border-t pt-4">
                  <h3 className="text-md font-medium mb-3 japanese-text">SMTP設定</h3>
                  
                  {/* SMTP Server */}
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server" className="japanese-text">SMTPサーバー</Label>
                    <Input id="smtp-server" placeholder="smtp.gmail.com" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      メールサービスプロバイダのSMTPサーバー名
                    </p>
                  </div>
                  
                  {/* Port Number */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="port-number" className="japanese-text">ポート番号</Label>
                    <Input type="number" id="port-number" placeholder="587" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      一般的に587（STARTTLS）または465（SSL）を使用
                    </p>
                  </div>
                  
                  {/* Encryption Type */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="encryption-type" className="japanese-text">暗号化方式</Label>
                    <Select defaultValue="starttls">
                      <SelectTrigger id="encryption-type">
                        <SelectValue placeholder="暗号化方式を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starttls">STARTTLS（推奨）</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">なし</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Authentication Username */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="auth-username" className="japanese-text">認証ユーザー名</Label>
                    <Input type="email" id="auth-username" placeholder="yourname@example.com" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      使用するメールアドレス
                    </p>
                  </div>
                  
                  {/* Authentication Password */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="auth-password" className="japanese-text">認証パスワード</Label>
                    <Input type="password" id="auth-password" placeholder="••••••••" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      通常のパスワード、またはアプリ用パスワード（Gmailなど）
                    </p>
                  </div>
                  
                  {/* Sender Email */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="sender-email" className="japanese-text">送信元メール</Label>
                    <Input type="email" id="sender-email" placeholder="yourname@example.com" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      通常は認証ユーザー名と同じ
                    </p>
                  </div>
                  
                  {/* Sender Name */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="sender-name" className="japanese-text">送信者名（From）</Label>
                    <Input id="sender-name" placeholder="AIマッチくん" />
                    <p className="text-xs text-muted-foreground japanese-text">
                      受信者に表示される名前
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline"
                    className="japanese-text flex items-center"
                    onClick={testConnection}
                  >
                    <Wifi className="mr-2 h-4 w-4" />
                    接続テスト
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Button className="w-full japanese-text" onClick={handleSave}>設定を保存</Button>
      </div>
    </MainLayout>
  );
}

export default Email;
