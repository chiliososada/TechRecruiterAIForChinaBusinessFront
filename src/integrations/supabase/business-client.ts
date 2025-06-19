// JWT認証対応の業務データベースクライアント管理器
import { businessClient, setBusinessClientAuth } from './client';
import { getStoredTokens, refreshToken as apiRefreshToken, clearStoredTokens, saveTokens } from '@/utils/auth-api';

// JWT付きでの業務データアクセス用クライアント管理
class BusinessClientManager {
    private static instance: BusinessClientManager;
    private isInitialized = false;
    private retryCount = 0;
    private maxRetries = 2;

    private constructor() { }

    public static getInstance(): BusinessClientManager {
        if (!BusinessClientManager.instance) {
            BusinessClientManager.instance = new BusinessClientManager();
        }
        return BusinessClientManager.instance;
    }

    // 初期化：保存されたトークンを読み込み
    public async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;

        const { accessToken, refreshToken } = getStoredTokens();

        if (accessToken) {
            try {
                // トークンの有効性を確認
                const isValid = await this.verifyAndSetToken(accessToken, refreshToken);
                if (isValid) {
                    this.isInitialized = true;
                    console.log('業務クライアントが初期化されました');
                    return true;
                }
            } catch (error) {
                console.error('トークン初期化エラー:', error);
            }
        }

        // トークンが無効または存在しない場合
        this.clearAuth();
        return false;
    }

    // JWT トークンの設定と検証
    public async setToken(accessToken: string, refreshToken?: string): Promise<boolean> {
        try {
            // トークンをクライアントに設定
            setBusinessClientAuth(accessToken);

            // 簡単なクエリでトークンの有効性を確認
            const testResult = await this.testConnection();

            if (!testResult.success) {
                // トークンが無効な場合、リフレッシュを試行
                if (refreshToken) {
                    const refreshResult = await apiRefreshToken(refreshToken);
                    if (refreshResult.success && refreshResult.data) {
                        setBusinessClientAuth(refreshResult.data.access_token);
                        saveTokens(refreshResult.data.access_token, refreshToken);
                        this.isInitialized = true;
                        console.log('トークンがリフレッシュされました');
                        return true;
                    }
                }
                throw new Error('トークンが無効です');
            }

            this.isInitialized = true;
            console.log('業務クライアントのトークンが設定されました');
            return true;
        } catch (error) {
            console.error('トークン設定エラー:', error);
            this.clearAuth();
            return false;
        }
    }

    // トークンの検証と設定
    private async verifyAndSetToken(accessToken: string, refreshToken: string | null): Promise<boolean> {
        setBusinessClientAuth(accessToken);

        try {
            const testResult = await this.testConnection();

            if (!testResult.success && refreshToken) {
                // リフレッシュトークンで再試行
                const refreshResult = await apiRefreshToken(refreshToken);
                if (refreshResult.success && refreshResult.data) {
                    setBusinessClientAuth(refreshResult.data.access_token);
                    saveTokens(refreshResult.data.access_token, refreshToken);
                    return true;
                }
            }

            return testResult.success;
        } catch (error) {
            console.error('トークン検証エラー:', error);
            return false;
        }
    }

    // 接続テスト - パブリックメソッドに変更
    public async testConnection(): Promise<{ success: boolean; error?: string }> {
        try {
            // プロジェクトテーブルに対して軽量なクエリを実行
            const { error } = await businessClient.from('projects').select('id').limit(1);

            if (error) {
                console.error('接続テストエラー:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            console.error('接続テスト例外:', error);
            return { success: false, error: error.message };
        }
    }

    // 認証エラーかどうかを判定
    private isAuthError(error: any): boolean {
        const authErrorCodes = ['PGRST301', 'PGRST302', '401', '403'];
        const authErrorMessages = ['JWT', 'authorization', 'token', 'unauthorized', 'invalid signature'];

        // エラーコードをチェック
        if (error.code && authErrorCodes.some(code => error.code.includes(code))) {
            return true;
        }

        // エラーメッセージをチェック
        const errorMessage = (error.message || error.details || '').toLowerCase();
        return authErrorMessages.some(msg => errorMessage.includes(msg));
    }

    // 強制的にトークンを再取得
    public async forceRefreshToken(): Promise<boolean> {
        const { refreshToken } = getStoredTokens();
        if (!refreshToken) {
            this.clearAuth();
            return false;
        }

        try {
            const refreshResult = await apiRefreshToken(refreshToken);
            if (refreshResult.success && refreshResult.data) {
                setBusinessClientAuth(refreshResult.data.access_token);
                saveTokens(refreshResult.data.access_token, refreshToken);
                this.isInitialized = true;
                return true;
            }
        } catch (error) {
            console.error('強制トークンリフレッシュエラー:', error);
        }

        this.clearAuth();
        return false;
    }

    // 認証のクリア
    public clearAuth(): void {
        // 直接 businessClient の setAuth を呼び出す
        businessClient.setAuth(null);
        clearStoredTokens();
        this.isInitialized = false;
        this.retryCount = 0;
        console.log('業務クライアントの認証がクリアされました');
    }

    // 認証済みクライアントの取得
    public getClient() {
        if (!this.isInitialized) {
            throw new Error('業務クライアントが初期化されていません。先にログインしてください。');
        }
        return businessClient;
    }

    // 認証状態の確認
    public isAuthenticated(): boolean {
        return this.isInitialized && businessClient.isAuthenticated();
    }

    // 自動リフレッシュ付きのクエリ実行
    public async executeWithRetry<T>(
        queryFn: () => Promise<T>,
        maxRetries: number = this.maxRetries
    ): Promise<T> {
        let attempts = 0;

        while (attempts <= maxRetries) {
            try {
                const result = await queryFn();
                this.retryCount = 0; // 成功したらリトライカウントをリセット
                return result;
            } catch (error: any) {
                console.error(`クエリ実行エラー (試行 ${attempts + 1}/${maxRetries + 1}):`, error);

                attempts++;

                // 認証エラーの場合のみリトライ
                if (this.isAuthError(error) && attempts <= maxRetries) {
                    console.log('認証エラーを検出、トークンリフレッシュを試行中...');

                    const refreshSuccess = await this.forceRefreshToken();
                    if (!refreshSuccess) {
                        console.error('トークンリフレッシュに失敗');
                        throw new Error('認証が期限切れです。再ログインしてください。');
                    }

                    console.log('トークンリフレッシュ成功、再試行中...');
                    continue;
                } else {
                    // 認証エラー以外、または最大リトライ回数に達した場合
                    throw error;
                }
            }
        }

        // このポイントには到達しないはずですが、TypeScriptのために
        throw new Error('予期しないエラー');
    }
}

// シングルトンインスタンスのエクスポート
export const businessClientManager = BusinessClientManager.getInstance();

// 便利なヘルパー関数
export const getAuthenticatedBusinessClient = () => {
    return businessClientManager.getClient();
};

export const initializeBusinessClient = async (): Promise<boolean> => {
    return await businessClientManager.initialize();
};

export const setBusinessClientToken = async (accessToken: string, refreshToken?: string): Promise<boolean> => {
    return await businessClientManager.setToken(accessToken, refreshToken);
};

export const clearBusinessClientAuth = (): void => {
    businessClientManager.clearAuth();
};

export const isBusinessClientAuthenticated = (): boolean => {
    return businessClientManager.isAuthenticated();
};

export const executeBusinessQuery = async <T>(queryFn: () => Promise<T>): Promise<T> => {
    return await businessClientManager.executeWithRetry(queryFn);
};