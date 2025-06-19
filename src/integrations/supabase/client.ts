// 改進されたSupabase認証システム統合 - 分離版
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 認証システム用Supabase設定 (identity-hub-control)
const AUTH_SUPABASE_URL = "https://fuetincqvlvcptnzpood.supabase.co";
const AUTH_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I";

// 業務データベース用Supabase設定
const BUSINESS_SUPABASE_URL = "https://aasiwxtosnmvjupikjvs.supabase.co";
const BUSINESS_SUPABASE_ANON_KEY = "YOUR_BUSINESS_ANON_KEY_HERE"; // 既に更新済み

// 認証専用クライアント（identity-hub-control用）
export const authClient = createClient(
  AUTH_SUPABASE_URL,
  AUTH_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
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
    isAuthenticated: businessClient.isAuthenticated()
  };
};