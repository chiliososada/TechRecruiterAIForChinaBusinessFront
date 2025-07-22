/**
 * 配置服务 - 从后端API获取环境变量配置
 * Configuration Service - Fetch environment variables from backend API
 */

interface FrontendEnvResponse {
  success: boolean;
  message: string;
  data: Record<string, string>;
  count: number;
}

interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  missing_critical_vars: string[];
  timestamp: string;
  environment: string;
}

class ConfigService {
  private baseUrl: string;
  private apiKey: string;
  private envCache: Record<string, string> | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    // 使用硬编码的默认值，不依赖前台.env文件
    this.baseUrl = 'http://localhost:8000';
    this.apiKey = 'sk_live_8f7a9b2c1d4e6f8a0b3c5d7e9f1a2b4c';
  }

  /**
   * 更新API基础URL
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    // 清空缓存，强制重新获取
    this.envCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * 设置API密钥
   */
  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * 获取前端环境变量配置
   */
  public async getFrontendEnv(): Promise<Record<string, string>> {
    try {
      // 检查缓存
      if (this.envCache && Date.now() < this.cacheExpiry) {
        console.log('🔄 Using cached environment variables');
        return this.envCache;
      }

      console.log('📡 Fetching environment variables from backend...');
      
      const response = await fetch(`${this.baseUrl}/api/v1/config/frontend-env`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: FrontendEnvResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch environment variables');
      }

      // 更新缓存
      this.envCache = result.data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log(`✅ Successfully loaded ${result.count} environment variables`);
      console.log('📋 Environment variables:', Object.keys(result.data));

      return result.data;

    } catch (error) {
      console.error('❌ Failed to fetch frontend environment variables:', error);
      
      // 不使用前台.env作为fallback，而是抛出错误让EnvironmentProvider处理
      throw new Error(`Cannot load environment variables from backend API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 检查后端环境变量配置健康状态
   */
  public async checkHealth(): Promise<HealthCheckResponse> {
    try {
      console.log('🏥 Checking backend environment health...');

      const response = await fetch(`${this.baseUrl}/api/v1/config/frontend-env/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: HealthCheckResponse = await response.json();
      
      console.log(`🏥 Health check result: ${result.status}`);
      if (result.missing_critical_vars.length > 0) {
        console.warn('⚠️ Missing critical environment variables:', result.missing_critical_vars);
      }

      return result;

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        missing_critical_vars: [],
        timestamp: new Date().toISOString(),
        environment: 'unknown'
      };
    }
  }

  /**
   * 应用环境变量到运行时环境
   */
  public applyEnvToRuntime(envVars: Record<string, string>): void {
    console.log('🔧 Applying environment variables to runtime...');
    
    let appliedCount = 0;
    
    for (const [key, value] of Object.entries(envVars)) {
      if (value && value.trim()) {
        // 在开发环境中，某些env变量可能无法直接设置
        // 这里主要用于日志记录和调试
        try {
          // 存储到全局对象中，供应用其他部分使用
          (window as any).__ENV__ = (window as any).__ENV__ || {};
          (window as any).__ENV__[key] = value;
          appliedCount++;
        } catch (error) {
          console.warn(`⚠️ Could not apply ${key}:`, error);
        }
      }
    }

    console.log(`✅ Applied ${appliedCount} environment variables to runtime`);
  }


  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.envCache = null;
    this.cacheExpiry = 0;
    console.log('🗑️ Environment variables cache cleared');
  }

  /**
   * 获取当前缓存的环境变量
   */
  public getCachedEnv(): Record<string, string> | null {
    if (this.envCache && Date.now() < this.cacheExpiry) {
      return { ...this.envCache };
    }
    return null;
  }
}

// 导出单例实例
export const configService = new ConfigService();

// 导出类型
export type { FrontendEnvResponse, HealthCheckResponse };