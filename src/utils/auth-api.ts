// 認証システムAPI統合用ヘルパー関数
import { authClient } from '@/integrations/supabase/client';

// 環境変数から取得するように変更（ハードコードを避ける）
const getEnvVar = (key: string, fallback?: string): string => {
    if (typeof window !== 'undefined') {
        return (import.meta.env[key] || fallback || '');
    }
    return process.env[key] || fallback || '';
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

        // 成功レスポンスの構造を調整
        return {
            success: true,
            message: 'ログイン成功',
            data: {
                access_token: data.access_token,
                refresh_token: data.refresh_token || '', // リフレッシュトークンがない場合は空文字
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

// トークン検証 API呼び出し
export const verifyToken = async (token: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${AUTH_API_BASE}/auth-verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': AUTH_ANON_KEY,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'トークン検証に失敗しました');
        }

        return data;
    } catch (error) {
        console.error('トークン検証エラー:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'トークン検証に失敗しました'
        };
    }
};

// トークンリフレッシュ API呼び出し
export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
        const response = await fetch(`${AUTH_API_BASE}/auth-refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_ANON_KEY}`,
                'apikey': AUTH_ANON_KEY,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'トークンリフレッシュに失敗しました');
        }

        return data;
    } catch (error) {
        console.error('トークンリフレッシュエラー:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'トークンリフレッシュに失敗しました'
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

// トークンをローカルストレージに保存
export const saveTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('auth_access_token', accessToken);
    localStorage.setItem('auth_refresh_token', refreshToken);
};

// トークンをローカルストレージから取得
export const getStoredTokens = () => {
    return {
        accessToken: localStorage.getItem('auth_access_token'),
        refreshToken: localStorage.getItem('auth_refresh_token')
    };
};

// トークンをローカルストレージからクリア
export const clearStoredTokens = () => {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
};