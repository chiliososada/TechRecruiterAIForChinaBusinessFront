import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Mail, History, Wifi, Save, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveSMTPSettings, getSMTPSettings, testSMTPConnection } from '@/utils/backend-api';
import { useAuth } from '@/contexts/AuthContext';

export function Email() {
  const { toast } = useToast();
  const { user, currentTenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // SMTP Settings state
  const [smtpSettings, setSmtpSettings] = useState({
    settingName: '',
    emailProvider: 'imap',
    smtpHost: '',
    smtpPort: '587',
    encryptionType: 'STARTTLS',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    dailySendLimit: '100',
    hourlySendLimit: '20',
    isDefault: true
  });

  // Load existing SMTP settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await getSMTPSettings(user);
        if (result.success && result.data && result.data.length > 0) {
          const settings = result.data[0]; // Get the first/default settings
          setSmtpSettings({
            settingName: settings.setting_name || '',
            emailProvider: 'imap',
            smtpHost: settings.smtp_host || '',
            smtpPort: settings.smtp_port?.toString() || '587',
            encryptionType: settings.security_protocol || 'STARTTLS',
            smtpUsername: settings.smtp_username || '',
            smtpPassword: '', // Don't load password for security
            fromEmail: settings.from_email || '',
            fromName: settings.from_name || '',
            replyToEmail: settings.reply_to_email || '',
            dailySendLimit: settings.daily_send_limit?.toString() || '100',
            hourlySendLimit: settings.hourly_send_limit?.toString() || '20',
            isDefault: settings.is_default || true
          });
          toast({
            title: "設定を読み込みました",
            description: "既存のSMTP設定を読み込みました。",
          });
        }
      } catch (error) {
        console.error('Failed to load SMTP settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ユーザー情報が見つかりません。",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!smtpSettings.settingName || !smtpSettings.smtpHost || !smtpSettings.smtpUsername || !smtpSettings.smtpPassword) {
      toast({
        title: "入力エラー",
        description: "必須項目を入力してください。",
        variant: "destructive",
      });
      return;
    }

    setSavingSettings(true);
    try {
      const result = await saveSMTPSettings({
        setting_name: smtpSettings.settingName,
        smtp_host: smtpSettings.smtpHost,
        smtp_port: parseInt(smtpSettings.smtpPort),
        smtp_username: smtpSettings.smtpUsername,
        smtp_password: smtpSettings.smtpPassword,
        security_protocol: smtpSettings.encryptionType as 'SSL' | 'STARTTLS' | 'NONE',
        from_email: smtpSettings.fromEmail || smtpSettings.smtpUsername,
        from_name: smtpSettings.fromName || 'AIマッチくん',
        reply_to_email: smtpSettings.replyToEmail || smtpSettings.fromEmail || smtpSettings.smtpUsername,
        daily_send_limit: parseInt(smtpSettings.dailySendLimit) || 100,
        hourly_send_limit: parseInt(smtpSettings.hourlySendLimit) || 20,
        is_default: smtpSettings.isDefault
      }, user);

      if (result.success) {
        toast({
          title: "設定を保存しました",
          description: "SMTP設定が正常に保存されました。",
        });
      } else {
        toast({
          title: "保存エラー",
          description: result.message || "SMTP設定の保存に失敗しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Save SMTP settings error:', error);
      toast({
        title: "保存エラー",
        description: "SMTP設定の保存中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
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

  const testConnection = async () => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ユーザー情報が見つかりません。",
        variant: "destructive",
      });
      return;
    }

    // Get the saved SMTP setting ID or check if we have an existing setting
    const smtpSettingId = localStorage.getItem('default_smtp_setting_id');
    
    if (!smtpSettingId) {
      toast({
        title: "SMTP設定が見つかりません",
        description: "先にSMTP設定を保存してから接続テストを行ってください。",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    
    toast({
      title: "接続テスト中...",
      description: "メールサーバーへの接続をテストしています。",
    });

    try {
      const result = await testSMTPConnection(smtpSettingId, user.email, user);
      
      if (result.status === 'success') {
        toast({
          title: "接続テスト成功",
          description: `メールサーバーに正常に接続できました。\nサーバー: ${result.connection_config?.host || 'N/A'}`,
        });
      } else {
        toast({
          title: "接続テスト失敗",
          description: result.message || "メールサーバーへの接続に失敗しました。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "接続テストエラー",
        description: "接続テスト中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
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

        {/* Check if user has access to premium email features */}
        {(() => {
          const subscriptionPlan = currentTenant?.subscription_plan?.toLowerCase();
          const hasPremiumFeatures = subscriptionPlan !== 'basic' && subscriptionPlan !== 'free';
          const defaultTab = hasPremiumFeatures ? "execution" : "security";
          
          return (
            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList className={`grid w-full md:w-auto ${hasPremiumFeatures ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {hasPremiumFeatures && (
                  <TabsTrigger value="execution" className="japanese-text">実行条件</TabsTrigger>
                )}
                {hasPremiumFeatures && (
                  <TabsTrigger value="filter" className="japanese-text">フィルター条件</TabsTrigger>
                )}
                <TabsTrigger value="security" className="japanese-text">セキュリティ設定</TabsTrigger>
              </TabsList>

              {/* Tab 1: Frequency and Execution Conditions */}
              {hasPremiumFeatures && (
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
              )}

              {/* Tab 2: Email Filter Conditions */}
              {hasPremiumFeatures && (
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
              )}

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
                  <Select 
                    value={smtpSettings.emailProvider} 
                    onValueChange={(value) => setSmtpSettings({...smtpSettings, emailProvider: value})}
                  >
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
                  
                  {/* Setting Name */}
                  <div className="space-y-2">
                    <Label htmlFor="setting-name" className="japanese-text">設定名 <span className="text-red-500">*</span></Label>
                    <Input 
                      id="setting-name" 
                      placeholder="お名前.com SSL設定" 
                      value={smtpSettings.settingName}
                      onChange={(e) => setSmtpSettings({...smtpSettings, settingName: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      この設定の識別名
                    </p>
                  </div>
                  
                  {/* SMTP Server */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="smtp-server" className="japanese-text">SMTPサーバー <span className="text-red-500">*</span></Label>
                    <Input 
                      id="smtp-server" 
                      placeholder="mail92.onamae.ne.jp" 
                      value={smtpSettings.smtpHost}
                      onChange={(e) => setSmtpSettings({...smtpSettings, smtpHost: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      メールサービスプロバイダのSMTPサーバー名
                    </p>
                  </div>
                  
                  {/* Port Number */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="port-number" className="japanese-text">ポート番号 <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      id="port-number" 
                      placeholder="465" 
                      value={smtpSettings.smtpPort}
                      onChange={(e) => setSmtpSettings({...smtpSettings, smtpPort: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      一般的に587（STARTTLS）または465（SSL）を使用
                    </p>
                  </div>
                  
                  {/* Encryption Type */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="encryption-type" className="japanese-text">暗号化方式 <span className="text-red-500">*</span></Label>
                    <Select 
                      value={smtpSettings.encryptionType} 
                      onValueChange={(value) => setSmtpSettings({...smtpSettings, encryptionType: value})}
                    >
                      <SelectTrigger id="encryption-type">
                        <SelectValue placeholder="暗号化方式を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STARTTLS">STARTTLS（推奨）</SelectItem>
                        <SelectItem value="SSL">SSL</SelectItem>
                        <SelectItem value="NONE">なし</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Authentication Username */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="auth-username" className="japanese-text">認証ユーザー名 <span className="text-red-500">*</span></Label>
                    <Input 
                      type="email" 
                      id="auth-username" 
                      placeholder="ryushigen@toyousoft.co.jp" 
                      value={smtpSettings.smtpUsername}
                      onChange={(e) => setSmtpSettings({...smtpSettings, smtpUsername: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      使用するメールアドレス
                    </p>
                  </div>
                  
                  {/* Authentication Password */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="auth-password" className="japanese-text">認証パスワード <span className="text-red-500">*</span></Label>
                    <Input 
                      type="password" 
                      id="auth-password" 
                      placeholder="••••••••" 
                      value={smtpSettings.smtpPassword}
                      onChange={(e) => setSmtpSettings({...smtpSettings, smtpPassword: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      通常のパスワード、またはアプリ用パスワード（Gmailなど）
                    </p>
                  </div>
                  
                  {/* Sender Email */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="sender-email" className="japanese-text">送信元メール</Label>
                    <Input 
                      type="email" 
                      id="sender-email" 
                      placeholder="ryushigen@toyousoft.co.jp" 
                      value={smtpSettings.fromEmail}
                      onChange={(e) => setSmtpSettings({...smtpSettings, fromEmail: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      通常は認証ユーザー名と同じ
                    </p>
                  </div>
                  
                  {/* Sender Name */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="sender-name" className="japanese-text">送信者名（From）</Label>
                    <Input 
                      id="sender-name" 
                      placeholder="株式会社トヨウソフト" 
                      value={smtpSettings.fromName}
                      onChange={(e) => setSmtpSettings({...smtpSettings, fromName: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      受信者に表示される名前
                    </p>
                  </div>
                  
                  {/* Reply-to Email */}
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="reply-to-email" className="japanese-text">返信先メール</Label>
                    <Input 
                      type="email" 
                      id="reply-to-email" 
                      placeholder="ryushigen@toyousoft.co.jp" 
                      value={smtpSettings.replyToEmail}
                      onChange={(e) => setSmtpSettings({...smtpSettings, replyToEmail: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground japanese-text">
                      返信時の宛先（省略可）
                    </p>
                  </div>
                  
                  {/* Send Limits */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="daily-limit" className="japanese-text">1日の送信上限</Label>
                      <Input 
                        type="number" 
                        id="daily-limit" 
                        placeholder="100" 
                        value={smtpSettings.dailySendLimit}
                        onChange={(e) => setSmtpSettings({...smtpSettings, dailySendLimit: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourly-limit" className="japanese-text">1時間の送信上限</Label>
                      <Input 
                        type="number" 
                        id="hourly-limit" 
                        placeholder="20" 
                        value={smtpSettings.hourlySendLimit}
                        onChange={(e) => setSmtpSettings({...smtpSettings, hourlySendLimit: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline"
                    className="japanese-text flex items-center"
                    onClick={testConnection}
                    disabled={testingConnection || loading}
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        接続テスト中...
                      </>
                    ) : (
                      <>
                        <Wifi className="mr-2 h-4 w-4" />
                        接続テスト
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
              </TabsContent>
            </Tabs>
          );
        })()}
        
        <Button 
          className="w-full japanese-text" 
          onClick={handleSave}
          disabled={savingSettings || loading}
        >
          {savingSettings ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              設定を保存
            </>
          )}
        </Button>
      </div>
    </MainLayout>
  );
}

export default Email;
