// 改進されたSupabase認証システム統合
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 認証システム用Supabase設定 (identity-hub-control)
const AUTH_SUPABASE_URL = "https://fuetincqvlvcptnzpood.supabase.co";
const AUTH_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXRpbmNxdmx2Y3B0bnpwb29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMjQ1MzYsImV4cCI6MjA2NTgwMDUzNn0.2NS-yPcV5W7BwQ4Eig6FOhH2lCOOAl9w9BC0kqZ9q3I";

// 業務データベース用Supabase設定
const BUSINESS_SUPABASE_URL = "https://aasiwxtosnmvjupikjvs.supabase.co";
const BUSINESS_SUPABASE_ANON_KEY = "YOUR_BUSINESS_ANON_KEY_HERE"; // 実際のキーに置き換えてください

// 認証専用クライアント
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

// 業務データ専用クライアント - カスタムJWT認証
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
        }
      }
    );
  }

  // JWT トークンを設定
  setAuth(token: string | null) {
    this.currentToken = token;
  }

  // 認証済みのクエリを実行
  private async executeWithAuth<T>(
    operation: (client: ReturnType<typeof createClient<Database>>) => Promise<T>
  ): Promise<T> {
    if (!this.currentToken) {
      throw new Error('認証トークンが設定されていません');
    }

    // 一時的にグローバルヘッダーを設定
    const originalAuth = this.client.functions.setAuth;
    this.client.functions.setAuth(this.currentToken);

    try {
      const result = await operation(this.client);
      return result;
    } finally {
      // ヘッダーをリセット
      this.client.functions.setAuth(null);
    }
  }

  // テーブルアクセス用のプロキシ
  from<TableName extends keyof Database['public']['Tables']>(
    table: TableName
  ) {
    const originalFrom = this.client.from(table);

    // クエリメソッドをオーバーライド
    return {
      select: (columns?: string) => {
        const query = originalFrom.select(columns);
        return this.wrapQuery(query);
      },
      insert: (data: any) => {
        const query = originalFrom.insert(data);
        return this.wrapQuery(query);
      },
      update: (data: any) => {
        const query = originalFrom.update(data);
        return this.wrapQuery(query);
      },
      delete: () => {
        const query = originalFrom.delete();
        return this.wrapQuery(query);
      },
      upsert: (data: any) => {
        const query = originalFrom.upsert(data);
        return this.wrapQuery(query);
      }
    };
  }

  // クエリを認証付きで実行するラッパー
  private wrapQuery(query: any) {
    const originalMethods = {};

    // 実行メソッドをラップ
    ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte', 'rangeAdjacent', 'overlaps', 'textSearch', 'match', 'not', 'or', 'filter', 'order', 'limit', 'range', 'single', 'maybe_single'].forEach(method => {
      if (query[method]) {
        const originalMethod = query[method].bind(query);
        query[method] = (...args: any[]) => {
          const result = originalMethod(...args);
          return this.wrapQuery(result);
        };
      }
    });

    // 最終実行メソッド
    const originalThen = query.then;
    if (originalThen) {
      query.then = async (resolve?: any, reject?: any) => {
        try {
          if (!this.currentToken) {
            throw new Error('認証トークンが設定されていません');
          }

          // 認証ヘッダーを設定
          query.headers = {
            ...query.headers,
            'Authorization': `Bearer ${this.currentToken}`
          };

          return await originalThen.call(query, resolve, reject);
        } catch (error) {
          if (reject) reject(error);
          throw error;
        }
      };
    }

    return query;
  }

  // RPCコール用 - 型安全性を緩和
  rpc(fnName: string, params?: any) {
    const rpcCall = (this.client as any).rpc(fnName, params);
    return this.wrapQuery(rpcCall);
  }

  // ストレージアクセス用
  get storage() {
    return this.client.storage;
  }

  // Functions アクセス用
  get functions() {
    return this.client.functions;
  }
}

// 業務クライアントのインスタンス
export const businessClient = new BusinessSupabaseClient();

// 便利関数
export const setBusinessClientAuth = (token: string | null) => {
  businessClient.setAuth(token);
};

export const clearBusinessClientAuth = () => {
  businessClient.setAuth(null);
};

// 後方互換性
export const supabase = businessClient;

export const getAuthStatus = () => {
  return {
    hasAuthToken: !!(businessClient as any).currentToken,
    authToken: (businessClient as any).currentToken
  };
};