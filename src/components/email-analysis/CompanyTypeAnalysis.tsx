import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, BarChart2, PieChart } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart as RechartsChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, generatePaginationRange } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';

// 示例数据
const companyData = [
  {
    id: 1,
    name: 'テクノソリューション株式会社',
    type: 'cases',
    totalEmails: 45,
    caseEmails: 42,
    engineerEmails: 3,
    lastEmailDate: '2025-05-12T10:30:00',
    caseRatio: 93.3
  },
  {
    id: 2,
    name: 'エンジニアマッチング株式会社',
    type: 'engineers',
    totalEmails: 38,
    caseEmails: 2,
    engineerEmails: 36,
    lastEmailDate: '2025-05-11T14:25:00',
    caseRatio: 5.3
  },
  {
    id: 3,
    name: 'ITサポート株式会社',
    type: 'mixed',
    totalEmails: 57,
    caseEmails: 25,
    engineerEmails: 32,
    lastEmailDate: '2025-05-10T09:15:00',
    caseRatio: 43.9
  },
  {
    id: 4,
    name: 'クラウドテック株式会社',
    type: 'cases',
    totalEmails: 29,
    caseEmails: 27,
    engineerEmails: 2,
    lastEmailDate: '2025-05-09T16:40:00',
    caseRatio: 93.1
  },
  {
    id: 5,
    name: 'タレントフォース株式会社',
    type: 'engineers',
    totalEmails: 41,
    caseEmails: 3,
    engineerEmails: 38,
    lastEmailDate: '2025-05-08T11:50:00',
    caseRatio: 7.3
  },
  {
    id: 6,
    name: 'デジタルイノベーション株式会社',
    type: 'mixed',
    totalEmails: 33,
    caseEmails: 15,
    engineerEmails: 18,
    lastEmailDate: '2025-05-07T13:20:00',
    caseRatio: 45.5
  }
];

// 会社类型翻译
const companyTypeTranslation: Record<string, string> = {
  'cases': '案件系',
  'engineers': '技術者系',
  'mixed': '混合型'
};

// 会社类型对应的颜色
const companyTypeColors: Record<string, string> = {
  'cases': 'bg-blue-100 text-blue-800',
  'engineers': 'bg-green-100 text-green-800',
  'mixed': 'bg-purple-100 text-purple-800'
};

// 图表数据
const chartData = [
  { name: '案件系企業', value: 2, color: '#3b82f6' },
  { name: '技術者系企業', value: 2, color: '#22c55e' },
  { name: '混合型企業', value: 2, color: '#a855f7' }
];

export function CompanyTypeAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // フィルター処理
  const filteredData = companyData.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || company.type === typeFilter;
    const matchesDateRange = true; // 日付のフィルターは実装が複雑なので、ここでは簡略化

    return matchesSearch && matchesType && matchesDateRange;
  });

  // ページネーションのデータを計算
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // フィルターのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">企業タイプ分析</CardTitle>
          <CardDescription className="japanese-text">
            AIによって分類された企業のタイプ分析（案件系/技術者系/混合型）
          </CardDescription>

          {/* フィルターセクション */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="会社名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 japanese-text"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="japanese-text">
                  <SelectValue placeholder="企業タイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="japanese-text">すべて</SelectItem>
                  <SelectItem value="cases" className="japanese-text">案件系</SelectItem>
                  <SelectItem value="engineers" className="japanese-text">技術者系</SelectItem>
                  <SelectItem value="mixed" className="japanese-text">混合型</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative flex-1">
                <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="開始日"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                />
              </div>
              <span className="text-center">〜</span>
              <div className="relative flex-1">
                <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="終了日"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="japanese-text"
              >
                <Filter className="h-4 w-4 mr-1" />
                リセット
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium japanese-text">
                  <div className="flex items-center">
                    <PieChart className="h-4 w-4 mr-2 text-blue-600" />
                    企業タイプ分布
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium japanese-text">
                  <div className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-green-600" />
                    メールタイプ分布
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium japanese-text">案件系メール</span>
                    <span className="text-sm font-medium">{companyData.reduce((sum, company) => sum + company.caseEmails, 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '55%' }} />
                  </div>

                  <div className="flex items-center justify-between mb-2 mt-4">
                    <span className="text-sm font-medium japanese-text">技術者系メール</span>
                    <span className="text-sm font-medium">{companyData.reduce((sum, company) => sum + company.engineerEmails, 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }} />
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-sm text-muted-foreground japanese-text">総メール数: {companyData.reduce((sum, company) => sum + company.totalEmails, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium japanese-text">
                  <div className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-purple-600" />
                    統計サマリー
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex flex-col justify-center space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-500 mb-1 japanese-text">企業数</p>
                      <p className="text-xl font-bold">{companyData.length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-xs text-green-500 mb-1 japanese-text">総メール数</p>
                      <p className="text-xl font-bold">{companyData.reduce((sum, company) => sum + company.totalEmails, 0)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-500 mb-1 japanese-text">案件系企業</p>
                      <p className="text-lg font-bold">{companyData.filter(c => c.type === 'cases').length}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-xs text-green-500 mb-1 japanese-text">技術者系企業</p>
                      <p className="text-lg font-bold">{companyData.filter(c => c.type === 'engineers').length}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-md">
                      <p className="text-xs text-purple-500 mb-1 japanese-text">混合型企業</p>
                      <p className="text-lg font-bold">{companyData.filter(c => c.type === 'mixed').length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="japanese-text">会社名</TableHead>
                  <TableHead className="japanese-text">タイプ</TableHead>
                  <TableHead className="japanese-text text-center">総メール数</TableHead>
                  <TableHead className="japanese-text text-center">案件メール</TableHead>
                  <TableHead className="japanese-text text-center">技術者メール</TableHead>
                  <TableHead className="japanese-text text-center">案件比率</TableHead>
                  <TableHead className="japanese-text">最近のメール</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium japanese-text">{company.name}</TableCell>
                    <TableCell>
                      <Badge className={companyTypeColors[company.type]}>
                        {companyTypeTranslation[company.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{company.totalEmails}</TableCell>
                    <TableCell className="text-center">{company.caseEmails}</TableCell>
                    <TableCell className="text-center">{company.engineerEmails}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              company.type === 'cases' ? 'bg-blue-600' : 
                              company.type === 'engineers' ? 'bg-green-600' : 'bg-purple-600'
                            }`} 
                            style={{ width: `${company.caseRatio}%` }}
                          />
                        </div>
                        <span className="text-xs">{company.caseRatio}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(company.lastEmailDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 japanese-text">
                      該当する企業がありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(Number(page))}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
