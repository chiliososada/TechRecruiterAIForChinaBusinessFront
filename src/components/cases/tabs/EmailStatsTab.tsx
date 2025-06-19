
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, BarChart2, Clock, Filter, Search, Calendar, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { MailCase } from '../email/types';
import { Separator } from '@/components/ui/separator';

interface EmailStatsTabProps {
  filteredMailCases: MailCase[];
  paginatedMailCases: MailCase[];
  companyFilter: string;
  setCompanyFilter: (filter: string) => void;
  techKeyword: string;
  setTechKeyword: (keyword: string) => void;
  emailDateFrom: string;
  setEmailDateFrom: (date: string) => void;
  emailDateTo: string;
  setEmailDateTo: (date: string) => void;
  resetDateFilters: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  emailStats: {
    total: number;
    companies: Record<string, number>;
    senders: Record<string, number>;
    dates: Record<string, number>;
  };
  companyList: (string | null)[];
}

export const EmailStatsTab: React.FC<EmailStatsTabProps> = ({
  filteredMailCases,
  paginatedMailCases,
  companyFilter,
  setCompanyFilter,
  techKeyword,
  setTechKeyword,
  emailDateFrom,
  setEmailDateFrom,
  emailDateTo,
  setEmailDateTo,
  resetDateFilters,
  currentPage,
  setCurrentPage,
  totalPages,
  emailStats,
  companyList
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-indigo-500">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-5 w-5 text-indigo-600" />
          <CardTitle className="japanese-text text-xl">メール案件の統計情報</CardTitle>
        </div>
        <CardDescription className="japanese-text">
          メールから取得された案件情報の分析と統計データ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Overview Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="py-4 pb-2">
              <CardTitle className="text-sm font-medium japanese-text flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                メール案件総数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{emailStats.total}</div>
              <p className="text-xs text-muted-foreground mt-2 japanese-text">
                取得された全案件数
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="py-4 pb-2">
              <CardTitle className="text-sm font-medium japanese-text flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-purple-600" />
                企業数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{Object.keys(emailStats.companies).length}</div>
              <p className="text-xs text-muted-foreground mt-2 japanese-text">
                案件を送信した企業の総数
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="py-4 pb-2">
              <CardTitle className="text-sm font-medium japanese-text flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                期間
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{Object.keys(emailStats.dates).length}日</div>
              <p className="text-xs text-muted-foreground mt-2 japanese-text">
                案件が受信された日数
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        {/* Detailed Stats Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium japanese-text flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-500" />
              詳細分析
            </h3>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground japanese-text">
                件数: {filteredMailCases.length}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-auto">
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="japanese-text w-full sm:w-[200px]">
                    <SelectValue placeholder="会社でフィルター" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="japanese-text">すべての会社</SelectItem>
                    {companyList.map((company) => (
                      <SelectItem key={company as string} value={company as string} className="japanese-text">
                        {company as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <div className="relative">
                  <Input
                    placeholder="技術キーワード"
                    value={techKeyword}
                    onChange={(e) => setTechKeyword(e.target.value)}
                    className="japanese-text w-full sm:w-[200px] pl-9"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-2 items-center">
                <div className="relative w-full sm:w-auto">
                  <Input
                    type="date"
                    placeholder="開始日"
                    value={emailDateFrom}
                    onChange={(e) => setEmailDateFrom(e.target.value)}
                    className="w-full sm:w-[140px]"
                  />
                </div>
                <span className="hidden sm:inline">〜</span>
                <div className="relative w-full sm:w-auto">
                  <Input
                    type="date"
                    placeholder="終了日"
                    value={emailDateTo}
                    onChange={(e) => setEmailDateTo(e.target.value)}
                    className="w-full sm:w-[140px]"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetDateFilters}
                  className="japanese-text ml-auto"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  リセット
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-indigo-500 text-white py-4">
                <CardTitle className="text-sm font-medium japanese-text">会社別案件数</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[250px] overflow-auto p-4">
                <ul className="space-y-3">
                  {Object.entries(emailStats.companies)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([company, count]) => (
                    <li key={company} className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm truncate japanese-text max-w-[200px]">{company}</span>
                      <Badge variant="secondary" className="ml-2 bg-indigo-100">{count}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-purple-500 text-white py-4">
                <CardTitle className="text-sm font-medium japanese-text">日付別案件数</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[250px] overflow-auto p-4">
                <ul className="space-y-3">
                  {Object.entries(emailStats.dates)
                    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                    .map(([date, count]) => (
                    <li key={date} className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm japanese-text">{date}</span>
                      <Badge variant="secondary" className="ml-2 bg-purple-100">{count}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Table with Results */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-t-lg">
              <h3 className="text-white font-medium japanese-text">送信者詳細</h3>
            </div>
            <div className="rounded-b-lg border border-t-0 overflow-hidden shadow-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="japanese-text">送信者</TableHead>
                    <TableHead className="japanese-text">担当者名</TableHead>
                    <TableHead className="japanese-text">会社</TableHead>
                    <TableHead className="japanese-text">技術キーワード</TableHead>
                    <TableHead className="japanese-text">受信日時</TableHead>
                    <TableHead className="japanese-text text-right">案件数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMailCases.map((item) => {
                    const senderCount = filteredMailCases.filter(c => c.sender === item.sender).length;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.sender}</TableCell>
                        <TableCell className="japanese-text">{item.senderName || "-"}</TableCell>
                        <TableCell className="japanese-text">{item.company || "-"}</TableCell>
                        <TableCell className="japanese-text">
                          {item.keyTechnologies ? (
                            <div className="flex flex-wrap gap-1">
                              {item.keyTechnologies.split(',').map((tech, index) => (
                                <Badge key={index} variant="outline" className="bg-blue-50">{tech.trim()}</Badge>
                              ))}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="japanese-text">
                          {item.receivedDate ? new Date(item.receivedDate).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-indigo-100 text-indigo-800">{senderCount}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredMailCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 japanese-text">
                        該当する案件がありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
