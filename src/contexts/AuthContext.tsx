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
import { debugAuthState } from '@/utils/auth-debug';

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

  // 初期化処理 - 改良版（より確実な認証状態復元）
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('認証システム初期化を開始します...');
        
        // 認証状態のデバッグ
        debugAuthState();
        
        // 数秒待ってからトークンを取得（ブラウザの初期化を待つ）
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { accessToken, refreshToken } = getStoredTokens();

        if (!accessToken) {
          console.log('保存されたトークンがありません');
          setLoading(false);
          return;
        }

        console.log('保存されたトークンが見つかりました、検証中...');

        // API サーバーの状況をチェック - 最近保存されたトークンなら直接使用
        const savedAt = localStorage.getItem('auth_token_saved_at');
        const shouldTrustToken = savedAt && (() => {
          const saveTime = new Date(savedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - saveTime.getTime()) / (1000 * 60 * 60);
          return hoursDiff < 24; // 24時間以内なら信頼
        })();

        if (shouldTrustToken) {
          console.log('最近保存されたトークンのため、API検証をスキップして直接認証します');
          
          // 保存された真実のユーザー情報を取得
          const savedUserDataStr = localStorage.getItem('auth_user_data');
          if (savedUserDataStr) {
            try {
              const savedUserData = JSON.parse(savedUserDataStr);
              console.log('保存されたユーザー情報を使用します:', {
                email: savedUserData.user?.email,
                tenant_id: savedUserData.user?.tenant_id,
                tenant: savedUserData.tenant,
                fullData: savedUserData
              });
              
              await setAuthenticatedUser(savedUserData, accessToken);
              setToken(accessToken);
              console.log('保存されたユーザーデータで認証が完了しました');
              return;
            } catch (parseError) {
              console.error('保存されたユーザー情報の解析に失敗:', parseError);
            }
          }
          
          // フォールバック: ユーザー情報が保存されていない場合はAPI検証を試行
          console.log('保存されたユーザー情報がないため、API検証を試行します');
        }

        try {
          // トークンの検証（新しいトークンまたは古いトークンの場合のみ）
          const verifyResult = await verifyToken(accessToken);
          console.log('トークン検証結果:', verifyResult.success ? '成功' : '失敗');

          if (verifyResult.success && verifyResult.data) {
            console.log('トークンが有効です、ユーザー情報を設定中...');
            await setAuthenticatedUser(verifyResult.data, accessToken);
            setToken(accessToken);
            console.log('認証状態の復元が完了しました - トークン状態も同期済み');
            return;
          }
        } catch (verifyError: any) {
          console.warn('トークン検証でエラーが発生しました:', verifyError);
          // API エラーの場合、リフレッシュを試行する前にスキップ
        }

        // アクセストークンが無効またはエラーの場合、リフレッシュを試行
        if (refreshToken) {
          console.log('リフレッシュトークンでアクセストークンを更新します...');
          
          try {
            const refreshResult = await apiRefreshToken(refreshToken);
            if (refreshResult.success && refreshResult.data) {
              console.log('トークンリフレッシュが成功しました');

              // 新しいアクセストークンで再検証
              try {
                const newVerifyResult = await verifyToken(refreshResult.data.access_token);
                if (newVerifyResult.success && newVerifyResult.data) {
                  console.log('リフレッシュされたトークンの検証に成功しました');
                  await setAuthenticatedUser(newVerifyResult.data, refreshResult.data.access_token);
                  saveTokens(refreshResult.data.access_token, refreshToken);
                  // 明示的にトークン状態を設定
                  setToken(refreshResult.data.access_token);
                  console.log('リフレッシュ後の認証状態の復元が完了しました - トークン状態も同期済み');
                  return;
                }
              } catch (newVerifyError) {
                console.error('新しいトークンの検証でエラー:', newVerifyError);
              }
            }
          } catch (refreshError) {
            console.error('リフレッシュ処理中のエラー:', refreshError);
          }
        }

        // すべての認証試行が失敗した場合のみクリア
        console.log('すべての認証試行が失敗しました、認証状態をクリアします');
        await clearAuthState();

      } catch (error) {
        console.error('認証初期化で予期しないエラー:', error);
        // 予期しないエラーの場合は認証状態をクリア
        await clearAuthState();
      } finally {
        setLoading(false);
        console.log('認証初期化プロセスが完了しました');
      }
    };

    // ブラウザ環境でのみ実行
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // 認証済みユーザーの設定 - 修正版（APIレスポンス構造に合わせて）
  const setAuthenticatedUser = async (authData: any, accessToken: string) => {
    try {
      console.log('認証ユーザーの設定を開始します:', authData);

      // APIレスポンスの構造に合わせて調整
      const userInfo = authData.user || authData;
      const tenantInfo = authData.tenant;
      
      console.log('ユーザー情報の詳細:', {
        userInfo_tenant_id: userInfo.tenant_id,
        tenantInfo_id: tenantInfo?.id,
        tenantInfo_full: tenantInfo,
        authData_keys: Object.keys(authData),
        userInfo_keys: Object.keys(userInfo || {}),
        tenantInfo_keys: Object.keys(tenantInfo || {})
      });

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
      } else if (userInfo.tenant_id) {
        // テナント情報がない場合、デフォルトテナントを作成
        console.warn('テナント情報がレスポンスに含まれていません。デフォルトテナントを作成します');
        tenantData = {
          id: userInfo.tenant_id,
          name: 'デフォルトテナント',
          tenant_type: 'personal',
          is_active: true,
        };
      } else {
        console.error('ユーザー情報にテナントIDがありません');
      }

      // 状態の更新
      setUser(userData);
      setProfile(profileData);
      setCurrentTenant(tenantData);
      setToken(accessToken);
      
      console.log('設定されたユーザー状態:', {
        user_tenant_id: userData.tenant_id,
        profile_tenant_id: profileData.tenant_id,
        currentTenant_id: tenantData?.id,
        userData_full: userData,
        profileData_full: profileData,
        tenantData_full: tenantData
      });

      // 業務クライアントにユーザー情報を設定 - エラーハンドリング強化
      try {
        const businessTokenResult = await setBusinessClientToken(userData);
        if (businessTokenResult) {
          console.log('業務クライアントのユーザー設定が成功しました');
          await initializeBusinessClient(userData);
        } else {
          console.warn('業務クライアントのユーザー設定に失敗しましたが、認証は継続します');
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
    // 保存されたユーザー情報もクリア
    localStorage.removeItem('auth_user_data');
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
      console.log('ログインAPI結果:', {
        success: result.success,
        hasData: !!result.data,
        hasAccessToken: result.data?.access_token ? 'あり' : 'なし',
        hasRefreshToken: result.data?.refresh_token ? 'あり' : 'なし',
        message: result.message
      });

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
      console.log('トークンを保存中...', {
        accessToken: result.data.access_token ? result.data.access_token.substring(0, 20) + '...' : 'なし',
        refreshToken: result.data.refresh_token ? result.data.refresh_token.substring(0, 20) + '...' : 'なし'
      });
      saveTokens(result.data.access_token, result.data.refresh_token);
      
      // 保存されたトークンを確認
      const savedTokens = getStoredTokens();
      console.log('保存されたトークンの確認:', {
        hasAccessToken: !!savedTokens.accessToken,
        hasRefreshToken: !!savedTokens.refreshToken
      });

      // 真実のユーザー情報をlocalStorageに保存
      localStorage.setItem('auth_user_data', JSON.stringify(result.data));
      console.log('ユーザー情報をlocalStorageに保存しました');

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

  // トークンリフレッシュ - 修正版
  const refreshTokenFunction = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) {
        console.warn('リフレッシュトークンがありません');
        return { success: false, error: 'リフレッシュトークンがありません' };
      }

      console.log('トークンリフレッシュを開始します');
      const result = await apiRefreshToken(refreshToken);
      
      if (result.success && result.data) {
        console.log('新しいアクセストークンを取得しました');
        saveTokens(result.data.access_token, refreshToken);
        
        // トークン検証を行い、ユーザー情報を取得
        console.log('新しいトークンを検証します');
        const verifyResult = await verifyToken(result.data.access_token);
        
        if (verifyResult.success && verifyResult.data) {
          console.log('トークン検証成功、ユーザー情報を更新します');
          // 業務クライアントにユーザー情報を設定
          const userInfo = verifyResult.data.user || verifyResult.data;
          await setBusinessClientToken(userInfo);
          await initializeBusinessClient(userInfo);
          setToken(result.data.access_token);
          return { success: true };
        } else {
          console.error('新しいトークンの検証に失敗しました:', verifyResult.message);
          return { success: false, error: '新しいトークンの検証に失敗しました' };
        }
      }

      console.error('トークンリフレッシュに失敗しました:', result.message);
      return { success: false, error: result.message || 'トークンリフレッシュに失敗しました' };
    } catch (error: any) {
      console.error('トークンリフレッシュ中にエラーが発生しました:', error);
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