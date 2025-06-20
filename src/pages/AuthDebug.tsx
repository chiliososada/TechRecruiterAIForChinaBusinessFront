// 简化版：src/pages/AuthDebug.tsx（去掉refresh token，环境变量获取key）
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuthDebug() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [testType, setTestType] = useState<string>('');

    // 从环境变量获取配置
    const authUrl = import.meta.env.VITE_AUTH_SUPABASE_URL;
    const authKey = import.meta.env.VITE_AUTH_SUPABASE_ANON_KEY;
    const businessUrl = import.meta.env.VITE_BUSINESS_SUPABASE_URL;
    const businessKey = import.meta.env.VITE_BUSINESS_SUPABASE_ANON_KEY;

    // 认证系统测试
    const testDirectCall = async () => {
        setLoading(true);
        setResult(null);
        setTestType('認証システム');

        try {
            console.log('直接API呼び出しテスト');

            if (!authUrl || !authKey) {
                setResult({
                    error: '認証システムの環境変数が設定されていません',
                    details: {
                        url: authUrl ? '✅ 設定済み' : '❌ 未設定',
                        key: authKey ? '✅ 設定済み' : '❌ 未設定'
                    },
                    success: false
                });
                return;
            }

            const response = await fetch(`${authUrl}/functions/v1/auth-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authKey}`,
                    'apikey': authKey,
                },
                body: JSON.stringify({
                    email,
                    password,
                    device_name: 'Debug Test'
                }),
            });

            console.log('レスポンス状態:', response.status);
            console.log('レスポンスヘッダー:', Object.fromEntries(response.headers.entries()));

            let responseData;
            const responseText = await response.text();
            console.log('生のレスポンス:', responseText);

            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON解析エラー:', parseError);
                responseData = { error: 'Invalid JSON response', raw: responseText };
            }

            setResult({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                success: response.ok,
                config: {
                    url: authUrl,
                    keyPrefix: authKey.substring(0, 20) + '...'
                }
            });

        } catch (error) {
            console.error('テストエラー:', error);
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        } finally {
            setLoading(false);
        }
    };

    // 认证数据库测试
    const testDatabaseConnection = async () => {
        setLoading(true);
        setResult(null);
        setTestType('認証データベース');

        try {
            console.log('認証データベース接続テスト');

            if (!authUrl || !authKey) {
                setResult({
                    error: '認証システムの環境変数が設定されていません',
                    success: false
                });
                return;
            }

            // authClientを使ってprofilesテーブルをテスト
            const response = await fetch(`${authUrl}/rest/v1/profiles?select=email&limit=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authKey}`,
                    'apikey': authKey,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            setResult({
                status: response.status,
                message: '認証データベース接続テスト',
                data,
                success: response.ok,
                config: {
                    url: authUrl,
                    keyPrefix: authKey.substring(0, 20) + '...'
                }
            });

        } catch (error) {
            console.error('データベーステストエラー:', error);
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        } finally {
            setLoading(false);
        }
    };

    // 业务数据库测试
    const testBusinessDatabase = async () => {
        setLoading(true);
        setResult(null);
        setTestType('業務データベース');

        try {
            console.log('業務データベース接続テスト');

            if (!businessUrl || !businessKey) {
                setResult({
                    error: '業務データベースの環境変数が設定されていません',
                    details: {
                        url: businessUrl ? '✅ 設定済み' : '❌ 未設定',
                        key: businessKey ? '✅ 設定済み' : '❌ 未設定'
                    },
                    success: false
                });
                return;
            }

            // projectsテーブルをテスト（Postman方式）
            const response = await fetch(`${businessUrl}/rest/v1/projects?select=id,title&limit=3`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${businessKey}`,
                    'apikey': businessKey,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            setResult({
                status: response.status,
                message: '業務データベース接続テスト（API Key方式）',
                config: {
                    url: businessUrl,
                    keyPrefix: businessKey.substring(0, 20) + '...'
                },
                data,
                success: response.ok
            });

        } catch (error) {
            console.error('業務データベーステストエラー:', error);
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        } finally {
            setLoading(false);
        }
    };

    // 完整流程测试 - 新增
    const testFullFlow = async () => {
        setLoading(true);
        setResult(null);
        setTestType('完全フロー');

        try {
            console.log('完全認証フローテスト');

            const results: any = {
                steps: [],
                overall: true
            };

            // 步骤1：认证系统登录
            console.log('ステップ1: 認証システムログイン');
            const loginResponse = await fetch('https://fuetincqvlvcptnzpood.supabase.co/functions/v1/auth-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I',
                },
                body: JSON.stringify({
                    email,
                    password,
                    device_name: 'Flow Test'
                }),
            });

            const loginData = await loginResponse.json();
            const loginSuccess = loginResponse.ok && loginData.success;

            results.steps.push({
                step: 1,
                name: '認証システムログイン',
                success: loginSuccess,
                status: loginResponse.status,
                data: loginSuccess ? '✅ ログイン成功' : loginData.error || 'ログイン失敗'
            });

            if (!loginSuccess) {
                results.overall = false;
                setResult(results);
                return;
            }

            // 步骤2：业务数据库访问
            console.log('ステップ2: 業務データベースアクセス');
            const businessUrl = import.meta.env.VITE_BUSINESS_SUPABASE_URL;
            const businessKey = import.meta.env.VITE_BUSINESS_SUPABASE_ANON_KEY;

            if (businessUrl && businessKey) {
                const businessResponse = await fetch(`${businessUrl}/rest/v1/projects?select=id&limit=1`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${businessKey}`,
                        'apikey': businessKey,
                        'Content-Type': 'application/json'
                    }
                });

                const businessData = await businessResponse.json();
                const businessSuccess = businessResponse.ok;

                results.steps.push({
                    step: 2,
                    name: '業務データベースアクセス',
                    success: businessSuccess,
                    status: businessResponse.status,
                    data: businessSuccess ? `✅ データ取得成功 (${businessData.length}件)` : '❌ アクセス失敗'
                });

                if (!businessSuccess) {
                    results.overall = false;
                }
            } else {
                results.steps.push({
                    step: 2,
                    name: '業務データベースアクセス',
                    success: false,
                    data: '❌ 環境変数未設定'
                });
                results.overall = false;
            }

            setResult({
                ...results,
                message: '完全認証フローテスト結果',
                success: results.overall
            });

        } catch (error) {
            console.error('完全フローテストエラー:', error);
            setResult({
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold japanese-text">認証デバッグツール</h1>

                <Card>
                    <CardHeader>
                        <CardTitle className="japanese-text">ログイン情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="メールアドレス"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={testDirectCall}
                                disabled={loading || !email || !password}
                                className="japanese-text"
                            >
                                {loading && testType === '認証システム' ? 'テスト中...' : '認証システムテスト'}
                            </Button>

                            <Button
                                onClick={testDatabaseConnection}
                                disabled={loading}
                                variant="outline"
                                className="japanese-text"
                            >
                                {loading && testType === '認証データベース' ? 'テスト中...' : '認証DBテスト'}
                            </Button>

                            <Button
                                onClick={testBusinessDatabase}
                                disabled={loading}
                                variant="secondary"
                                className="japanese-text"
                            >
                                {loading && testType === '業務データベース' ? 'テスト中...' : '業務DBテスト'}
                            </Button>

                            <Button
                                onClick={testFullFlow}
                                disabled={loading || !email || !password}
                                variant="default"
                                className="japanese-text bg-blue-600 hover:bg-blue-700"
                            >
                                {loading && testType === '完全フロー' ? 'テスト中...' : '完全フローテスト'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="japanese-text flex items-center gap-2">
                                テスト結果: {testType}
                                <Badge variant={result.success ? "default" : "destructive"}>
                                    {result.success ? '✅ 成功' : '❌ 失敗'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-sm bg-muted p-4 rounded overflow-auto max-h-96">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="japanese-text">システム構成チェック</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold japanese-text">認証システム (fuetincqvlvcptnzpood)</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Edge Function 'auth-login' デプロイ済み</li>
                                    <li>profiles テーブル存在</li>
                                    <li>password_hash フィールド設定済み</li>
                                    <li>jwt_keys テーブル設定済み</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold japanese-text">業務データベース (aasiwxtosnmvjupikjvs)</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>projects テーブル存在</li>
                                    <li>engineers テーブル存在</li>
                                    <li>API Key方式でアクセス</li>
                                    <li>RLS設定（必要に応じて）</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded">
                            <h4 className="font-semibold text-blue-800 japanese-text">現在のアーキテクチャ（简化版）</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                認証システム（API Key） + 業務データベース（API Key） = 最もシンプルな構成
                            </p>
                            <div className="mt-2 text-xs text-blue-600">
                                <div>✅ Refresh Token不要</div>
                                <div>✅ 環境変数で設定管理</div>
                                <div>✅ Postman方式の業務DBアクセス</div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 rounded">
                            <h4 className="font-semibold text-yellow-800 japanese-text">環境変数チェック</h4>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>VITE_AUTH_SUPABASE_URL:</span>
                                    <Badge variant={authUrl ? "default" : "destructive"}>
                                        {authUrl ? '✅ 設定済み' : '❌ 未設定'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>VITE_AUTH_SUPABASE_ANON_KEY:</span>
                                    <Badge variant={authKey ? "default" : "destructive"}>
                                        {authKey ? '✅ 設定済み' : '❌ 未設定'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>VITE_BUSINESS_SUPABASE_URL:</span>
                                    <Badge variant={businessUrl ? "default" : "destructive"}>
                                        {businessUrl ? '✅ 設定済み' : '❌ 未設定'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>VITE_BUSINESS_SUPABASE_ANON_KEY:</span>
                                    <Badge variant={businessKey ? "default" : "destructive"}>
                                        {businessKey ? '✅ 設定済み' : '❌ 未設定'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}