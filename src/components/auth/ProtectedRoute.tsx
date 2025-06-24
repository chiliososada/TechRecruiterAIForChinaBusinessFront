import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLoader } from './AuthLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // 将来の役割ベースアクセス制御用
  requiredPermission?: string; // 将来の権限ベースアクセス制御用
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission
}: ProtectedRouteProps) {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute チェック:', {
    hasUser: !!user,
    hasToken: !!token,
    loading,
    userRole: user?.role,
    requiredRole,
    currentPath: location.pathname
  });

  // ローディング中は AuthLoader を表示
  if (loading) {
    return <AuthLoader />;
  }

  // ユーザーが認証されていない場合はログインページにリダイレクト
  if (!user || !token) {
    console.log('認証されていないユーザー、ログインページにリダイレクト');
    return (
      <Navigate
        to="/auth"
        state={{ from: location }}
        replace
      />
    );
  }

  // 役割ベースのアクセス制御（将来の拡張用）
  if (requiredRole && user.role !== requiredRole) {
    console.log('必要な役割が不足:', {
      userRole: user.role,
      requiredRole
    });

    // 権限不足の場合のページ（将来実装）
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 japanese-text">
            アクセス権限がありません
          </h1>
          <p className="text-muted-foreground japanese-text">
            このページにアクセスするための権限がありません。
          </p>
          <p className="text-sm text-muted-foreground mt-2 japanese-text">
            必要な役割: {requiredRole}、現在の役割: {user.role}
          </p>
        </div>
      </div>
    );
  }

  // 権限ベースのアクセス制御（将来の拡張用）
  if (requiredPermission) {
    // 将来的にユーザーの権限をチェックするロジックを実装
    console.log('権限チェック（未実装）:', requiredPermission);
  }

  // テナント情報のチェック（オプション）
  if (user.tenant_id && !user.tenant_id.trim()) {
    console.warn('ユーザーにテナント情報がありません:', user);
    // 必要に応じてテナント設定画面にリダイレクト
  }

  // 認証済みでアクセス権限があるユーザーには子コンポーネントを表示
  console.log('認証済みユーザー、コンテンツを表示:', user.email);
  return <>{children}</>;
}

// 開発用のユーティリティコンポーネント
export function DevAuthInfo() {
  const { user, token, loading } = useAuth();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-muted p-2 rounded text-xs max-w-xs">
      <div className="font-semibold mb-1 japanese-text">開発認証情報</div>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.email : 'None'}</div>
        <div>Role: {user?.role || 'None'}</div>
        <div>Tenant: {user?.tenant_id || 'None'}</div>
        <div>Token: {token ? 'Present' : 'None'}</div>
      </div>
    </div>
  );
}