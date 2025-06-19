import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/integrations/supabase/client'; // 使用认证客户端
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TenantSelector } from '@/components/auth/TenantSelector';
import { InviteUserDialog } from '@/components/auth/InviteUserDialog';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  company: string | null;
}

export default function Profile() {
  const { user, profile, currentTenant, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  async function updateProfile() {
    try {
      setUpdating(true);

      if (!user) {
        toast({
          title: "エラー",
          description: "ユーザーが認証されていません",
          variant: "destructive",
        });
        return;
      }

      console.log('プロファイルを更新中:', user.id);

      // First check if profile exists using authClient
      const { data: existingProfile, error: checkError } = await authClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('プロファイル確認エラー:', checkError);
        toast({
          title: "更新失敗",
          description: `プロファイル確認エラー: ${checkError.message}`,
          variant: "destructive",
        });
        return;
      }

      const updateData = {
        first_name: profileData.first_name || null,
        last_name: profileData.last_name || null,
        avatar_url: profileData.avatar_url || null,
        job_title: profileData.job_title || null,
        company: profileData.company || null,
        tenant_id: currentTenant?.id || null, // 确保设置正确的tenant_id
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingProfile) {
        console.log('既存のプロファイルを更新中');
        // Profile exists, use UPDATE
        result = await authClient
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
      } else {
        console.log('新しいプロファイルを作成中');
        // Profile doesn't exist, use INSERT
        result = await authClient
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email, // 确保email也被设置
            role: user.role || 'member', // 确保role也被设置
            ...updateData,
            created_at: new Date().toISOString()
          });
      }

      if (result.error) {
        console.error('プロファイル更新エラー:', result.error);
        toast({
          title: "更新失敗",
          description: `プロファイル更新エラー: ${result.error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('プロファイル更新成功');
      toast({
        title: "更新成功",
        description: "プロファイルが正常に更新されました",
      });

      // 刷新页面以获取最新数据
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('予期しないプロファイル更新エラー:', error);
      toast({
        title: "更新失敗",
        description: `予期しないエラー: ${error.message || "プロファイルの更新中にエラーが発生しました"}`,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }

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
      <div className="flex-1 space-y-8 p-8 pt-6">
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

          {/* プロファイル編集フォーム */}
          <Card>
            <CardHeader>
              <CardTitle className="japanese-text">プロファイル編集</CardTitle>
              <CardDescription className="japanese-text">
                あなたの個人情報を更新してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="japanese-text">名前</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="japanese-text"
                    placeholder="太郎"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="japanese-text">姓</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="japanese-text"
                    placeholder="田中"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="job_title" className="japanese-text">職種</Label>
                <Input
                  id="job_title"
                  value={profileData.job_title || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="japanese-text"
                  placeholder="ソフトウェアエンジニア"
                />
              </div>

              <div>
                <Label htmlFor="company" className="japanese-text">会社名</Label>
                <Input
                  id="company"
                  value={profileData.company || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  className="japanese-text"
                  placeholder="株式会社サンプル"
                />
              </div>

              <div>
                <Label htmlFor="avatar_url" className="japanese-text">プロファイル画像URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={profileData.avatar_url || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="japanese-text"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateProfile} disabled={updating} className="japanese-text">
                {updating ? '更新中...' : 'プロファイルを更新'}
              </Button>
            </CardFooter>
          </Card>

          {/* ユーザー招待（管理者のみ） */}
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <Card>
              <CardHeader>
                <CardTitle className="japanese-text">ユーザー管理</CardTitle>
                <CardDescription className="japanese-text">
                  新しいユーザーをテナントに招待
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteUserDialog />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}