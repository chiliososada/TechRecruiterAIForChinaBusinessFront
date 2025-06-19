
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, Plus } from 'lucide-react';

export function TenantSelector() {
  const { currentTenant, tenants, profile, switchTenant, createTenant } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantType, setNewTenantType] = useState<'individual' | 'enterprise'>('individual');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleTenantSwitch = (tenantId: string) => {
    switchTenant(tenantId);
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;

    setIsCreating(true);
    const { error } = await createTenant(
      newTenantName,
      newTenantType,
      newTenantType === 'enterprise' ? newTenantDomain : undefined
    );

    if (!error) {
      setIsCreateDialogOpen(false);
      setNewTenantName('');
      setNewTenantDomain('');
      setNewTenantType('individual');
    }

    setIsCreating(false);
  };

  if (tenants.length <= 1) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 japanese-text">
          <Building2 className="h-5 w-5" />
          当前工作空间
        </CardTitle>
        <CardDescription className="japanese-text">
          选择要访问的工作空间
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={currentTenant?.id || ''} onValueChange={handleTenantSwitch}>
              <SelectTrigger>
                <SelectValue placeholder="选择工作空间" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center gap-2">
                      {tenant.type === 'enterprise' ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span>{tenant.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tenant.type === 'enterprise' ? '企业' : '个人'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile?.role && ['owner', 'admin', 'developer'].includes(profile.role) && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="japanese-text">
                  <Plus className="h-4 w-4 mr-2" />
                  创建工作空间
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="japanese-text">创建新工作空间</DialogTitle>
                  <DialogDescription className="japanese-text">
                    创建一个新的工作空间来管理您的项目和团队
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName" className="japanese-text">工作空间名称</Label>
                    <Input
                      id="tenantName"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      placeholder="输入工作空间名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantType" className="japanese-text">类型</Label>
                    <Select value={newTenantType} onValueChange={(value: 'individual' | 'enterprise') => setNewTenantType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">个人</SelectItem>
                        <SelectItem value="enterprise">企业</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTenantType === 'enterprise' && (
                    <div className="space-y-2">
                      <Label htmlFor="tenantDomain" className="japanese-text">企业域名（可选）</Label>
                      <Input
                        id="tenantDomain"
                        value={newTenantDomain}
                        onChange={(e) => setNewTenantDomain(e.target.value)}
                        placeholder="example.com"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTenant}
                    disabled={isCreating || !newTenantName.trim()}
                    className="japanese-text"
                  >
                    {isCreating ? '创建中...' : '创建工作空间'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {currentTenant && (
          <div className="text-sm text-muted-foreground japanese-text">
            当前：{currentTenant.name} ({currentTenant.type === 'enterprise' ? '企业' : '个人'})
          </div>
        )}
      </CardContent>
    </Card>
  );
}
