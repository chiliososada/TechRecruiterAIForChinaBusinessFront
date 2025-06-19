// JWT認証対応の業務データベースクライアント
import { businessClient, setBusinessClientAuth } from './client';
import { getStoredTokens, refreshToken as apiRefreshToken, clearStoredTokens, saveTokens } from '@/utils/auth-api';
import type { Database } from './business-types';

// JWT付きでの業務データアクセス用クライアント
class BusinessClientManager {
    private static instance: BusinessClientManager;
    private isInitialized = false;

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
            const { error } = await businessClient.from('projects').select('id').limit(1);

            if (error) {
                // トークンが無効な場合、リフレッシュを試行
                if (refreshToken) {
                    const refreshResult = await apiRefreshToken(refreshToken);
                    if (refreshResult.success && refreshResult.data) {
                        setBusinessClientAuth(refreshResult.data.access_token);
                        saveTokens(refreshResult.data.access_token, refreshToken);
                        this.isInitialized = true;
                        return true;
                    }
                }
                throw new Error('トークンが無効です');
            }

            this.isInitialized = true;
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
            // 簡単なクエリでトークンをテスト
            const { error } = await businessClient.from('projects').select('id').limit(1);

            if (error && refreshToken) {
                // リフレッシュトークンで再試行
                const refreshResult = await apiRefreshToken(refreshToken);
                if (refreshResult.success && refreshResult.data) {
                    setBusinessClientAuth(refreshResult.data.access_token);
                    saveTokens(refreshResult.data.access_token, refreshToken);
                    return true;
                }
            }

            return !error;
        } catch (error) {
            console.error('トークン検証エラー:', error);
            return false;
        }
    }

    // 認証のクリア
    public clearAuth(): void {
        setBusinessClientAuth(''); // 空文字列でクリア
        clearStoredTokens();
        this.isInitialized = false;
    }

    // 認証済みクライアントの取得
    public getClient() {
        if (!this.isInitialized) {
            throw new Error('ビジネスクライアントが初期化されていません。先にログインしてください。');
        }
        return businessClient;
    }

    // 認証状態の確認
    public isAuthenticated(): boolean {
        return this.isInitialized;
    }

    // 自動リフレッシュ付きのクエリ実行
    public async executeWithRetry<T>(
        queryFn: () => Promise<T>,
        maxRetries: number = 1
    ): Promise<T> {
        let attempts = 0;

        while (attempts <= maxRetries) {
            try {
                return await queryFn();
            } catch (error: any) {
                if (error?.code === 'PGRST301' && attempts < maxRetries) {
                    // JWT エラーの場合、リフレッシュを試行
                    const { refreshToken } = getStoredTokens();
                    if (refreshToken) {
                        const refreshResult = await apiRefreshToken(refreshToken);
                        if (refreshResult.success && refreshResult.data) {
                            setBusinessClientAuth(refreshResult.data.access_token);
                            saveTokens(refreshResult.data.access_token, refreshToken);
                            attempts++;
                            continue;
                        }
                    }
                }
                throw error;
            }
        }

        throw new Error('認証エラー: ログインし直してください');
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