import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { engineerService, Engineer } from '@/services/engineerService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EngineerItem {
  id: string;
  name: string;
  skills: string[];
  japaneseLevel?: string;
  experience: string;
  availability?: string;
  status: string[];
  nationality?: string;
  age?: string;
  gender?: string;
  companyType: string;
  companyName?: string;
}

interface EngineerSelectionDialogProps {
  onSelect: (selectedEngineer: EngineerItem) => void;
}

export function EngineerSelectionDialog({ onSelect }: EngineerSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredEngineers, setFilteredEngineers] = useState<EngineerItem[]>([]);
  const { currentTenant } = useAuth();

  // 加载工程师数据
  useEffect(() => {
    if (open) {
      loadEngineers();
    }
  }, [open]);

  // 当搜索或过滤条件改变时更新过滤结果
  useEffect(() => {
    filterEngineers();
  }, [engineers, searchQuery, companyTypeFilter, statusFilter]);

  const loadEngineers = async () => {
    if (!currentTenant?.id) {
      console.error('テナントIDが見つかりません');
      toast("エラー", {
        description: "テナント情報が見つかりません",
        style: { backgroundColor: 'hsl(var(--destructive))' },
      });
      return;
    }

    setLoading(true);
    try {
      const engineerData = await engineerService.getActiveEngineers(currentTenant.id);
      setEngineers(engineerData);
    } catch (error) {
      console.error('エンジニアデータの読み込みに失敗しました:', error);
      toast("エラー", {
        description: "エンジニアデータの読み込みに失敗しました",
        style: { backgroundColor: 'hsl(var(--destructive))' },
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEngineers = () => {
    const converted: EngineerItem[] = engineers.map(engineer => ({
      id: engineer.id,
      name: engineer.name,
      skills: engineer.skills || [],
      japaneseLevel: engineer.japanese_level,
      experience: engineer.experience,
      availability: engineer.availability,
      status: [engineer.current_status],
      nationality: engineer.nationality,
      age: engineer.age,
      gender: engineer.gender,
      companyType: engineer.company_type,
      companyName: engineer.company_name
    }));

    const filtered = converted.filter(engineerItem => {
      const matchesSearch = !searchQuery || 
        engineerItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        engineerItem.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (engineerItem.companyName && engineerItem.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCompanyType = companyTypeFilter === "all" || 
        engineerItem.companyType === companyTypeFilter;

      const matchesStatus = statusFilter === "all" || 
        engineerItem.status.includes(statusFilter);
      
      return matchesSearch && matchesCompanyType && matchesStatus;
    });

    setFilteredEngineers(filtered);
  };

  // Handle engineer selection and close dialog
  const handleSelect = (engineerItem: EngineerItem) => {
    onSelect(engineerItem);
    setOpen(false); // Close dialog after selection
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full japanese-text">
          <Users className="mr-2 h-4 w-4" />
          既存人材から選択
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="japanese-text">既存人材から選択</DialogTitle>
          <DialogDescription className="japanese-text">
            マッチングに使用する人材を選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center border rounded-md border-input hover:border-primary/60 transition-colors bg-background px-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                placeholder="氏名、スキル、会社名を検索" 
                className="japanese-text border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-type" className="japanese-text mb-2 block">所属会社</Label>
                <Select 
                  value={companyTypeFilter} 
                  onValueChange={setCompanyTypeFilter}
                >
                  <SelectTrigger id="company-type" className="w-full japanese-text">
                    <SelectValue placeholder="所属会社を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="japanese-text">全て</SelectItem>
                    <SelectItem value="自社" className="japanese-text">自社</SelectItem>
                    <SelectItem value="他社" className="japanese-text">他社</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter" className="japanese-text mb-2 block">ステータス</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter" className="w-full japanese-text">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="japanese-text">全て</SelectItem>
                    <SelectItem value="available" className="japanese-text">稼働可能</SelectItem>
                    <SelectItem value="busy" className="japanese-text">稼働中</SelectItem>
                    <SelectItem value="inactive" className="japanese-text">休止中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">氏名</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">経験</TableHead>
                <TableHead className="japanese-text">日本語</TableHead>
                <TableHead className="japanese-text">所属</TableHead>
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      <span className="japanese-text">人材データを読み込み中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEngineers.map((engineerItem) => (
                <TableRow key={engineerItem.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell className="font-medium japanese-text">{engineerItem.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {engineerItem.skills?.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(engineerItem.skills?.length || 0) > 2 && (
                        <Badge variant="outline" className="bg-gray-100 text-xs">
                          +{(engineerItem.skills?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="japanese-text">{engineerItem.experience}</TableCell>
                  <TableCell className="japanese-text">{engineerItem.japaneseLevel || '未設定'}</TableCell>
                  <TableCell className="japanese-text">{engineerItem.companyType || '未設定'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSelect(engineerItem)} 
                      className="japanese-text"
                    >
                      選択
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredEngineers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="text-muted-foreground japanese-text">
                      該当する人材がありません
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}