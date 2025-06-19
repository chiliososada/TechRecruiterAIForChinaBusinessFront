// 新規作成：src/pages/AuthDebug.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDebug() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const testDirectCall = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log('直接API呼び出しテスト');

            const response = await fetch('https://fuetincqvlvcptnzpood.supabase.co/functions/v1/auth-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I',
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
                success: response.ok
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

    const testDatabaseConnection = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log('データベース接続テスト');

            // authClientを使ってprofilesテーブルをテスト
            const response = await fetch('https://fuetincqvlvcptnzpood.supabase.co/rest/v1/profiles?select=email&limit=1', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I`,
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            setResult({
                status: response.status,
                message: 'データベース接続テスト',
                data,
                success: response.ok
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

                        <div className="flex gap-2">
                            <Button
                                onClick={testDirectCall}
                                disabled={loading || !email || !password}
                                className="japanese-text"
                            >
                                {loading ? 'テスト中...' : '直接API呼び出しテスト'}
                            </Button>

                            <Button
                                onClick={testDatabaseConnection}
                                disabled={loading}
                                variant="outline"
                                className="japanese-text"
                            >
                                {loading ? 'テスト中...' : 'データベース接続テスト'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="japanese-text">
                                テスト結果 {result.success ? '✅' : '❌'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="japanese-text">チェックリスト</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="japanese-text">
                            <h4 className="font-semibold">確認事項：</h4>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Edge Function 'auth-login' がデプロイされているか</li>
                                <li>profiles テーブルにユーザーデータが存在するか</li>
                                <li>password_hash フィールドが設定されているか</li>
                                <li>jwt_keys テーブルにアクティブなキーがあるか</li>
                                <li>verify_password 関数が存在するか</li>
                                <li>CORS設定が正しいか</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}