# Environment Configuration System

## Overview 概要

This system allows the frontend to fetch environment variables dynamically from the backend API, centralizing configuration management.

## Architecture 架构

```
Backend (.env) → API Endpoint → Frontend Runtime
   ↓               ↓               ↓
配置存储        配置服务         动态加载
```

## Backend Configuration 后端配置

### Environment Variables 环境变量

The backend now includes all frontend environment variables in `/Users/toyousoft/Documents/AiMatchingSendMail/.env`:

```bash
# 前端环境变量配置 - 已添加到后端 .env 文件
VITE_AUTH_SUPABASE_URL="https://fuetincqvlvcptnzpood.supabase.co"
VITE_AUTH_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_BUSINESS_SUPABASE_URL="https://aasiwxtosnmvjupikjvs.supabase.co"
VITE_BUSINESS_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_API_BASE_URL="https://fuetincqvlvcptnzpood.supabase.co/functions/v1"
VITE_NODE_ENV="production"
VITE_APP_NAME="TechRecruiterAIForChinaBusinessFront"
VITE_AUTH_REDIRECT_URL="http://localhost:8080/auth/callback"
VITE_DEBUG_MODE="true"
VITE_BACKEND_API_URL="http://localhost:8000"
VITE_BACKEND_API_KEY="sk_live_8f7a9b2c1d4e6f8a0b3c5d7e9f1a2b4c"
```

### API Endpoints API端点

New API endpoints in the backend:

1. **`GET /api/v1/config/frontend-env`**
   - Returns all frontend environment variables
   - Requires API key authentication
   - Response includes filtered variables and count

2. **`GET /api/v1/config/frontend-env/health`** 
   - Health check endpoint (no auth required)
   - Returns status and missing critical variables
   - Used for monitoring and debugging

3. **`GET /api/v1/config/frontend-env/summary`**
   - Returns configuration summary without sensitive values
   - Requires API key authentication
   - Shows which variables are configured

## Frontend Integration 前端集成

### Components 组件

1. **`EnvironmentProvider`** - React context provider that loads and manages environment variables
2. **`useEnvironmentLoader`** - Custom hook for loading configuration  
3. **`configService`** - Service class for API communication

### Usage 使用方法

The app automatically loads environment variables on startup:

```tsx
// App.tsx
<EnvironmentProvider>
  <AuthProvider>
    {/* Your app components */}
  </AuthProvider>
</EnvironmentProvider>
```

### Hooks 钩子

```tsx
// Get all environment context
const { isLoaded, envVars, healthStatus } = useEnvironment();

// Get specific environment variable
const backendUrl = useEnvVar('VITE_BACKEND_API_URL', 'http://localhost:8000');
```

## Features 功能特性

### ✅ Implemented 已实现

1. **Dynamic Configuration Loading** - Fetch env vars from backend API
2. **Caching** - 5-minute cache to reduce API calls  
3. **Health Monitoring** - Check configuration status
4. **Fallback Support** - Use local .env if backend fails
5. **Loading States** - Proper UI during configuration load
6. **Error Handling** - Graceful error recovery with retry
7. **TypeScript Support** - Full type safety
8. **Development Tools** - Debug information in dev mode

### 🎯 Architecture Benefits 架构优势

1. **Centralized Config** - Single source of truth in backend
2. **Dynamic Updates** - Config changes without frontend rebuild
3. **Environment Isolation** - Different configs per environment
4. **Security** - Sensitive config managed server-side
5. **Monitoring** - Health checks and diagnostics
6. **Scalability** - Easy to add new configuration options

## API Response Format API响应格式

### Success Response 成功响应

```json
{
  "success": true,
  "message": "前端环境变量获取成功", 
  "data": {
    "VITE_AUTH_SUPABASE_URL": "https://...",
    "VITE_BUSINESS_SUPABASE_URL": "https://...",
    // ... other env vars
  },
  "count": 11
}
```

### Health Check Response 健康检查响应

```json
{
  "status": "healthy",
  "message": "前端环境变量配置健康检查",
  "missing_critical_vars": [],
  "timestamp": "2024-01-20 10:30:00",
  "environment": "development"
}
```

## Configuration Flow 配置流程

1. **App Startup** 应用启动
   - `EnvironmentProvider` initializes
   - Calls backend health check endpoint
   - Fetches environment variables from API

2. **Runtime** 运行时  
   - Environment variables cached for 5 minutes
   - Automatic retry on network recovery
   - Fallback to local .env if backend unavailable

3. **Error Handling** 错误处理
   - Show loading UI during fetch
   - Display error UI with retry options
   - Graceful fallback to local configuration

## Testing 测试

### Backend API Testing 后端API测试

```bash
# Health check (no auth required)
curl http://localhost:8000/api/v1/config/frontend-env/health

# Get environment variables (requires API key)
curl -H "X-API-Key: sk_live_8f7a9b2c1d4e6f8a0b3c5d7e9f1a2b4c" \
     http://localhost:8000/api/v1/config/frontend-env
```

### Frontend Testing 前端测试

The system includes comprehensive error boundaries and fallback mechanisms:

- ✅ Backend unavailable → Falls back to local .env
- ✅ API key invalid → Shows error with retry
- ✅ Network error → Automatic retry when online
- ✅ Cache expiry → Transparent refresh

## Security Considerations 安全考虑

1. **API Key Protection** - Backend requires valid API key
2. **HTTPS Only** - Production should use HTTPS
3. **Rate Limiting** - Backend includes rate limiting
4. **Sensitive Data** - No secrets exposed in health check
5. **CORS** - Properly configured origins

## Migration Guide 迁移指南

### Before 迁移前
- Frontend environment variables in local `.env` file
- Manual configuration management per environment

### After 迁移后  
- Centralized configuration in backend
- Dynamic loading with caching and health monitoring
- Improved developer experience with error recovery

## Troubleshooting 故障排除

### Common Issues 常见问题

1. **Backend Not Running** 
   - Check backend server status
   - Verify correct port configuration

2. **API Key Invalid**
   - Check X-API-Key header in requests
   - Verify key matches backend configuration

3. **CORS Errors**
   - Check backend CORS configuration
   - Ensure frontend domain is allowed

4. **Cache Issues**
   - Use `configService.clearCache()` to force refresh
   - Check browser network tab for API calls

### Debug Information 调试信息

Development mode includes detailed logging:
- 🔧 Configuration loading progress
- 🏥 Health check results  
- 📋 Loaded environment variables
- ⚠️ Missing or invalid configurations

## Next Steps 后续步骤

1. **Environment Management UI** - Admin interface for config
2. **Hot Reload** - Real-time config updates via WebSocket
3. **Validation** - Backend validation of configuration values
4. **Audit Log** - Track configuration changes
5. **Multi-tenant** - Per-tenant configuration support