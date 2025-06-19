
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Trash2,
  Info,
  Search as SearchIcon,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, addMonths } from 'date-fns';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { MailCase } from '../email/types';
import { toast } from '@/hooks/toast';
import { DateRange } from 'react-day-picker';
import { useProjects } from '@/hooks/useProjects';

interface CaseArchiveTabProps {
  cases: MailCase[];
  companyType: 'own' | 'other';
  onArchiveSuccess?: () => void; // Add callback prop
}

export const CaseArchiveTab: React.FC<CaseArchiveTabProps> = ({ 
  cases, 
  companyType, 
  onArchiveSuccess 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Show the info tooltip by default
  const [showInfoTooltip, setShowInfoTooltip] = useState(true);
  // Add date range filter state
  const [startDateRange, setStartDateRange] = useState<DateRange | undefined>(undefined);
  
  // 使用useProjects hook来进行实际的归档操作
  const { archiveProject } = useProjects();
  
  // Reset selection when filter changes
  useEffect(() => {
    setSelectedCases([]);
  }, [searchTerm, statusFilter, startDateRange]);

  // Get the reference date - current month
  const getCurrentReferenceDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };
  
  // Format date for display (YYYY年MM月)
  const formatDateForDisplay = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  };
  
  // Get the current reference date
  const referenceDate = getCurrentReferenceDate();
  
  // Check if case is considered "期限切れ" (expired)
  // "期限切れ" means the start date is before the current month
  const isExpired = (item: MailCase) => {
    const currentMonthStart = getCurrentReferenceDate();
    
    if (item.startDate) {
      const startDate = new Date(item.startDate);
      if (startDate < currentMonthStart) {
        // For the purpose of visually marking it as expired
        return true;
      }
    }
    
    return false;
  };
  
  // Filter cases based on user filters (removing company type filtering since cases are already pre-filtered)
  const filteredCases = cases.filter(item => {
    console.log('=== CaseArchiveTab Filter Debug ===');
    console.log('Company type prop:', companyType);
    console.log('Item title:', item.title);
    console.log('Item company:', item.company);
    
    // Remove company type filtering since cases are already filtered by companyType in the parent component
    // The cases passed to this component are already filtered by company type
    
    // Search term filter (search in title and company)
    const matchesSearch = searchTerm === '' || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.company && item.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter - only "募集中" and "募集終了" are valid statuses
    let matchesStatus = true;
    if (statusFilter === "active") {
      // Show only active cases (募集中)
      matchesStatus = item.status === '募集中';
    } else if (statusFilter !== "all") {
      // Filter by specific status
      matchesStatus = item.status === statusFilter;
    }
    
    // Date range filter for start date
    let matchesDateRange = true;
    if (startDateRange && startDateRange.from) {
      if (!item.startDate) {
        matchesDateRange = false;
      } else {
        const itemStartDate = new Date(item.startDate);
        const fromDate = startDateRange.from;
        
        // If we have both from and to dates, check if item's date is within the range
        if (startDateRange.to) {
          matchesDateRange = itemStartDate >= fromDate && itemStartDate <= startDateRange.to;
        } else {
          // If we only have from date, check if item's date is after or equal to it
          matchesDateRange = itemStartDate >= fromDate;
        }
      }
    }
    
    const finalResult = matchesSearch && matchesStatus && matchesDateRange;
    console.log('Filter result for', item.title, ':', finalResult);
    
    return finalResult;
  });
  
  console.log('=== CaseArchiveTab Final Results ===');
  console.log('Input cases:', cases.length);
  console.log('Filtered cases:', filteredCases.length);
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([]); // Deselect all
    } else {
      setSelectedCases(filteredCases.map(item => item.id)); // Select all
    }
  };
  
  // Handle single selection
  const handleSelectCase = (id: string) => {
    if (selectedCases.includes(id)) {
      setSelectedCases(selectedCases.filter(caseId => caseId !== id));
    } else {
      setSelectedCases([...selectedCases, id]);
    }
  };
  
  // Handle delete selected
  const handleDeleteSelected = async () => {
    try {
      // 批量归档选中的案件
      const archivePromises = selectedCases.map(async (caseId) => {
        const success = await archiveProject(caseId, '案件アーカイブ管理より手動削除');
        return { caseId, success };
      });
      
      const results = await Promise.all(archivePromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast({
          title: "アーカイブ完了",
          description: `${successCount}件の案件をアーカイブしました${failCount > 0 ? `（${failCount}件失敗）` : ''}`,
          variant: "default",
        });
      }
      
      if (failCount > 0) {
        toast({
          title: "一部エラー",
          description: `${failCount}件の案件のアーカイブに失敗しました`,
          variant: "destructive",
        });
      }
      
      // Reset selected cases
      setSelectedCases([]);
      setConfirmDelete(false);
      
      // Trigger data refresh in parent component
      if (onArchiveSuccess) {
        onArchiveSuccess();
      }
    } catch (error) {
      console.error('Archive error:', error);
      toast({
        title: "エラー",
        description: "案件のアーカイブに失敗しました",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="japanese-text flex items-center">
          <Trash2 className="h-5 w-5 mr-2 text-muted-foreground" />
          案件アーカイブ管理
        </CardTitle>
        <CardDescription className="japanese-text">
          古い案件や完了した案件をアーカイブできます（削除ではなくアーカイブ処理されます）
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Improved Search and Filter Section */}
        <div className="bg-muted/10 p-4 rounded-lg border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="japanese-text font-medium text-base flex items-center">
              <SearchIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
              検索・絞り込み
            </h3>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="h-8 w-8 p-0"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Show the deletion criteria info by default */}
          {showInfoTooltip && (
            <div className="mb-3">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle className="japanese-text font-medium">アーカイブ対象の条件</AlertTitle>
                <AlertDescription className="japanese-text text-sm">
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>参画開始日が{formatDateForDisplay(referenceDate)}より前の案件</li>
                    <li>ステータスが「募集完了」の案件</li>
                  </ul>
                  <p className="mt-2">上記の条件のいずれかを満たす案件がアーカイブ対象として表示されます。</p>
                  <p className="mt-1 text-amber-700">※ 削除ではなくアーカイブ処理が行われ、データはproject_archivesテーブルに保存されます。</p>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="space-y-1.5">
                <Label htmlFor="search" className="text-sm japanese-text">案件名・会社名</Label>
                <div className="relative">
                  <SearchIcon className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input 
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="検索" 
                    className="pl-8 japanese-text"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-sm japanese-text">ステータス</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="japanese-text">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="japanese-text">全て</SelectItem>
                    <SelectItem value="active" className="japanese-text">募集中</SelectItem>
                    <SelectItem value="募集終了" className="japanese-text">募集終了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="space-y-1.5">
                <Label htmlFor="dateRange" className="text-sm japanese-text">参画開始日範囲</Label>
                <DatePickerWithRange 
                  dateRange={startDateRange}
                  onDateRangeChange={setStartDateRange}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Cases Table */}
        <div className="rounded-md border shadow-sm overflow-hidden">
          <div className="bg-white rounded-md overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-muted/10 border-b">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAll" 
                  checked={selectedCases.length > 0 && selectedCases.length === filteredCases.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="japanese-text text-sm cursor-pointer">全て選択</Label>
              </div>
              
              <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={selectedCases.length === 0}
                    className="japanese-text"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    選択した案件をアーカイブ
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="japanese-text">案件アーカイブの確認</AlertDialogTitle>
                    <AlertDialogDescription className="japanese-text">
                      選択した{selectedCases.length}件の案件をアーカイブします。アーカイブされた案件はproject_archivesテーブルに保存され、メイン一覧からは非表示になります。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="japanese-text">キャンセル</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSelected}
                      className="japanese-text"
                    >
                      アーカイブする
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="japanese-text">案件名</TableHead>
                  <TableHead className="japanese-text">会社名</TableHead>
                  <TableHead className="japanese-text">参画開始日</TableHead>
                  <TableHead className="japanese-text">ステータス</TableHead>
                  <TableHead className="japanese-text">作成日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center japanese-text">
                      条件に一致する案件はありません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedCases.includes(item.id)}
                          onCheckedChange={() => handleSelectCase(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium japanese-text">{item.title}</TableCell>
                      <TableCell className="japanese-text">{item.company || "-"}</TableCell>
                      <TableCell className="japanese-text">
                        {item.startDate}
                        {isExpired(item) && (
                          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 border-amber-200">
                            期限切れ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === '募集終了' ? (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            <span className="japanese-text">募集終了</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline"
                                className="bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="japanese-text">募集中</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="japanese-text text-sm text-muted-foreground">
                        {item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
