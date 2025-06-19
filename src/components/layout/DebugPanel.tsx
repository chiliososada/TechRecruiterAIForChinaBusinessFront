// デバッグパネルコンポーネント（開発環境のみ表示）
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
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const runConnectionTest = async () => {
        const { accessToken, refreshToken } = getStoredTokens();

        const results = {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            isBusinessAuthenticated: businessClientManager.isAuthenticated(),
            user: user ? { id: user.id, email: user.email } : null,
            tenant: currentTenant ? { id: currentTenant.id, name: currentTenant.name } : null,
            connectionTest: null as any
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
                        開発デバッグパネル
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
                            <div>
                                リフレッシュトークン: {testResults.hasRefreshToken ? '✅' : '❌'}
                            </div>
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
                        </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                        <div>環境: {process.env.NODE_ENV}</div>
                        <div>時刻: {new Date().toLocaleString('ja-JP')}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};