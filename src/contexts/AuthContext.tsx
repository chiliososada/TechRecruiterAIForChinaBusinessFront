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
  type AuthResponse,
  type RefreshTokenResponse,
  type LoginCredentials
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

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider コンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // 初期化処理 - 修正版
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken } = getStoredTokens();

        if (accessToken) {
          console.log('保存されたトークンが見つかりました、検証中...');

          // トークンの検証
          const verifyResult = await verifyToken(accessToken);

          if (verifyResult.success && verifyResult.data) {
            console.log('トークンが有効です、ユーザー情報を設定中...');
            await setAuthenticatedUser(verifyResult.data, accessToken);
          } else if (refreshToken) {
            console.log('アクセストークンが無効です、リフレッシュを試行中...');

            const refreshResult = await apiRefreshToken(refreshToken);
            if (refreshResult.success && refreshResult.data) {
              console.log('トークンリフレッシュが成功しました');

              // リフレッシュ後は新しいトークンで再検証
              const newVerifyResult = await verifyToken(refreshResult.data.access_token);
              if (newVerifyResult.success && newVerifyResult.data) {
                await setAuthenticatedUser(newVerifyResult.data, refreshResult.data.access_token);
                saveTokens(refreshResult.data.access_token, refreshToken);
              } else {
                console.log('リフレッシュ後の検証に失敗しました、認証をクリア');
                await clearAuthState();
              }
            } else {
              console.log('トークンリフレッシュに失敗しました、認証をクリア');
              await clearAuthState();
            }
          } else {
            console.log('リフレッシュトークンがありません、認証をクリア');
            await clearAuthState();
          }
        } else {
          console.log('保存されたトークンがありません');
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

  // 認証済みユーザーの設定 - 修正版（APIレスポンス構造に合わせて）
  const setAuthenticatedUser = async (authData: any, accessToken: string) => {
    try {
      console.log('認証ユーザーの設定を開始します:', authData);

      // APIレスポンスの構造に合わせて調整
      const userInfo = authData.user || authData;
      const tenantInfo = authData.tenant;

      // ユーザー情報の設定
      const userData: User = {
        id: userInfo.id,
        email: userInfo.email,
        full_name: userInfo.full_name || userInfo.email,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        role: userInfo.role || 'member',
        avatar_url: userInfo.avatar_url,
        tenant_id: userInfo.tenant_id || tenantInfo?.id || '',
        is_active: userInfo.is_active !== false,
        job_title: userInfo.job_title,
        company: userInfo.company,
        is_test_account: userInfo.is_test_account || false,
        permissions: userInfo.permissions,
        last_login_at: userInfo.last_login_at,
      };

      // プロファイル情報の設定（後方互換性のため）
      const profileData: UserProfile = {
        id: userInfo.id,
        email: userInfo.email,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        full_name: userInfo.full_name || userInfo.email,
        avatar_url: userInfo.avatar_url,
        job_title: userInfo.job_title,
        company: userInfo.company,
        role: userInfo.role || 'member',
        tenant_id: userInfo.tenant_id || tenantInfo?.id || '',
        is_test_account: userInfo.is_test_account || false,
        expires_at: userInfo.expires_at,
      };

      // テナント情報の設定
      let tenantData: Tenant | null = null;
      if (tenantInfo) {
        tenantData = {
          id: tenantInfo.id,
          name: tenantInfo.name,
          tenant_type: tenantInfo.tenant_type === 'enterprise' ? 'enterprise' : 'personal',
          domain: tenantInfo.domain,
          is_active: tenantInfo.is_active !== false,
          subscription_plan: tenantInfo.subscription_plan,
          max_users: tenantInfo.max_users,
          company_name: tenantInfo.company_name,
          company_email: tenantInfo.company_email,
          contact_email: tenantInfo.contact_email,
          contact_phone: tenantInfo.contact_phone,
        };
      }

      // 状態の更新
      setUser(userData);
      setProfile(profileData);
      setCurrentTenant(tenantData);
      setToken(accessToken);

      // 業務クライアントにトークンを設定 - エラーハンドリング強化
      try {
        const businessTokenResult = await setBusinessClientToken(accessToken);
        if (businessTokenResult) {
          console.log('業務クライアントのトークン設定が成功しました');
          await initializeBusinessClient();
        } else {
          console.warn('業務クライアントのトークン設定に失敗しましたが、認証は継続します');
        }
      } catch (businessError) {
        console.error('業務クライアント設定エラー（認証は継続）:', businessError);
        // 業務クライアントの設定に失敗しても認証は継続
      }

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
    console.log('認証状態がクリアされました');
  };

  // ログイン機能 - エラーハンドリング強化
  const signIn = async (email: string, password: string, tenantId?: string): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      console.log('ログイン処理を開始します:', email);

      // LoginCredentials型に合わせて引数を調整
      const credentials: LoginCredentials = {
        email,
        password,
        tenant_id: tenantId
      };

      const result = await authLogin(credentials);

      if (!result.success || !result.data) {
        const error = new Error(result.message || 'ログインに失敗しました');
        console.error('ログインエラー:', error.message);

        toast({
          title: "ログインエラー",
          description: error.message,
          variant: "destructive",
        });

        return { error };
      }

      // トークンの保存
      saveTokens(result.data.access_token, result.data.refresh_token);

      // 認証済みユーザーの設定
      await setAuthenticatedUser(result.data, result.data.access_token);

      console.log('ログインが完了しました');

      toast({
        title: "ログイン成功",
        description: `お帰りなさい、${result.data.user.full_name || result.data.user.email}さん！`,
      });

      return { error: null };
    } catch (error: any) {
      console.error('ログイン処理中のエラー:', error);
      await clearAuthState();

      const errorMessage = error.message || 'ログインに失敗しました';
      toast({
        title: "ログインエラー",
        description: errorMessage,
        variant: "destructive",
      });

      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  // サインアップ機能
  const signUp = async (email: string, password: string, userData?: any): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      // ここにサインアップのロジックを実装
      // 現在は未実装のためエラーを返す
      return { error: new Error('サインアップ機能は未実装です') };
    } catch (error: any) {
      return { error: new Error(error.message || 'サインアップに失敗しました') };
    } finally {
      setLoading(false);
    }
  };

  // ログアウト機能
  const signOut = async () => {
    try {
      setLoading(true);

      // サーバーサイドでのログアウト処理
      const { refreshToken } = getStoredTokens();
      if (refreshToken) {
        try {
          await authLogout(refreshToken);
        } catch (error) {
          console.warn('サーバーサイドログアウトに失敗しましたが、ローカル状態はクリアします:', error);
        }
      }

      // ローカル状態のクリア
      await clearAuthState();

      toast({
        title: "ログアウト完了",
        description: "正常にログアウトしました",
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google認証（未実装）
  const signInWithGoogle = async () => {
    console.log('Google認証は未実装です');
  };

  // テナント切り替え（未実装）
  const switchTenant = async (tenantId: string) => {
    console.log('テナント切り替えは未実装です:', tenantId);
  };

  // テナント作成（未実装）
  const createTenant = async (name: string, type: 'personal' | 'enterprise', domain?: string): Promise<{ error: Error | null }> => {
    return { error: new Error('テナント作成機能は未実装です') };
  };

  // ユーザー招待（未実装）
  const inviteUser = async (email: string, role: string, tenantId: string): Promise<{ error: Error | null }> => {
    return { error: new Error('ユーザー招待機能は未実装です') };
  };

  // トークンリフレッシュ
  const refreshTokenFunction = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) {
        return { success: false, error: 'リフレッシュトークンがありません' };
      }

      const result = await apiRefreshToken(refreshToken);
      if (result.success && result.data) {
        saveTokens(result.data.access_token, refreshToken);
        await setBusinessClientToken(result.data.access_token);
        setToken(result.data.access_token);
        return { success: true };
      }

      return { success: false, error: result.message || 'トークンリフレッシュに失敗しました' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // 現在のトークン検証
  const verifyCurrentToken = async (): Promise<{ valid: boolean; error?: string }> => {
    try {
      const { accessToken } = getStoredTokens();
      if (!accessToken) {
        return { valid: false, error: 'トークンがありません' };
      }

      const result = await verifyToken(accessToken);
      return { valid: result.success, error: result.message };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  };

  // セッション情報（後方互換性のため）
  const session = user ? { user } : null;

  // コンテキスト値
  const contextValue: AuthContextType = {
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
    refreshToken: refreshTokenFunction,
    verifyCurrentToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth は AuthProvider 内で使用する必要があります');
  }
  return context;
};