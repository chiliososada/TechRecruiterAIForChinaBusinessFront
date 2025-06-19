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
  initializeBusinessClient
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
}

// テナント情報の型定義
interface Tenant {
  id: string;
  name: string;
  tenant_type: 'individual' | 'enterprise' | 'company';
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
  createTenant: (name: string, type: 'individual' | 'enterprise' | 'company', domain?: string) => Promise<{ error: Error | null }>;
  inviteUser: (email: string, role: string, tenantId: string) => Promise<{ error: Error | null }>;

  // トークン管理
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  verifyCurrentToken: () => Promise<{ valid: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // 初期化：保存されたトークンと認証状態の復元
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('認証システムを初期化中...');

      try {
        const { accessToken, refreshToken } = getStoredTokens();

        if (accessToken) {
          console.log('保存されたトークンを発見、検証中...');

          // トークンの検証
          const verifyResult = await verifyToken(accessToken);

          if (verifyResult.success && verifyResult.data) {
            // 有効なトークンの場合
            console.log('トークンが有効、ユーザー情報を設定中...');
            await setAuthenticatedUser(verifyResult.data, accessToken);
          } else if (refreshToken) {
            // アクセストークンが無効でリフレッシュトークンがある場合
            console.log('アクセストークンが無効、リフレッシュを試行中...');
            const refreshResult = await apiRefreshToken(refreshToken);

            if (refreshResult.success && refreshResult.data) {
              console.log('トークンリフレッシュ成功');
              const newAccessToken = refreshResult.data.access_token;
              saveTokens(newAccessToken, refreshToken);

              // 新しいトークンで再検証
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
    // 現在はidentity-hub-controlでのサインアップ機能は実装されていない
    // 必要に応じて後で実装
    toast({
      title: "機能未実装",
      description: "サインアップ機能は現在開発中です",
      variant: "destructive",
    });
    return { error: new Error('サインアップ機能は未実装です') };
  };

  // Googleログイン（将来の拡張のため）
  const signInWithGoogle = async (): Promise<void> => {
    toast({
      title: "機能未実装",
      description: "Googleログイン機能は現在開発中です",
      variant: "destructive",
    });
  };

  // ログアウト機能
  const signOut = async (): Promise<void> => {
    try {
      console.log('ログアウト処理開始');

      if (token) {
        // サーバー側でトークンを無効化
        await authLogout(token);
      }

      // 認証状態をクリア
      await clearAuthState();

      toast({
        title: "ログアウト",
        description: "正常にログアウトしました",
      });

      console.log('ログアウト完了');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーがあってもローカル状態はクリア
      await clearAuthState();
    }
  };

  // テナント切り替え機能（将来の拡張のため）
  const switchTenant = async (tenantId: string): Promise<void> => {
    // 複数テナント対応は将来の拡張
    console.log('テナント切り替え:', tenantId);
    toast({
      title: "機能準備中",
      description: "テナント切り替え機能は準備中です",
    });
  };

  // テナント作成機能（将来の拡張のため）
  const createTenant = async (name: string, type: 'individual' | 'enterprise' | 'company', domain?: string): Promise<{ error: Error | null }> => {
    console.log('テナント作成:', name, type);
    toast({
      title: "機能準備中",
      description: "テナント作成機能は準備中です",
    });
    return { error: new Error('テナント作成機能は未実装です') };
  };

  // ユーザー招待機能（将来の拡張のため）
  const inviteUser = async (email: string, role: string, tenantId: string): Promise<{ error: Error | null }> => {
    console.log('ユーザー招待:', email, role, tenantId);
    toast({
      title: "機能準備中",
      description: "ユーザー招待機能は準備中です",
    });
    return { error: new Error('ユーザー招待機能は未実装です') };
  };

  // トークンリフレッシュ
  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { refreshToken: storedRefreshToken } = getStoredTokens();

      if (!storedRefreshToken) {
        return { success: false, error: 'リフレッシュトークンが見つかりません' };
      }

      const result = await apiRefreshToken(storedRefreshToken);

      if (result.success && result.data) {
        const newAccessToken = result.data.access_token;
        saveTokens(newAccessToken, storedRefreshToken);
        setToken(newAccessToken);
        await setBusinessClientToken(newAccessToken);

        console.log('トークンリフレッシュ成功');
        return { success: true };
      } else {
        console.error('トークンリフレッシュ失敗:', result.message);
        await clearAuthState();
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('トークンリフレッシュエラー:', error);
      await clearAuthState();
      return { success: false, error: 'トークンリフレッシュに失敗しました' };
    }
  };

  // 現在のトークン検証
  const verifyCurrentToken = async (): Promise<{ valid: boolean; error?: string }> => {
    try {
      if (!token) {
        return { valid: false, error: 'トークンが存在しません' };
      }

      const result = await verifyToken(token);

      if (result.success) {
        return { valid: true };
      } else {
        return { valid: false, error: result.message };
      }
    } catch (error) {
      console.error('トークン検証エラー:', error);
      return { valid: false, error: 'トークン検証に失敗しました' };
    }
  };

  // 定期的なトークンリフレッシュ（7時間ごと）
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      console.log('定期トークンリフレッシュを実行');
      await refreshToken();
    }, 7 * 60 * 60 * 1000); // 7時間

    return () => clearInterval(interval);
  }, [token]);

  // コンテキスト値
  const contextValue: AuthContextType = {
    // ユーザー情報
    user,
    profile,
    session: { user, access_token: token }, // 後方互換性

    // テナント情報  
    currentTenant,
    tenants,

    // 状態
    loading,
    token,

    // 認証アクション
    signIn,
    signUp,
    signOut,
    signInWithGoogle,

    // テナント管理
    switchTenant,
    createTenant,
    inviteUser,

    // トークン管理
    refreshToken,
    verifyCurrentToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth は AuthProvider 内で使用する必要があります');
  }
  return context;
};