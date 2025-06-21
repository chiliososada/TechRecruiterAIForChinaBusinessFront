import { useAuth } from '@/contexts/AuthContext';
import { getStoredTokens } from '@/utils/auth-api';
import { debugAuthState, clearAllAuthData, setTestTokens } from '@/utils/auth-debug';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { user, token, loading, signOut } = useAuth();
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const refreshStorageInfo = () => {
    const tokens = getStoredTokens();
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('auth_')) {
        authKeys.push({
          key,
          hasValue: !!localStorage.getItem(key),
          valueLength: localStorage.getItem(key)?.length || 0,
          value: localStorage.getItem(key)?.substring(0, 50) + '...'
        });
      }
    }
    
    setStorageInfo({
      tokens,
      authKeys,
      timestamp: new Date().toLocaleString()
    });
  };

  useEffect(() => {
    refreshStorageInfo();
    const interval = setInterval(refreshStorageInfo, 2000); // 每2秒刷新
    return () => clearInterval(interval);
  }, []);

  const handleDebugAuth = () => {
    debugAuthState();
  };

  const handleClearAuth = () => {
    clearAllAuthData();
    refreshStorageInfo();
  };

  const handleSetTestTokens = () => {
    setTestTokens();
    refreshStorageInfo();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">认证调试页面</h1>
        <div className="space-x-2">
          <Button onClick={refreshStorageInfo} variant="outline">
            刷新数据
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            返回首页
          </Button>
        </div>
      </div>

      {/* AuthContext 状态 */}
      <Card>
        <CardHeader>
          <CardTitle>AuthContext 状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Loading:</label>
              <Badge variant={loading ? "destructive" : "default"}>
                {loading ? "是" : "否"}
              </Badge>
            </div>
            <div>
              <label className="font-semibold">Has User:</label>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "是" : "否"}
              </Badge>
            </div>
            <div>
              <label className="font-semibold">Has Token:</label>
              <Badge variant={token ? "default" : "destructive"}>
                {token ? "是" : "否"}
              </Badge>
            </div>
            <div>
              <label className="font-semibold">User Email:</label>
              <span className="ml-2">{user?.email || "无"}</span>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-4 bg-muted rounded">
              <h4 className="font-semibold mb-2">用户详情:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          {/* 显示所有认证相关的localStorage数据 */}
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">保存的用户数据:</h4>
            <pre className="text-sm overflow-auto">
              {localStorage.getItem('auth_user_data') || '无保存的用户数据'}
            </pre>
          </div>
          
          {/* 显示数据库项目数据 */}
          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h4 className="font-semibold mb-2">数据库项目数据调试:</h4>
            <Button 
              onClick={() => {
                import('@/hooks/useProjects').then(({ useProjects }) => {
                  console.log('===== 数据库项目调试 =====');
                });
              }}
              variant="outline"
              size="sm"
            >
              在控制台输出项目数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* localStorage 状态 */}
      <Card>
        <CardHeader>
          <CardTitle>localStorage 状态</CardTitle>
        </CardHeader>
        <CardContent>
          {storageInfo && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                最后更新: {storageInfo.timestamp}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Access Token:</label>
                  <Badge variant={storageInfo.tokens.accessToken ? "default" : "destructive"}>
                    {storageInfo.tokens.accessToken ? "存在" : "不存在"}
                  </Badge>
                  {storageInfo.tokens.accessToken && (
                    <div className="text-xs text-muted-foreground mt-1">
                      长度: {storageInfo.tokens.accessToken.length}
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-semibold">Refresh Token:</label>
                  <Badge variant={storageInfo.tokens.refreshToken ? "default" : "destructive"}>
                    {storageInfo.tokens.refreshToken ? "存在" : "不存在"}
                  </Badge>
                  {storageInfo.tokens.refreshToken && (
                    <div className="text-xs text-muted-foreground mt-1">
                      长度: {storageInfo.tokens.refreshToken.length}
                    </div>
                  )}
                </div>
              </div>

              {storageInfo.authKeys.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">所有认证相关的localStorage项:</h4>
                  <div className="space-y-2">
                    {storageInfo.authKeys.map((item: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <div className="font-mono">{item.key}</div>
                        <div className="text-muted-foreground">
                          长度: {item.valueLength} | 有值: {item.hasValue ? "是" : "否"}
                        </div>
                        {item.hasValue && (
                          <div className="text-xs text-muted-foreground mt-1 break-all">
                            值: {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 调试操作 */}
      <Card>
        <CardHeader>
          <CardTitle>调试操作</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Button onClick={handleDebugAuth} variant="outline">
            输出调试信息到控制台
          </Button>
          <Button onClick={handleClearAuth} variant="destructive">
            清除所有认证数据
          </Button>
          <Button onClick={handleSetTestTokens} variant="secondary">
            设置测试Token
          </Button>
          {user && (
            <Button onClick={signOut} variant="outline">
              退出登录
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 实时状态监控 */}
      <Card>
        <CardHeader>
          <CardTitle>认证流程状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${!loading ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>初始化完成: {!loading ? "是" : "否"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${storageInfo?.tokens.accessToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>localStorage有Access Token: {storageInfo?.tokens.accessToken ? "是" : "否"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${token ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Context有Token: {token ? "是" : "否"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Context有User: {user ? "是" : "否"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}