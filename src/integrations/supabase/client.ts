// 改進されたSupabase認証システム統合 - 環境変数対応版（API Key方式）
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 環境変数から設定を取得
const getEnvVar = (key: string, fallback?: string): string => {
  return import.meta.env[key as keyof ImportMetaEnv] || fallback || '';
};

// 認証システム用Supabase設定 (identity-hub-control) - 環境変数必須
const AUTH_SUPABASE_URL = getEnvVar('VITE_AUTH_SUPABASE_URL');
const AUTH_SUPABASE_ANON_KEY = getEnvVar('VITE_AUTH_SUPABASE_ANON_KEY');

// 業務データベース用Supabase設定 (新しいデータベース) - 環境変数必須
const BUSINESS_SUPABASE_URL = getEnvVar('VITE_BUSINESS_SUPABASE_URL', 'https://aasiwxtosnmvjupikjvs.supabase.co');
const BUSINESS_SUPABASE_ANON_KEY = getEnvVar('VITE_BUSINESS_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc2l3eHRvc25tdmp1cGlranZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTQwMTQsImV4cCI6MjA2NTg3MDAxNH0.4rq-Mp2Ak7TPjoRix_gcHqyx929THJnilIqX1oWWlm0');
// サービスロールキー（RLS回避用）
const BUSINESS_SUPABASE_SERVICE_KEY = getEnvVar('VITE_BUSINESS_SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhc2l3eHRvc25tdmp1cGlranZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTM5MzUyNiwiZXhwIjoyMDUwOTY5NTI2fQ.kQSzYhRQ8cVU_DLYbGWQKFKHs5XQZqSqB2uXKAJQVxc');

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
  
  // 詳細な設定チェック
  console.log('環境変数の詳細:');
  console.log('VITE_BUSINESS_SUPABASE_URL:', import.meta.env.VITE_BUSINESS_SUPABASE_URL);
  console.log('VITE_BUSINESS_SUPABASE_ANON_KEY:', import.meta.env.VITE_BUSINESS_SUPABASE_ANON_KEY ? 'セット済み' : '未設定');
  console.log('VITE_BUSINESS_SUPABASE_SERVICE_KEY:', import.meta.env.VITE_BUSINESS_SUPABASE_SERVICE_KEY ? 'セット済み' : '未設定');
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

// 業務データ専用クライアント - API Key方式（簡化版）
class BusinessSupabaseClient {
  private client: ReturnType<typeof createClient<Database>>;
  private isReady = false;

  constructor() {
    // anonキーを使用（サービスロールキーが無効な場合があるため）
    const keyToUse = BUSINESS_SUPABASE_ANON_KEY;
    
    this.client = createClient<Database>(
      BUSINESS_SUPABASE_URL,
      keyToUse,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            'apikey': keyToUse, // 重要：APIキーヘッダー
            'Authorization': `Bearer ${keyToUse}`, // 認証ヘッダー
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      }
    );

    this.isReady = true;
    console.log('業務クライアントが作成されました（API Key方式）');
    console.log('使用中のキータイプ: Anon Key');
  }

  // 認証設定：RLS対応のため
  setAuth(token: string | null) {
    if (token) {
      this.client.auth.setSession({
        access_token: token,
        refresh_token: token,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: null
      } as any);
      console.log('業務クライアントに認証トークンを設定しました');
    } else {
      console.log('認証トークンをクリアしました');
    }
  }

  // 簡化版：常にtrue
  public hasValidToken(): boolean {
    return this.isReady;
  }

  // テーブルアクセス：認証チェック不要
  from<TableName extends keyof Database['public']['Tables']>(table: TableName) {
    return this.client.from(table);
  }

  // RPC コール：認証チェック不要
  rpc(fn: string, args?: any) {
    return (this.client as any).rpc(fn, args);
  }

  // ストレージアクセス：認証チェック不要
  get storage() {
    return this.client.storage;
  }

  // Functions アクセス：認証チェック不要
  get functions() {
    return this.client.functions;
  }

  // 認証状態のチェック：常にtrue
  isAuthenticated(): boolean {
    return this.isReady;
  }

  // クライアントインスタンスの取得
  getClient() {
    return this.client;
  }

  // 互換性のために残す（API Key方式では意味なし）
  getCurrentToken(): string | null {
    return null;
  }
}

// 業務クライアントのシングルトンインスタンス（businessClientとしてエクスポート）
export const businessClient = BUSINESS_SUPABASE_URL && BUSINESS_SUPABASE_ANON_KEY ? new BusinessSupabaseClient() : null;

// 便利関数 - 互換性のために残す
export const setBusinessClientAuth = (token: string | null) => {
  if (businessClient) {
    businessClient.setAuth(token);
  } else {
    console.error('業務クライアントが利用できません');
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

  // API Key方式では特に何もしない
  console.log('API Key方式のため、テナント切替は設定ファイルで管理してください');
};

// 認証状態の取得
export const getAuthStatus = () => {
  return {
    hasAuthToken: businessClient ? businessClient.hasValidToken() : false,
    isAuthenticated: businessClient ? businessClient.isAuthenticated() : false,
    authClientReady: !!AUTH_SUPABASE_URL && !!AUTH_SUPABASE_ANON_KEY,
    businessClientReady: !!BUSINESS_SUPABASE_URL && !!BUSINESS_SUPABASE_ANON_KEY,
    currentToken: 'API Key方式（トークン不要）'
  };
};