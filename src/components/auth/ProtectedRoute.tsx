
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLoader } from './AuthLoader';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoader />;
  }

  if (!user) {
    // 重定向到认证页面，但保存当前位置以便认证后重定向回来
    console.log("用户未认证，重定向到/auth，当前路径:", location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 用户已认证，渲染子组件
  return <>{children}</>;
}
