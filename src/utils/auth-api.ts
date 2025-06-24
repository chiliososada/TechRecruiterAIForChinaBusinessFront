// 認証システムAPI統合用ヘルパー関数
import { authClient } from '@/integrations/supabase/client';

// 環境変数から取得するように変更（ハードコードを避ける）
const getEnvVar = (key: string, fallback?: string): string => {
    return import.meta.env[key as keyof ImportMetaEnv] || fallback || '';
};

// 認証APIのベースURL (identity-hub-control Edge Functions)
const AUTH_API_BASE = getEnvVar('VITE_API_BASE_URL', 'https://fuetincqvlvcptnzpood.supabase.co/functions/v1');
const AUTH_ANON_KEY = getEnvVar('VITE_AUTH_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I');

export interface LoginCredentials {
    email: string;
    password: string;
    tenant_id?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            full_name?: string;
            tenant_id: string;
            role: string;
        };
        tenant: {
            id: string;
            name: string;
            tenant_type: string;
        };
    };
}

export interface RefreshTokenResponse {
    success: boolean;
    data?: {
        access_token: string;
        expires_at: string;
    };
    message?: string;
}

// ログイン API呼び出し
export const authLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        console.log('認証ログイン試行:', credentials.email);

        const response = await fetch(`${AUTH_API_BASE}/auth-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_ANON_KEY}`,
                'apikey': AUTH_ANON_KEY,
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
                tenant_id: credentials.tenant_id,
                device_name: 'Web Browser'
            }),
        });

        console.log('認証API応答:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('JSON解析エラー:', jsonError);
            return {
                success: false,
                message: 'サーバーからの応答が無効です'
            };
        }

        console.log('認証API応答データ:', data);

        if (!response.ok) {
            return {
                success: false,
                message: data.error || `HTTP Error: ${response.status}`
            };
        }

        if (data.error) {
            return {
                success: false,
                message: data.error
            };
        }

        // レスポンスデータの詳細ログ
        console.log('認証API生レスポンス:', {
            hasAccessToken: !!data.access_token,
            hasRefreshToken: !!data.refresh_token,
            accessTokenLength: data.access_token ? data.access_token.length : 0,
            refreshTokenLength: data.refresh_token ? data.refresh_token.length : 0,
            responseKeys: Object.keys(data)
        });

        // 必須トークンのチェック
        if (!data.access_token) {
            console.error('アクセストークンがレスポンスに含まれていません');
            return {
                success: false,
                message: 'アクセストークンを取得できませんでした'
            };
        }

        // 成功レスポンスの構造を調整
        return {
            success: true,
            message: 'ログイン成功',
            data: {
                access_token: data.access_token,
                refresh_token: data.refresh_token || data.access_token, // リフレッシュトークンがない場合はアクセストークンを使用
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    full_name: data.user.full_name,
                    tenant_id: data.user.tenant_id || '',
                    role: data.user.role || 'member'
                },
                tenant: data.tenant || {
                    id: data.user.tenant_id || '',
                    name: 'Default Tenant',
                    tenant_type: 'individual'
                }
            }
        };
    } catch (error) {
        console.error('認証ログインエラー:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '認証サーバーとの通信に失敗しました'
        };
    }
};

// トークン検証 API呼び出し - 改善版
export const verifyToken = async (token: string): Promise<AuthResponse> => {
    try {
        console.log('トークン検証を開始します...');
        
        const response = await fetch(`${AUTH_API_BASE}/auth-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': AUTH_ANON_KEY,
            },
        });

        console.log('トークン検証API応答:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('トークン検証レスポンスのJSON解析エラー:', jsonError);
            return {
                success: false,
                message: 'サーバーからの応答が無効です'
            };
        }

        if (!response.ok) {
            console.warn('トークン検証が失敗しました:', data.message || response.statusText);
            return {
                success: false,
                message: data.message || `HTTP Error: ${response.status}`
            };
        }

        console.log('トークン検証が成功しました');
        return {
            success: true,
            message: 'トークン検証成功',
            data: data.data || data  // レスポンス構造に対応
        };

    } catch (error) {
        console.error('トークン検証でネットワークエラー:', error);
        
        // より詳細なエラー情報を提供
        let errorMessage = 'ネットワークエラーが発生しました';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        // 503エラーの場合は特別に処理
        if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
            errorMessage = '503 Service Unavailable - API サーバーが一時的に利用できません';
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
};

// トークンリフレッシュ API呼び出し - 改善版
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
        console.log('トークンリフレッシュを開始します...');
        
        const response = await fetch(`${AUTH_API_BASE}/auth-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_ANON_KEY}`,
                'apikey': AUTH_ANON_KEY,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        console.log('トークンリフレッシュAPI応答:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('リフレッシュレスポンスのJSON解析エラー:', jsonError);
            return {
                success: false,
                message: 'サーバーからの応答が無効です'
            };
        }

        if (!response.ok) {
            console.warn('トークンリフレッシュが失敗しました:', data.message || response.statusText);
            return {
                success: false,
                message: data.message || `HTTP Error: ${response.status}`
            };
        }

        console.log('トークンリフレッシュが成功しました');
        return {
            success: true,
            data: data.data || data,  // レスポンス構造に対応
            message: 'リフレッシュ成功'
        };

    } catch (error) {
        console.error('トークンリフレッシュでネットワークエラー:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'ネットワークエラーが発生しました'
        };
    }
};

// ログアウト API呼び出し
export const authLogout = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${AUTH_API_BASE}/auth-logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': AUTH_ANON_KEY,
            },
        });

        const data = await response.json();

        return {
            success: response.ok,
            message: data.message || (response.ok ? 'ログアウトしました' : 'ログアウトに失敗しました')
        };
    } catch (error) {
        console.error('ログアウトエラー:', error);
        return {
            success: false,
            message: 'ログアウト処理に失敗しました'
        };
    }
};

// 安全なストレージアクセス用のヘルパー関数
const isStorageAvailable = (): boolean => {
    try {
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    } catch {
        return false;
    }
};

// トークンをローカルストレージに保存
export const saveTokens = (accessToken: string, refreshToken: string) => {
    console.log('saveTokens関数が呼び出されました:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken ? accessToken.length : 0,
        refreshTokenLength: refreshToken ? refreshToken.length : 0
    });

    if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
    }
    
    if (!accessToken) {
        console.error('アクセストークンが無効です:', {
            accessToken: accessToken ? 'あり' : 'なし',
            refreshToken: refreshToken ? 'あり' : 'なし'
        });
        return;
    }
    
    // リフレッシュトークンがない場合はアクセストークンを使用
    const actualRefreshToken = refreshToken || accessToken;
    console.log('トークン調整:', {
        usesSameToken: !refreshToken,
        refreshTokenSource: refreshToken ? 'provided' : 'copied from access'
    });
    
    try {
        console.log('localStorage保存を実行中...');
        localStorage.setItem('auth_access_token', accessToken);
        localStorage.setItem('auth_refresh_token', actualRefreshToken);
        // 保存時刻も記録（デバッグ用）
        localStorage.setItem('auth_token_saved_at', new Date().toISOString());
        
        // 保存後の確認
        const verifyAccess = localStorage.getItem('auth_access_token');
        const verifyRefresh = localStorage.getItem('auth_refresh_token');
        console.log('保存後の確認:', {
            accessTokenSaved: verifyAccess === accessToken,
            refreshTokenSaved: verifyRefresh === actualRefreshToken,
            actualAccessLength: verifyAccess ? verifyAccess.length : 0,
            actualRefreshLength: verifyRefresh ? verifyRefresh.length : 0,
            usedSameToken: actualRefreshToken === accessToken
        });
        
        console.log('トークンが正常に保存されました');
    } catch (error) {
        console.error('トークン保存エラー:', error);
    }
};

// トークンをローカルストレージから取得
export const getStoredTokens = () => {
    if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return {
            accessToken: null,
            refreshToken: null
        };
    }
    
    try {
        const accessToken = localStorage.getItem('auth_access_token');
        const refreshToken = localStorage.getItem('auth_refresh_token');
        const savedAt = localStorage.getItem('auth_token_saved_at');
        
        console.log('localStorage状態チェック:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            accessTokenLength: accessToken ? accessToken.length : 0,
            refreshTokenLength: refreshToken ? refreshToken.length : 0,
            savedAt: savedAt,
            storageKeys: Object.keys(localStorage).filter(key => key.startsWith('auth_'))
        });
        
        if (accessToken && refreshToken) {
            console.log('有効なトークンペアを取得しました');
        } else {
            console.log('トークンが見つかりません または 不完全です');
        }
        
        return {
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.error('トークン取得エラー:', error);
        return {
            accessToken: null,
            refreshToken: null
        };
    }
};

// トークンをローカルストレージからクリア
export const clearStoredTokens = () => {
    if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return;
    }
    
    try {
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_token_saved_at');
        console.log('保存されたトークンをクリアしました');
    } catch (error) {
        console.error('トークンクリアエラー:', error);
    }
};