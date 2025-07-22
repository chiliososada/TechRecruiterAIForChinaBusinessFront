/**
 * 环境变量加载器 Hook
 * Environment Variables Loader Hook
 */

import { useEffect, useState } from 'react';
import { configService } from '@/services/configService';

interface EnvironmentLoaderState {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  envVars: Record<string, string> | null;
  healthStatus: 'healthy' | 'warning' | 'error' | 'unknown';
}

export function useEnvironmentLoader() {
  const [state, setState] = useState<EnvironmentLoaderState>({
    isLoading: true,
    isLoaded: false,
    error: null,
    envVars: null,
    healthStatus: 'unknown',
  });

  const loadEnvironment = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // 先检查健康状态
      const healthResult = await configService.checkHealth();
      console.log('🏥 Backend environment health:', healthResult);

      // 获取环境变量
      const envVars = await configService.getFrontendEnv();
      console.log('📋 Loaded environment variables:', Object.keys(envVars));

      // 应用到运行时
      configService.applyEnvToRuntime(envVars);

      setState({
        isLoading: false,
        isLoaded: true,
        error: null,
        envVars,
        healthStatus: healthResult.status,
      });

      // 如果有警告或缺失的变量，在开发环境中显示
      if (healthResult.status === 'warning' && import.meta.env.DEV) {
        console.warn('⚠️ Environment configuration warnings:', {
          status: healthResult.status,
          missing: healthResult.missing_critical_vars,
          message: healthResult.message
        });
      }

    } catch (error) {
      console.error('❌ Failed to load environment configuration:', error);
      
      setState({
        isLoading: false,
        isLoaded: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        envVars: null,
        healthStatus: 'error',
      });
    }
  };

  const retryLoad = () => {
    loadEnvironment();
  };

  const clearCache = () => {
    configService.clearCache();
    loadEnvironment();
  };

  // 在组件挂载时加载环境变量
  useEffect(() => {
    loadEnvironment();
  }, []);

  // 监听网络状态变化，网络恢复时重新加载
  useEffect(() => {
    const handleOnline = () => {
      if (!state.isLoaded) {
        console.log('🌐 Network restored, retrying environment load...');
        loadEnvironment();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [state.isLoaded]);

  return {
    ...state,
    retryLoad,
    clearCache,
    reload: loadEnvironment,
  };
}