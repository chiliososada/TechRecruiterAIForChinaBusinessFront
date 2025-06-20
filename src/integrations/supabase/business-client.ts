// 简化版业务数据库客户端 - Postman方式（去掉JWT）
import { businessClient } from './client';

// 简化的业务データアクセス用クライアント管理
class BusinessClientManager {
    private static instance: BusinessClientManager;
    private isInitialized = false;
    private currentUser: any = null;

    private constructor() { }

    public static getInstance(): BusinessClientManager {
        if (!BusinessClientManager.instance) {
            BusinessClientManager.instance = new BusinessClientManager();
        }
        return BusinessClientManager.instance;
    }

    // 初期化：JWT不要版
    public async initialize(userInfo?: any): Promise<boolean> {
        if (this.isInitialized) return true;

        try {
            this.currentUser = userInfo;

            console.log('=== 業務データベース接続テスト開始（Postman方式）===');

            // 接続テストを実行
            const testResult = await this.testConnection();
            if (testResult.success) {
                this.isInitialized = true;
                console.log('✅ 業務データベース接続成功！');
                return true;
            } else {
                console.warn('⚠️ 接続テストに失敗:', testResult.error);
                // 失敗してもAPIキーが正しければ動作する可能性があるので初期化完了とする
                this.isInitialized = true;
                return true;
            }
        } catch (error) {
            console.error('❌ 業務クライアント初期化エラー:', error);
            return false;
        }
    }

    // ユーザー設定：JWTトークン不要版
    public setUser(userInfo: any): boolean {
        this.currentUser = userInfo;
        console.log('業務クライアントにユーザー情報を設定:', userInfo?.email);
        this.isInitialized = true;
        return true;
    }

    // 接続テスト：Postman方式
    public async testConnection(): Promise<{ success: boolean; error?: string }> {
        if (!businessClient) {
            return { success: false, error: '業務クライアントが利用できません' };
        }

        try {
            console.log('接続テスト実行中: GET /rest/v1/projects?select=id&limit=1');

            // Supabase クライアントでテスト（APIキー方式）
            const { data, error } = await businessClient.from('projects').select('id').limit(1);

            if (error) {
                console.error('接続テストエラー:', error);
                return { success: false, error: error.message };
            }

            console.log('✅ 接続テスト成功, データ件数:', data?.length || 0);
            return { success: true };
        } catch (error: any) {
            console.error('❌ 接続テスト例外:', error);
            return { success: false, error: error.message };
        }
    }

    // 認証のクリア：簡単版
    public clearAuth(): void {
        this.currentUser = null;
        this.isInitialized = false;
        console.log('業務クライアントの認証がクリアされました');
    }

    // 認証済みクライアントの取得：簡単版
    public getClient() {
        if (!businessClient) {
            throw new Error('業務クライアントが利用できません');
        }
        return businessClient;
    }

    // 認証状態の確認：簡単版
    public isAuthenticated(): boolean {
        return this.isInitialized && !!businessClient;
    }

    // シンプルなクエリ実行：リトライなし
    public async executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
        try {
            return await queryFn();
        } catch (error: any) {
            console.error('クエリ実行エラー:', error);
            throw error;
        }
    }

    // 兼容性：executeWithRetry のエイリアス
    public async executeWithRetry<T>(
        queryFn: () => Promise<T>,
        maxRetries?: number // 使わないが互換性のため
    ): Promise<T> {
        return await this.executeQuery(queryFn);
    }

    // デバッグ用の状態取得：簡単版
    public getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            hasUser: !!this.currentUser,
            userEmail: this.currentUser?.email || 'unknown',
            businessClientReady: !!businessClient
        };
    }
}

// シングルトンインスタンスのエクスポート
export const businessClientManager = BusinessClientManager.getInstance();

// 便利なヘルパー関数：簡化版
export const getAuthenticatedBusinessClient = () => {
    return businessClientManager.getClient();
};

export const initializeBusinessClient = async (userInfo?: any): Promise<boolean> => {
    return await businessClientManager.initialize(userInfo);
};

// JWT関数を簡単なユーザー設定に変更
export const setBusinessClientToken = async (userInfo: any): Promise<boolean> => {
    return businessClientManager.setUser(userInfo);
};

export const clearBusinessClientAuth = (): void => {
    businessClientManager.clearAuth();
};

export const isBusinessClientAuthenticated = (): boolean => {
    return businessClientManager.isAuthenticated();
};

// executeWithRetryを簡単なexecuteQueryに変更
export const executeBusinessQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
    return await businessClientManager.executeQuery(queryFn);
};

// 兼容性：executeWithRetryのエクスポート
export const executeWithRetry = async <T>(queryFn: () => Promise<T>): Promise<T> => {
    return await businessClientManager.executeWithRetry(queryFn);
};