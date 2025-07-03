import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TenantSelector } from '@/components/auth/TenantSelector';

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

        </div>
      </div>
    </MainLayout>
  );
}