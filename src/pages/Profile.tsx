
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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

export function Profile() {
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
      // 如果没有profile但有user，使用auth metadata作为fallback
      const userData = user.user_metadata;
      setProfileData({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        avatar_url: userData?.avatar_url || '',
        job_title: userData?.job_title || '',
        company: userData?.company || '',
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

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
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
        // Profile exists, use UPDATE
        result = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
      } else {
        // Profile doesn't exist, use INSERT
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
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
                    <AvatarImage src={profileData.avatar_url} />
                  ) : null}
                  <AvatarFallback className="text-lg">
                    {`${profileData.first_name?.charAt(0) || ''}${profileData.last_name?.charAt(0) || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <CardTitle className="japanese-text">個人情報</CardTitle>
                    <CardDescription className="japanese-text">
                      プロファイル情報を更新してください
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile?.role === 'developer' ? 'destructive' : profile?.role === 'owner' ? 'default' : profile?.role === 'admin' ? 'secondary' : 'outline'} className="japanese-text">
                      {profile?.role === 'developer' ? '開発者' : profile?.role === 'owner' ? '所有者' : profile?.role === 'admin' ? '管理者' : profile?.role === 'member' ? 'メンバー' : profile?.role === 'viewer' ? '閲覧者' : profile?.role === 'test_user' ? 'テストユーザー' : '不明'}
                    </Badge>
                    {profile?.is_test_account && (
                      <Badge variant="outline" className="japanese-text">テストアカウント</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="japanese-text">姓</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    placeholder="姓"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="japanese-text">名</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    placeholder="名"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="japanese-text">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-sm text-muted-foreground japanese-text">
                  メールアドレスは変更できません
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="job_title" className="japanese-text">職種</Label>
                  <Input
                    id="job_title"
                    value={profileData.job_title || ''}
                    onChange={(e) => setProfileData({...profileData, job_title: e.target.value})}
                    placeholder="採用担当者 / 人事マネージャー"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="japanese-text">会社名</Label>
                  <Input
                    id="company"
                    value={profileData.company || ''}
                    onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    placeholder="会社名"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={updateProfile} 
                disabled={updating} 
                className="japanese-text"
              >
                {updating ? '保存中...' : '変更を保存'}
              </Button>
            </CardFooter>
          </Card>

          {/* 現在のワークスペース情報 */}
          {currentTenant && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="japanese-text">現在のワークスペース</CardTitle>
                    <CardDescription className="japanese-text">
                      ワークスペースの詳細とメンバー管理
                    </CardDescription>
                  </div>
                  {profile?.role && ['owner', 'admin'].includes(profile.role) && (
                    <InviteUserDialog />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="japanese-text">ワークスペース名</Label>
                    <p className="text-sm font-medium">{currentTenant.name}</p>
                  </div>
                  <div>
                    <Label className="japanese-text">タイプ</Label>
                    <p className="text-sm font-medium">
                      {currentTenant.type === 'enterprise' ? '企業' : '個人'}
                    </p>
                  </div>
                  {currentTenant.domain && (
                    <div>
                      <Label className="japanese-text">ドメイン</Label>
                      <p className="text-sm font-medium">{currentTenant.domain}</p>
                    </div>
                  )}
                  <div>
                    <Label className="japanese-text">サブスクリプションプラン</Label>
                    <p className="text-sm font-medium">{currentTenant.subscription_plan || 'Free'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
