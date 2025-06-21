// 认证调试工具
import { getStoredTokens } from './auth-api';

// 调试认证状态
export const debugAuthState = () => {
    console.log('=== 认证状态调试 ===');
    
    // 检查localStorage
    const tokens = getStoredTokens();
    console.log('Token状态:', {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        accessTokenStart: tokens.accessToken ? tokens.accessToken.substring(0, 20) + '...' : null,
        refreshTokenStart: tokens.refreshToken ? tokens.refreshToken.substring(0, 20) + '...' : null,
    });
    
    // 检查所有auth相关的localStorage项
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auth_')) {
            authKeys.push({
                key,
                hasValue: !!localStorage.getItem(key),
                valueLength: localStorage.getItem(key)?.length || 0
            });
        }
    }
    console.log('Auth localStorage项:', authKeys);
    
    // 检查window对象
    console.log('环境检查:', {
        hasWindow: typeof window !== 'undefined',
        hasLocalStorage: typeof localStorage !== 'undefined',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
    });
    
    console.log('=== 调试完成 ===');
};

// 清除所有认证数据（用于测试）
export const clearAllAuthData = () => {
    const authKeys = [];
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auth_')) {
            authKeys.push(key);
            localStorage.removeItem(key);
        }
    }
    console.log('已清除认证数据:', authKeys);
};

// 手动设置测试token（用于测试）
export const setTestTokens = () => {
    localStorage.setItem('auth_access_token', 'test_access_token_' + Date.now());
    localStorage.setItem('auth_refresh_token', 'test_refresh_token_' + Date.now());
    localStorage.setItem('auth_token_saved_at', new Date().toISOString());
    console.log('已设置测试token');
};