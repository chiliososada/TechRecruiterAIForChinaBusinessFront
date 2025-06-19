import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, ArrowRight, Mail, BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as ReChartPieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { toast } = useToast();
  
  // 展示欢迎消息
  React.useEffect(() => {
    toast({
      title: "ダッシュボードへようこそ",
      description: "最新の案件と候補者のデータをご確認いただけます。",
    });
  }, []);

  // 案件数据
  const recentCases = [
    { id: 1, title: 'Java開発エンジニア', company: '株式会社テクノロジー', location: '東京', postedAt: '2025-05-14', source: 'mail', daysAgo: 0 },
    { id: 2, title: 'フロントエンドエンジニア', company: 'デジタルソリューションズ', location: '大阪', postedAt: '2025-05-13', source: 'manual', daysAgo: 1 },
    { id: 3, title: 'インフラエンジニア', company: 'クラウドシステムズ', location: '名古屋', postedAt: '2025-05-12', source: 'mail', daysAgo: 2 },
    { id: 4, title: 'QAエンジニア', company: 'テストシステム株式会社', location: 'リモート', postedAt: '2025-05-11', source: 'manual', daysAgo: 3 },
    { id: 5, title: 'PHP開発エンジニア', company: 'ウェブシステム株式会社', location: '東京', postedAt: '2025-05-09', source: 'mail', daysAgo: 5 },
    { id: 6, title: 'Python開発者', company: 'AIソリューション', location: '福岡', postedAt: '2025-05-07', source: 'manual', daysAgo: 7 },
  ];

  // 候補者数据
  const recentCandidates = [
    { id: 1, name: '鈴木太郎', skills: 'Java, Spring Boot, AWS', experience: '7年', lastUpdated: '2025-05-14', daysAgo: 0 },
    { id: 2, name: '田中花子', skills: 'React, TypeScript, Node.js', experience: '5年', lastUpdated: '2025-05-12', daysAgo: 2 },
    { id: 3, name: '佐藤一郎', skills: 'Python, Django, Docker', experience: '3年', lastUpdated: '2025-05-11', daysAgo: 3 },
    { id: 4, name: '山田次郎', skills: 'C#, .NET, Azure', experience: '8年', lastUpdated: '2025-05-08', daysAgo: 6 },
    { id: 5, name: '伊藤三郎', skills: 'PHP, Laravel, MySQL', experience: '4年', lastUpdated: '2025-05-07', daysAgo: 7 },
  ];

  // 按时间过滤案件
  const getFilteredCases = (days: number, source?: string) => {
    return recentCases.filter(item => {
      const matchesTimeframe = days === 0 || item.daysAgo <= days;
      const matchesSource = !source || item.source === source;
      return matchesTimeframe && matchesSource;
    });
  };

  // 按时间过滤候选人
  const getFilteredCandidates = (days: number) => {
    return recentCandidates.filter(item => days === 0 || item.daysAgo <= days);
  };

  // 获取特定时间段和来源的案件数据
  const last3DaysMailCases = getFilteredCases(3, 'mail');
  const last3DaysManualCases = getFilteredCases(3, 'manual');
  const lastWeekMailCases = getFilteredCases(7, 'mail');
  const lastWeekManualCases = getFilteredCases(7, 'manual');

  // 获取特定时间段的候选人数据
  const last3DaysCandidates = getFilteredCandidates(3);
  const lastWeekCandidates = getFilteredCandidates(7);

  // 渲染案件列表项
  const renderCaseItems = (items: typeof recentCases) => {
    return items.map((item) => (
      <div key={item.id} className="flex items-center justify-between mb-4 p-3 hover:bg-muted rounded-md transition-colors">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none japanese-text">{item.title}</p>
          <p className="text-sm text-muted-foreground japanese-text">
            {item.company} - {item.location}
          </p>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-2">
            <p className="text-xs text-muted-foreground japanese-text">{item.postedAt}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.source === 'mail' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {item.source === 'mail' ? 'メール' : '手動'}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  // 渲染候选人列表项
  const renderCandidateItems = (items: typeof recentCandidates) => {
    return items.map((candidate) => (
      <div key={candidate.id} className="flex items-center justify-between mb-4 p-3 hover:bg-muted rounded-md transition-colors">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none japanese-text">{candidate.name}</p>
          <p className="text-sm text-muted-foreground truncate japanese-text" style={{ maxWidth: '200px' }}>
            {candidate.skills} - <span className="font-medium">{candidate.experience}</span>
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-xs text-muted-foreground japanese-text">{candidate.lastUpdated}</p>
          <Button variant="ghost" size="icon" className="ml-2 h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ));
  };

  // 图表数据 - 月度案件趋势
  const monthlyData = [
    { name: '1月', 案件数: 4 },
    { name: '2月', 案件数: 6 },
    { name: '3月', 案件数: 8 },
    { name: '4月', 案件数: 7 },
    { name: '5月', 案件数: 12 },
  ];

  // 技能分布图表数据
  const skillsData = [
    { name: 'Java', value: 25 },
    { name: 'JavaScript', value: 20 },
    { name: 'Python', value: 18 },
    { name: 'C#', value: 15 },
    { name: 'PHP', value: 12 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // 地域分布图表数据
  const locationData = [
    { name: '東京', 案件数: 18 },
    { name: '大阪', 案件数: 8 },
    { name: '名古屋', 案件数: 6 },
    { name: '福岡', 案件数: 5 },
    { name: 'その他', 案件数: 5 },
  ];

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight japanese-text">ダッシュボード</h2>
            <p className="text-muted-foreground japanese-text">案件や候補者の最新情報を確認できます。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="japanese-text">
              レポート出力
            </Button>
            <Button variant="default" size="sm" className="japanese-text" onClick={() => {
              toast({
                title: "データを更新しました",
                description: "最新の情報に更新されました。",
              });
            }}>
              更新
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="全案件数" 
            value="42"
            description="先月比 +12%" 
            icon={<FileText className="h-4 w-4" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatsCard 
            title="現在の有効案件" 
            value="18"
            description="先週比 +3" 
            icon={<Activity className="h-4 w-4" />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatsCard 
            title="候補者データベース" 
            value="156"
            description="新規: 今週 +5" 
            icon={<Users className="h-4 w-4" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
          <StatsCard 
            title="マッチング成功率" 
            value="67%"
            description="先月比 +5%" 
            icon={<TrendingUp className="h-4 w-4" />}
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
              <CardTitle className="japanese-text flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                月別案件推移
              </CardTitle>
              <CardDescription className="japanese-text">過去5ヶ月の案件数推移</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="案件数" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-4">
              <CardTitle className="japanese-text flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                技術スキル分布
              </CardTitle>
              <CardDescription className="japanese-text">候補者の主要スキル分布</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Fix the ChartContainer to wrap the content in a single React element */}
              <ChartContainer className="h-80" config={{
                skills: { label: "技術スキル" }
              }}>
                {/* Wrap multiple elements in a fragment to satisfy the type requirement */}
                <>
                  <ReChartPieChart>
                    <Pie
                      data={skillsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {skillsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </ReChartPieChart>
                  <ChartLegend>
                    <ChartLegendContent payload={skillsData.map((item, index) => ({ 
                      value: item.name, 
                      color: COLORS[index % COLORS.length] 
                    }))} />
                  </ChartLegend>
                </>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="japanese-text">最近の案件</CardTitle>
                <CardDescription className="japanese-text">最近追加または更新された案件</CardDescription>
              </div>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="mt-2">
                <TabsList className="mb-4 grid grid-cols-4 mb-4">
                  <TabsTrigger value="all" className="japanese-text text-xs">全て</TabsTrigger>
                  <TabsTrigger value="3days" className="japanese-text text-xs">3日以内</TabsTrigger>
                  <TabsTrigger value="week" className="japanese-text text-xs">1週間以内</TabsTrigger>
                  <TabsTrigger value="location" className="japanese-text text-xs">地域別</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  <div className="space-y-4">
                    {renderCaseItems(recentCases)}
                  </div>
                </TabsContent>
                <TabsContent value="3days" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground japanese-text">メールから取得（3日以内）</h4>
                    {renderCaseItems(last3DaysMailCases)}
                    <h4 className="text-sm font-medium text-muted-foreground japanese-text">手動登録（3日以内）</h4>
                    {renderCaseItems(last3DaysManualCases)}
                  </div>
                </TabsContent>
                <TabsContent value="week" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground japanese-text">メールから取得（1週間以内）</h4>
                    {renderCaseItems(lastWeekMailCases)}
                    <h4 className="text-sm font-medium text-muted-foreground japanese-text">手動登録（1週間以内）</h4>
                    {renderCaseItems(lastWeekManualCases)}
                  </div>
                </TabsContent>
                <TabsContent value="location" className="space-y-4 pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={locationData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="案件数" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
              <Button variant="link" className="mt-4 w-full japanese-text" asChild>
                <a href="/cases">全ての案件を見る</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="japanese-text">最近の候補者</CardTitle>
                <CardDescription className="japanese-text">最近追加または更新された候補者</CardDescription>
              </div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="mt-2">
                <TabsList className="mb-4 grid grid-cols-3">
                  <TabsTrigger value="all" className="japanese-text text-xs">全て</TabsTrigger>
                  <TabsTrigger value="3days" className="japanese-text text-xs">3日以内</TabsTrigger>
                  <TabsTrigger value="week" className="japanese-text text-xs">1週間以内</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {renderCandidateItems(recentCandidates)}
                </TabsContent>
                <TabsContent value="3days" className="space-y-4">
                  {renderCandidateItems(last3DaysCandidates)}
                </TabsContent>
                <TabsContent value="week" className="space-y-4">
                  {renderCandidateItems(lastWeekCandidates)}
                </TabsContent>
              </Tabs>
              <Button variant="link" className="mt-4 w-full japanese-text" asChild>
                <a href="/candidates">全ての候補者を見る</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
