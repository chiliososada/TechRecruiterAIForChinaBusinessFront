import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  authLogin,
  verifyToken,
  refreshToken as apiRefreshToken,
  authLogout,
  getStoredTokens,
  saveTokens,
  clearStoredTokens,
  type AuthResponse
} from '@/utils/auth-api';
import {
  setBusinessClientToken,
  clearBusinessClientAuth,
  initializeBusinessClient,
  businessClientManager
} from '@/integrations/supabase/business-client';

// ユーザー情報の型定義
interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar_url?: string;
  tenant_id: string;
  is_active: boolean;
  // 追加のフィールド
  job_title?: string;
  company?: string;
  is_test_account?: boolean;
  permissions?: any;
  last_login_at?: string;
}

// テナント情報の型定義
interface Tenant {
  id: string;
  name: string;
  tenant_type: 'personal' | 'enterprise';
  domain?: string;
  is_active: boolean;
  subscription_plan?: string;
  max_users?: number;
  company_name?: string;
  company_email?: string;
  contact_email?: string;
  contact_phone?: string;
}

// ユーザープロファイル型定義（後方互換性のため）
interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  job_title?: string;
  company?: string;
  role: string;
  tenant_id: string;
  is_test_account?: boolean;
  expires_at?: string;
  email?: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  // ユーザー関連
  user: User | null;
  profile: UserProfile | null;
  session: any; // 後方互換性のため

  // テナント関連
  currentTenant: Tenant | null;
  tenants: Tenant[];

  // 状態
  loading: boolean;
  token: string | null;

  // 認証アクション
  signIn: (email: string, password: string, tenantId?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;

  // テナント管理
  switchTenant: (tenantId: string) => Promise<void>;
  createTenant: (name: string, type: 'personal' | 'enterprise', domain?: string) => Promise<{ error: Error | null }>;
  inviteUser: (email: string, role: string, tenantId: string) => Promise<{ error: Error | null }>;

  // トークン管理
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  verifyCurrentToken: () => Promise<{ valid: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth は AuthProvider 内で使用する必要があります');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期化処理
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('認証システムを初期化中...');

        const { accessToken, refreshToken } = getStoredTokens();

        if (accessToken) {
          console.log('保存されたトークンが見つかりました');

          // トークンの有効性を確認
          const verifyResult = await verifyToken(accessToken);

          if (verifyResult.success && verifyResult.data) {
            console.log('保存されたトークンが有効です');
            await setAuthenticatedUser(verifyResult.data, accessToken);
          } else if (refreshToken) {
            console.log('アクセストークンが無効、リフレッシュを試行中...');

            // リフレッシュトークンで新しいアクセストークンを取得
            const refreshResult = await apiRefreshToken(refreshToken);

            if (refreshResult.success && refreshResult.data) {
              console.log('トークンリフレッシュ成功');
              const newAccessToken = refreshResult.data.access_token;

              // 新しいトークンを保存
              saveTokens(newAccessToken, refreshToken);

              // 新しいトークンで認証情報を確認
              const newVerifyResult = await verifyToken(newAccessToken);
              if (newVerifyResult.success && newVerifyResult.data) {
                await setAuthenticatedUser(newVerifyResult.data, newAccessToken);
              }
            } else {
              console.log('トークンリフレッシュ失敗、ログアウト');
              await clearAuthState();
            }
          } else {
            console.log('有効なトークンなし、ログアウト状態');
            await clearAuthState();
          }
        } else {
          console.log('保存されたトークンなし');
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
        await clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 認証されたユーザー情報を設定
  const setAuthenticatedUser = async (authData: any, accessToken: string) => {
    try {
      // ユーザー情報の設定
      const userData: User = {
        id: authData.user.id,
        email: authData.user.email,
        full_name: authData.user.full_name,
        first_name: authData.user.first_name,
        last_name: authData.user.last_name,
        role: authData.user.role,
        avatar_url: authData.user.avatar_url,
        tenant_id: authData.user.tenant_id,
        is_active: true,
        // 追加フィールド
        job_title: authData.user.job_title,
        company: authData.user.company,
        is_test_account: authData.user.is_test_account,
        permissions: authData.user.permissions,
        last_login_at: authData.user.last_login_at,
      };

      // プロファイル情報の設定（後方互換性）
      const profileData: UserProfile = {
        id: authData.user.id,
        email: authData.user.email,
        first_name: authData.user.first_name,
        last_name: authData.user.last_name,
        full_name: authData.user.full_name,
        avatar_url: authData.user.avatar_url,
        job_title: authData.user.job_title,
        company: authData.user.company,
        role: authData.user.role,
        tenant_id: authData.user.tenant_id,
        is_test_account: authData.user.is_test_account || false,
        expires_at: authData.user.expires_at,
      };

      // テナント情報の設定
      let tenantData: Tenant | null = null;
      if (authData.tenant) {
        tenantData = {
          id: authData.tenant.id,
          name: authData.tenant.name,
          tenant_type: authData.tenant.tenant_type,
          domain: authData.tenant.domain,
          is_active: authData.tenant.is_active !== false,
          subscription_plan: authData.tenant.subscription_plan,
          max_users: authData.tenant.max_users,
          company_name: authData.tenant.company_name,
          company_email: authData.tenant.company_email,
          contact_email: authData.tenant.contact_email,
          contact_phone: authData.tenant.contact_phone,
        };
      }

      // 状態の更新
      setUser(userData);
      setProfile(profileData);
      setCurrentTenant(tenantData);
      setToken(accessToken);

      // 業務クライアントにトークンを設定
      await setBusinessClientToken(accessToken);
      await initializeBusinessClient();

      console.log('ユーザー認証状態を設定完了:', userData.email);
    } catch (error) {
      console.error('認証ユーザー設定エラー:', error);
      throw error;
    }
  };

  // 認証状態のクリア
  const clearAuthState = async () => {
    setUser(null);
    setProfile(null);
    setCurrentTenant(null);
    setTenants([]);
    setToken(null);
    clearStoredTokens();
    clearBusinessClientAuth();
  };

  // ログイン機能
  const signIn = async (email: string, password: string, tenantId?: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      console.log('ログイン試行:', email);

      const result = await authLogin({ email, password, tenant_id: tenantId });

      if (result.success && result.data) {
        console.log('ログイン成功');

        // トークンの保存
        saveTokens(result.data.access_token, result.data.refresh_token);

        // 認証状態の設定
        await setAuthenticatedUser(result.data, result.data.access_token);

        toast({
          title: "ログイン成功",
          description: `お帰りなさい、${result.data.user.full_name || result.data.user.email}さん！`,
        });

        return { error: null };
      } else {
        console.error('ログイン失敗:', result.message);
        toast({
          title: "ログイン失敗",
          description: result.message,
          variant: "destructive",
        });
        return { error: new Error(result.message) };
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      toast({
        title: "ログインエラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // サインアップ機能（将来の拡張のため）
  const signUp = async (email: string, password: string, userData?: any): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      console.log('サインアップ機能は現在実装されていません');

      toast({
        title: "未実装",
        description: "サインアップ機能は現在利用できません",
        variant: "destructive",
      });

      return { error: new Error('サインアップ機能は現在実装されていません') };
    } catch (error) {
      console.error('サインアップエラー:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // ログアウト機能
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('ログアウト処理中...');

      // サーバーサイドでのログアウト処理
      const { refreshToken } = getStoredTokens();
      if (refreshToken) {
        try {
          await authLogout(refreshToken);
        } catch (error) {
          console.error('サーバーサイドログアウトエラー:', error);
          // エラーがあってもクライアントサイドのクリアは実行
        }
      }

      // クライアントサイドの状態クリア
      await clearAuthState();

      toast({
        title: "ログアウト完了",
        description: "またのご利用をお待ちしております",
      });

      console.log('ログアウト完了');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーがあってもクライアントサイドのクリアは実行
      await clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  // Google ログイン（将来の拡張のため）
  const signInWithGoogle = async () => {
    console.log('Google ログイン機能は現在実装されていません');
    toast({
      title: "未実装",
      description: "Google ログイン機能は現在利用できません",
      variant: "destructive",
    });
  };

  // テナント切り替え（将来の拡張のため）
  const switchTenant = async (tenantId: string) => {
    console.log('テナント切り替え機能は現在実装されていません');
    toast({
      title: "未実装",
      description: "テナント切り替え機能は現在利用できません",
      variant: "destructive",
    });
  };

  // テナント作成（将来の拡張のため）
  const createTenant = async (name: string, type: 'personal' | 'enterprise', domain?: string): Promise<{ error: Error | null }> => {
    console.log('テナント作成機能は現在実装されていません');
    return { error: new Error('テナント作成機能は現在実装されていません') };
  };

  // ユーザー招待（将来の拡張のため）
  const inviteUser = async (email: string, role: string, tenantId: string): Promise<{ error: Error | null }> => {
    console.log('ユーザー招待機能は現在実装されていません');
    return { error: new Error('ユーザー招待機能は現在実装されていません') };
  };

  // トークンリフレッシュ
  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { refreshToken: storedRefreshToken } = getStoredTokens();

      if (!storedRefreshToken) {
        return { success: false, error: 'リフレッシュトークンがありません' };
      }

      const result = await apiRefreshToken(storedRefreshToken);

      if (result.success && result.data) {
        // 新しいトークンを保存
        saveTokens(result.data.access_token, storedRefreshToken);
        setToken(result.data.access_token);

        // 業務クライアントのトークンも更新
        await setBusinessClientToken(result.data.access_token, storedRefreshToken);

        return { success: true };
      } else {
        return { success: false, error: result.message || 'トークンリフレッシュに失敗しました' };
      }
    } catch (error) {
      console.error('トークンリフレッシュエラー:', error);
      return { success: false, error: 'トークンリフレッシュ中にエラーが発生しました' };
    }
  };

  // 現在のトークンの検証
  const verifyCurrentToken = async (): Promise<{ valid: boolean; error?: string }> => {
    try {
      if (!token) {
        return { valid: false, error: 'トークンがありません' };
      }

      const result = await verifyToken(token);

      if (result.success) {
        return { valid: true };
      } else {
        return { valid: false, error: result.message || 'トークンが無効です' };
      }
    } catch (error) {
      console.error('トークン検証エラー:', error);
      return { valid: false, error: 'トークン検証中にエラーが発生しました' };
    }
  };

  // session は後方互換性のため user と同じ値を返す
  const session = user ? { user } : null;

  const value: AuthContextType = {
    user,
    profile,
    session,
    currentTenant,
    tenants,
    loading,
    token,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    switchTenant,
    createTenant,
    inviteUser,
    refreshToken,
    verifyCurrentToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};