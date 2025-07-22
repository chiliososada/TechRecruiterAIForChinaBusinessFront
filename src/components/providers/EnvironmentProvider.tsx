/**
 * 环境变量提供者组件
 * Environment Variables Provider Component
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useEnvironmentLoader } from '@/hooks/useEnvironmentLoader';

interface EnvironmentContextType {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  envVars: Record<string, string> | null;
  healthStatus: 'healthy' | 'warning' | 'error' | 'unknown';
  retryLoad: () => void;
  clearCache: () => void;
  reload: () => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

interface EnvironmentProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: (error: string, retry: () => void) => ReactNode;
}

export function EnvironmentProvider({ 
  children, 
  fallback,
  errorFallback 
}: EnvironmentProviderProps) {
  const environmentState = useEnvironmentLoader();

  // 如果正在加载且提供了fallback组件
  if (environmentState.isLoading && fallback) {
    return <>{fallback}</>;
  }

  // 如果加载失败且提供了错误fallback组件
  if (environmentState.error && errorFallback) {
    return <>{errorFallback(environmentState.error, environmentState.retryLoad)}</>;
  }

  // 默认加载中UI
  if (environmentState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Loading Configuration...</p>
            <p className="text-sm text-gray-600">
              Fetching environment variables from backend...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 默认错误UI
  if (environmentState.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Configuration Error</h2>
            <p className="text-gray-600 text-sm">
              Failed to load application configuration from backend server.
            </p>
            <details className="text-xs text-gray-500 bg-gray-100 p-3 rounded mt-4">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{environmentState.error}</pre>
            </details>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={environmentState.retryLoad}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry Loading
            </button>
            <button
              onClick={environmentState.clearCache}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              Clear Cache & Retry
            </button>
          </div>

          {import.meta.env.DEV && (
            <div className="text-xs text-gray-400 space-y-1">
              <p>Development Mode: Check backend server at {import.meta.env.VITE_BACKEND_API_URL}</p>
              <p>Health Status: <span className="font-mono">{environmentState.healthStatus}</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <EnvironmentContext.Provider value={environmentState}>
      {children}
    </EnvironmentContext.Provider>
  );
}

/**
 * 使用环境变量上下文的Hook
 */
export function useEnvironment(): EnvironmentContextType {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}

/**
 * 获取特定环境变量的Hook
 */
export function useEnvVar(key: string, defaultValue?: string): string {
  const { envVars } = useEnvironment();
  return envVars?.[key] || defaultValue || '';
}

/**
 * 获取所有环境变量的Hook（用于替代import.meta.env）
 */
export function useAllEnvVars(): Record<string, string> {
  const { envVars } = useEnvironment();
  return envVars || {};
}