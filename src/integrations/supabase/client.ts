// 改進されたSupabase認証システム統合 - 環境変数対応版
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 環境変数から設定を取得
const getEnvVar = (key: string, fallback?: string): string => {
  if (typeof window !== 'undefined') {
    // ブラウザ環境では import.meta.env を使用（Vite）
    return (import.meta.env[key] || fallback || '');
  }
  return process.env[key] || fallback || '';
};

// 認証システム用Supabase設定 (identity-hub-control) - 環境変数必須
const AUTH_SUPABASE_URL = getEnvVar('VITE_AUTH_SUPABASE_URL');
const AUTH_SUPABASE_ANON_KEY = getEnvVar('VITE_AUTH_SUPABASE_ANON_KEY');

// 業務データベース用Supabase設定 (新しいデータベース) - 環境変数必須
const BUSINESS_SUPABASE_URL = getEnvVar('VITE_BUSINESS_SUPABASE_URL');
const BUSINESS_SUPABASE_ANON_KEY = getEnvVar('VITE_BUSINESS_SUPABASE_ANON_KEY');

// 必須設定のチェック
if (!AUTH_SUPABASE_URL || !AUTH_SUPABASE_ANON_KEY) {
  console.error('認証システム用Supabase設定が不完全です。VITE_AUTH_SUPABASE_URL と VITE_AUTH_SUPABASE_ANON_KEY を環境変数に設定してください。');
}

if (!BUSINESS_SUPABASE_URL || !BUSINESS_SUPABASE_ANON_KEY) {
  console.error('業務データベース用Supabase設定が不完全です。VITE_BUSINESS_SUPABASE_URL と VITE_BUSINESS_SUPABASE_ANON_KEY を環境変数に設定してください。');
}

// 開発環境での設定チェック
if (import.meta.env.DEV) {
  console.log('Supabase設定確認:');
  console.log('認証DB URL:', AUTH_SUPABASE_URL);
  console.log('認証DB キー:', AUTH_SUPABASE_ANON_KEY ? 'セット済み' : '未設定');
  console.log('業務DB URL:', BUSINESS_SUPABASE_URL);
  console.log('業務DB キー:', BUSINESS_SUPABASE_ANON_KEY ? 'セット済み' : '未設定');
}

// 認証専用クライアント（identity-hub-control用）
export const authClient = AUTH_SUPABASE_URL && AUTH_SUPABASE_ANON_KEY ? createClient(
  AUTH_SUPABASE_URL,
  AUTH_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-tenant-id': typeof window !== 'undefined' ? localStorage.getItem('currentTenantId') || '' : ''
      }
    }
  }
) : null;

// 業務データ専用クライアント - JWT認証対応
class BusinessSupabaseClient {
  private client: ReturnType<typeof createClient<Database>>;
  private currentToken: string | null = null;

  constructor() {
    this.client = createClient<Database>(
      BUSINESS_SUPABASE_URL,
      BUSINESS_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {},
        }
      }
    );
  }

  // JWT トークンを設定
  setAuth(token: string | null) {
    this.currentToken = token;
    // Supabaseの組み込みメソッドを使用してトークンを設定
    if (token) {
      // 新しいクライアントインスタンスを作成してトークンを設定
      this.client = createClient<Database>(
        BUSINESS_SUPABASE_URL,
        BUSINESS_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
          global: {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        }
      );
    } else {
      // トークンなしのクライアントに戻す
      this.client = createClient<Database>(
        BUSINESS_SUPABASE_URL,
        BUSINESS_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          }
        }
      );
    }
  }

  // トークンの有効性を確認
  public hasValidToken(): boolean {
    return !!this.currentToken;
  }

  // テーブルアクセス
  from<TableName extends keyof Database['public']['Tables']>(
    table: TableName
  ) {
    if (!this.currentToken) {
      throw new Error('認証トークンが設定されていません。ログインしてください。');
    }
    return this.client.from(table);
  }

  // RPC コール
  rpc(
    fn: string,
    args?: any
  ) {
    if (!this.currentToken) {
      throw new Error('認証トークンが設定されていません。ログインしてください。');
    }
    return (this.client as any).rpc(fn, args);
  }

  // ストレージアクセス
  get storage() {
    if (!this.currentToken) {
      throw new Error('認証トークンが設定されていません。ログインしてください。');
    }
    return this.client.storage;
  }

  // Functions アクセス
  get functions() {
    if (!this.currentToken) {
      throw new Error('認証トークンが設定されていません。ログインしてください。');
    }
    return this.client.functions;
  }

  // 認証状態のチェック
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  // クライアントインスタンスの取得（内部使用）
  getClient() {
    return this.client;
  }
}

// 業務クライアントのシングルトンインスタンス（businessClientとしてエクスポート）
export const businessClient = BUSINESS_SUPABASE_URL && BUSINESS_SUPABASE_ANON_KEY ? new BusinessSupabaseClient() : null;

// 便利関数 - setBusinessClientAuth を追加
export const setBusinessClientAuth = (token: string | null) => {
  if (businessClient) {
    businessClient.setAuth(token);
  }
};

export const isBusinessClientAuthenticated = (): boolean => {
  return businessClient ? businessClient.isAuthenticated() : false;
};

// 認証用APIエンドポイント
export const AUTH_API_URL = getEnvVar('VITE_API_BASE_URL', 'https://fuetincqvlvcptnzpood.supabase.co/functions/v1');

// エクスポート - 既存のコードとの互換性のため
export const supabase = authClient; // 互換性のため

// ユーティリティ関数
export const getCurrentUser = async () => {
  if (!authClient) return null;
  const { data: { user } } = await authClient.auth.getUser();
  return user;
};

export const signOut = async () => {
  if (!authClient) return;
  await authClient.auth.signOut();
  localStorage.removeItem('currentTenantId');
};

// テナントIDを設定する関数
export const setCurrentTenant = (tenantId: string) => {
  localStorage.setItem('currentTenantId', tenantId);

  // 新しいクライアントを作成して更新（ヘッダーは作成時のみ設定可能）
  if (AUTH_SUPABASE_URL && AUTH_SUPABASE_ANON_KEY) {
    (window as any).authClient = createClient(
      AUTH_SUPABASE_URL,
      AUTH_SUPABASE_ANON_KEY,
      {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        global: {
          headers: {
            'x-tenant-id': tenantId
          }
        }
      }
    );
  }

  if (BUSINESS_SUPABASE_URL && BUSINESS_SUPABASE_ANON_KEY && businessClient) {
    // ビジネスクライアントも新しいテナントIDで再作成が必要な場合
    // 現在のトークンを保持
    const currentToken = businessClient.hasValidToken() ? 'current_token' : null;
    if (currentToken) {
      businessClient.setAuth(currentToken);
    }
  }
};

// 認証状態の取得
export const getAuthStatus = () => {
  return {
    hasAuthToken: businessClient ? businessClient.hasValidToken() : false,
    isAuthenticated: businessClient ? businessClient.isAuthenticated() : false,
    authClientReady: !!AUTH_SUPABASE_URL && !!AUTH_SUPABASE_ANON_KEY,
    businessClientReady: !!BUSINESS_SUPABASE_URL && !!BUSINESS_SUPABASE_ANON_KEY
  };
};