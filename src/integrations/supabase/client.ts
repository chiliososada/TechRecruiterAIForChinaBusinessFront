// 改進されたSupabase認証システム統合 - 環境変数対応版
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 環境変数から設定を取得
const getEnvVar = (key: string, fallback?: string): string => {
  if (typeof window !== 'undefined') {
    // ブラウザ環境では process.env は利用できないことがある
    return (process.env as any)[key] || fallback || '';
  }
  return process.env[key] || fallback || '';
};

// 認証システム用Supabase設定 (identity-hub-control) - 環境変数必須
const AUTH_SUPABASE_URL = getEnvVar('NEXT_PUBLIC_AUTH_SUPABASE_URL');
const AUTH_SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY');

// 業務データベース用Supabase設定 (新しいデータベース) - 環境変数必須
const BUSINESS_SUPABASE_URL = getEnvVar('NEXT_PUBLIC_BUSINESS_SUPABASE_URL');
const BUSINESS_SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_BUSINESS_SUPABASE_ANON_KEY');

// 必須設定のチェック
if (!AUTH_SUPABASE_URL || !AUTH_SUPABASE_ANON_KEY) {
  throw new Error('認証システム用Supabase設定が不完全です。NEXT_PUBLIC_AUTH_SUPABASE_URL と NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY を環境変数に設定してください。');
}

if (!BUSINESS_SUPABASE_URL || !BUSINESS_SUPABASE_ANON_KEY) {
  throw new Error('業務データベース用Supabase設定が不完全です。NEXT_PUBLIC_BUSINESS_SUPABASE_URL と NEXT_PUBLIC_BUSINESS_SUPABASE_ANON_KEY を環境変数に設定してください。');
}

// 開発環境での設定チェック
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase設定確認:');
  console.log('認証DB URL:', AUTH_SUPABASE_URL);
  console.log('認証DB キー:', AUTH_SUPABASE_ANON_KEY ? 'セット済み' : '未設定');
  console.log('業務DB URL:', BUSINESS_SUPABASE_URL);
  console.log('業務DB キー:', BUSINESS_SUPABASE_ANON_KEY !== 'YOUR_BUSINESS_ANON_KEY_PLACEHOLDER' ? 'セット済み' : '未設定');
}

// 認証専用クライアント（identity-hub-control用）
export const authClient = createClient(
  AUTH_SUPABASE_URL,
  AUTH_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
);

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

// 業務クライアントのシングルトンインスタンス
export const businessClient = new BusinessSupabaseClient();

// 便利関数
export const setBusinessClientAuth = (token: string | null) => {
  businessClient.setAuth(token);
};

export const isBusinessClientAuthenticated = (): boolean => {
  return businessClient.isAuthenticated();
};

// 後方互換性のため - 既存のコードが supabase を使用している場合
export const supabase = businessClient;

// 認証状態の取得
export const getAuthStatus = () => {
  return {
    hasAuthToken: businessClient.hasValidToken(),
    isAuthenticated: businessClient.isAuthenticated(),
    authClientReady: !!AUTH_SUPABASE_URL && !!AUTH_SUPABASE_ANON_KEY,
    businessClientReady: !!BUSINESS_SUPABASE_URL && BUSINESS_SUPABASE_ANON_KEY !== 'YOUR_BUSINESS_ANON_KEY_PLACEHOLDER'
  };
};