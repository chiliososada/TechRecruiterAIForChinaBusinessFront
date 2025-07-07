// デバッグパネルコンポーネント（開発環境のみ表示）- 簡略版
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { businessClientManager } from '@/integrations/supabase/business-client';
import { getStoredTokens } from '@/utils/auth-api';

export const DebugPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);
    const { user, currentTenant } = useAuth();

    // 開発環境以外では何も表示しない
    // NODE_ENV が production の場合、または Vite の production モードの場合は非表示
    if (import.meta.env.VITE_NODE_ENV === 'production' || import.meta.env.MODE === 'production' || !import.meta.env.DEV) {
        return null;
    }

    const runConnectionTest = async () => {
        const { accessToken } = getStoredTokens(); // refreshToken 削除

        const results = {
            hasAccessToken: !!accessToken,
            // hasRefreshToken 削除
            isBusinessAuthenticated: businessClientManager.isAuthenticated(),
            user: user ? { id: user.id, email: user.email } : null,
            tenant: currentTenant ? { id: currentTenant.id, name: currentTenant.name } : null,
            connectionTest: null as any,
            // 環境変数チェック追加
            envCheck: {
                authUrl: !!import.meta.env.VITE_AUTH_SUPABASE_URL,
                authKey: !!import.meta.env.VITE_AUTH_SUPABASE_ANON_KEY,
                businessUrl: !!import.meta.env.VITE_BUSINESS_SUPABASE_URL,
                businessKey: !!import.meta.env.VITE_BUSINESS_SUPABASE_ANON_KEY
            }
        };

        if (businessClientManager.isAuthenticated()) {
            try {
                results.connectionTest = await businessClientManager.testConnection();
            } catch (error: any) {
                results.connectionTest = { success: false, error: error.message };
            }
        }

        setTestResults(results);
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    size="sm"
                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                >
                    🔧 デバッグ
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96">
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex justify-between items-center">
                        開発デバッグパネル（简化版）
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                        >
                            ✕
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                    <div className="space-y-1">
                        <Button
                            onClick={runConnectionTest}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            接続テスト実行
                        </Button>
                        <Button
                            onClick={() => {
                                if (businessClientManager.isAuthenticated()) {
                                    businessClientManager.clearAuth();
                                    setTestResults(null);
                                    window.location.reload();
                                }
                            }}
                            variant="destructive"
                            size="sm"
                            className="w-full text-xs"
                        >
                            認証クリア
                        </Button>
                    </div>

                    {testResults && (
                        <div className="space-y-1 p-2 bg-white rounded border">
                            <div>
                                アクセストークン: {testResults.hasAccessToken ? '✅' : '❌'}
                            </div>
                            {/* リフレッシュトークン行を削除 */}
                            <div>
                                業務DB認証: {testResults.isBusinessAuthenticated ? '✅' : '❌'}
                            </div>
                            <div>
                                ユーザー: {testResults.user ? `${testResults.user.email}` : '未ログイン'}
                            </div>
                            <div>
                                テナント: {testResults.tenant ? testResults.tenant.name : '無し'}
                            </div>
                            {testResults.connectionTest && (
                                <div>
                                    DB接続: {testResults.connectionTest.success ? '✅' : '❌'}
                                    {!testResults.connectionTest.success && (
                                        <div className="text-red-600 text-xs mt-1">
                                            {testResults.connectionTest.error}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 新增：環境変数チェック */}
                            <div className="mt-2 pt-1 border-t border-gray-200">
                                <div className="text-xs font-semibold mb-1">環境変数:</div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div>認証URL: {testResults.envCheck.authUrl ? '✅' : '❌'}</div>
                                    <div>認証Key: {testResults.envCheck.authKey ? '✅' : '❌'}</div>
                                    <div>業務URL: {testResults.envCheck.businessUrl ? '✅' : '❌'}</div>
                                    <div>業務Key: {testResults.envCheck.businessKey ? '✅' : '❌'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                        <div>環境: {import.meta.env.MODE || 'development'}</div>
                        <div>構成: API Key方式（簡化版）</div>
                        <div>時刻: {new Date().toLocaleString('ja-JP')}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};