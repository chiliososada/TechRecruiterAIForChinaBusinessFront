import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TenantSelector } from '@/components/auth/TenantSelector';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getStoredTokens } from '@/utils/auth-api';
import { Key, Loader2 } from 'lucide-react';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  company: string | null;
}

export default function Profile() {
  const { user, profile, currentTenant, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    avatar_url: '',
    job_title: '',
    company: '',
  });
  
  // パスワード変更のstate
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        job_title: profile.job_title || '',
        company: profile.company || '',
      });
      setLoading(false);
    } else if (user) {
      // 如果没有profile但有user，使用基本信息作为fallback
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar_url: user.avatar_url || '',
        job_title: user.job_title || '',
        company: user.company || '',
      });
      setLoading(false);
    }
  }, [profile, user]);

  const getInitials = () => {
    return `${profileData.first_name?.charAt(0) || ''}${profileData.last_name?.charAt(0) || ''}`;
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'developer':
        return 'destructive';
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleDisplayName = (role?: string) => {
    const roleMap = {
      'developer': '開発者',
      'owner': '所有者',
      'admin': '管理者',
      'member': 'メンバー',
      'viewer': '閲覧者',
      'test_user': 'テストユーザー'
    };
    return roleMap[role as keyof typeof roleMap] || '不明';
  };

  // パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "エラー",
        description: "新しいパスワードが一致しません。",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "エラー",
        description: "新しいパスワードは6文字以上で入力してください。",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "エラー",
        description: "新しいパスワードは現在のパスワードと異なる必要があります。",
        variant: "destructive"
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { accessToken } = getStoredTokens();
      
      if (!accessToken) {
        toast({
          title: "エラー",
          description: "認証トークンが見つかりません。再度ログインしてください。",
          variant: "destructive"
        });
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "成功",
          description: "パスワードが正常に変更されました。",
        });
        
        // フォームをリセット
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          title: "エラー",
          description: data.message || "パスワードの変更に失敗しました。",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('パスワード変更エラー:', error);
      toast({
        title: "エラー",
        description: "パスワード変更中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight japanese-text">プロファイル</h2>
          <Button variant="outline" onClick={signOut} className="japanese-text">ログアウト</Button>
        </div>

        <TenantSelector />

        <div className="grid gap-6">
          {/* ユーザー基本情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {profileData.avatar_url ? (
                    <AvatarImage src={profileData.avatar_url} alt="プロファイル画像" />
                  ) : (
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold japanese-text">
                    {profileData.first_name && profileData.last_name
                      ? `${profileData.first_name} ${profileData.last_name}`
                      : profile?.full_name || user?.email || 'ユーザー'
                    }
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(user?.role)} className="japanese-text">
                      {getRoleDisplayName(user?.role)}
                    </Badge>
                    {user?.is_test_account && (
                      <Badge variant="outline" className="japanese-text">テストアカウント</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground japanese-text">
                    {user?.email}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* テナント情報 */}
          {currentTenant && (
            <Card>
              <CardHeader>
                <CardTitle className="japanese-text">現在のテナント</CardTitle>
                <CardDescription className="japanese-text">
                  所属しているテナントの情報
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="japanese-text">テナント名</Label>
                    <p className="text-sm font-medium">{currentTenant.name}</p>
                  </div>
                  <div>
                    <Label className="japanese-text">タイプ</Label>
                    <p className="text-sm">
                      {currentTenant.tenant_type === 'personal' ? '個人' :
                        currentTenant.tenant_type === 'enterprise' ? '企業' :
                          currentTenant.tenant_type}
                    </p>
                  </div>
                  {currentTenant.company_name && (
                    <div>
                      <Label className="japanese-text">会社名</Label>
                      <p className="text-sm">{currentTenant.company_name}</p>
                    </div>
                  )}
                  {currentTenant.domain && (
                    <div>
                      <Label className="japanese-text">ドメイン</Label>
                      <p className="text-sm">{currentTenant.domain}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* パスワード変更セクション */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 japanese-text">
                <Key className="h-5 w-5" />
                パスワード変更
              </CardTitle>
              <CardDescription className="japanese-text">
                アカウントのパスワードを変更します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current-password" className="japanese-text">現在のパスワード</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                    disabled={isChangingPassword}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password" className="japanese-text">新しいパスワード</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                    disabled={isChangingPassword}
                    className="mt-1"
                    placeholder="6文字以上"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password" className="japanese-text">新しいパスワード（確認）</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                    disabled={isChangingPassword}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      変更中...
                    </>
                  ) : (
                    'パスワードを変更'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
}