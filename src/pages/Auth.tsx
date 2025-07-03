import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
// import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLoader } from '@/components/auth/AuthLoader';
import { AuthHeader } from '@/components/auth/AuthHeader';

export function Auth() {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();

  // リダイレクト先を決定
  const from = location.state?.from?.pathname || "/";

  // URLパラメータとハッシュをチェック（OAuth等のため）
  useEffect(() => {
    console.log('認証ページロード、OAuth リダイレクト状況をチェック中');

    // ハッシュパラメータをチェック（OAuth リダイレクト）
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (accessToken) {
      console.log('URLでアクセストークンを発見:', accessToken.substring(0, 20) + '...');
      // OAuth成功時の処理（将来の拡張用）
    }

    if (error || errorDescription) {
      console.error('OAuth エラー:', error, errorDescription);
      // OAuth エラー時の処理（将来の拡張用）
    }

    // URLクエリパラメータをチェック
    const url = new URL(window.location.href);
    const queryError = url.searchParams.get('error');
    const queryErrorDescription = url.searchParams.get('error_description');

    if (queryError || queryErrorDescription) {
      console.error('クエリパラメータエラー:', queryError, queryErrorDescription);
    }
  }, []);

  // ローディング中の表示
  if (loading) {
    return <AuthLoader />;
  }

  // ユーザーが既にログインしている場合はリダイレクト
  if (user && !loading) {
    console.log("ユーザーは認証済み、リダイレクト先:", from);
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="w-full">
          <AuthHeader />

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login" className="japanese-text">
                ログイン
              </TabsTrigger>
              {/* <TabsTrigger value="register" className="japanese-text">
                アカウント登録
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="login">
              <LoginForm onGoogleLogin={signInWithGoogle} />
            </TabsContent>

            {/* <TabsContent value="register">
              <RegisterForm onGoogleLogin={signInWithGoogle} />
            </TabsContent> */}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default Auth;