import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { projectService, Project } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  skills?: string[];
  experience?: string;
  budget?: string;
  location?: string;
  workType?: string;
  priority?: string;
  description?: string;
  detailDescription?: string;
  companyType?: string;
}

interface CaseSelectionDialogProps {
  onSelect: (selectedCase: CaseItem) => void;
}

export function CaseSelectionDialog({ onSelect }: CaseSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCases, setFilteredCases] = useState<CaseItem[]>([]);
  const { currentTenant } = useAuth();

  // 加载项目数据
  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  // 当搜索或过滤条件改变时更新过滤结果
  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, companyTypeFilter]);

  const loadProjects = async () => {
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
      const projectData = await projectService.getActiveProjects(currentTenant.id);
      setProjects(projectData);
    } catch (error) {
      console.error('案件データの読み込みに失敗しました:', error);
      toast("エラー", {
        description: "案件データの読み込みに失敗しました",
        style: { backgroundColor: 'hsl(var(--destructive))' },
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    const converted: CaseItem[] = projects.map(project => ({
      id: project.id,
      title: project.title,
      client: project.client_company || project.partner_company || '未設定',
      skills: project.skills || [],
      experience: project.experience,
      budget: project.budget || project.desired_budget,
      location: project.location,
      workType: project.work_type,
      description: project.description,
      detailDescription: project.detail_description,
      companyType: project.company_type,
      priority: project.priority
    }));

    const filtered = converted.filter(caseItem => {
      const matchesSearch = !searchQuery || 
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCompanyType = companyTypeFilter === "all" || 
        caseItem.companyType === companyTypeFilter;
      
      return matchesSearch && matchesCompanyType;
    });

    setFilteredCases(filtered);
  };

  // Handle case selection and close dialog
  const handleSelect = (caseItem: CaseItem) => {
    onSelect(caseItem);
    setOpen(false); // Close dialog after selection
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full japanese-text">
          <FileText className="mr-2 h-4 w-4" />
          既存案件から選択
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="japanese-text">既存案件から選択</DialogTitle>
          <DialogDescription className="japanese-text">
            マッチングに使用する案件を選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center border rounded-md border-input hover:border-primary/60 transition-colors bg-background px-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                placeholder="案件名、会社名、スキルを検索" 
                className="japanese-text border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">案件名</TableHead>
                <TableHead className="japanese-text">クライアント</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">所属</TableHead>
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      <span className="japanese-text">案件データを読み込み中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCases.map((caseItem) => (
                <TableRow key={caseItem.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell className="font-medium japanese-text">{caseItem.title}</TableCell>
                  <TableCell className="japanese-text">{caseItem.client}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {caseItem.skills?.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(caseItem.skills?.length || 0) > 2 && (
                        <Badge variant="outline" className="bg-gray-100 text-xs">
                          +{(caseItem.skills?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="japanese-text">{caseItem.companyType || '未設定'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSelect(caseItem)} 
                      className="japanese-text"
                    >
                      選択
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="text-muted-foreground japanese-text">
                      該当する案件がありません
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
