import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, ArrowRight, Mail, BarChart3, PieChart, Activity, TrendingUp, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useEngineers } from '@/hooks/useEngineers';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChartContainer, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as ReChartPieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { toast } = useToast();
  const { currentTenant, loading: authLoading } = useAuth();
  
  // データベースから実データを取得
  const { projects, loading: projectsLoading } = useProjects();
  const { engineers: ownEngineers, loading: ownEngineersLoading, error: ownEngineersError } = useEngineers('own');
  const { engineers: otherEngineers, loading: otherEngineersLoading, error: otherEngineersError } = useEngineers('other');
  
  // 全エンジニアを結合
  const allEngineers = [...ownEngineers, ...otherEngineers];
  
  // ローディング状態
  const isLoading = authLoading || projectsLoading || ownEngineersLoading || otherEngineersLoading;
  
  // エラー状態
  const hasError = ownEngineersError || otherEngineersError;
  
  // 展示欢迎消息
  useEffect(() => {
    if (!isLoading && !hasError) {
      toast({
        title: "ダッシュボードへようこそ",
        description: "最新の案件と候補者のデータをご確認いただけます。",
      });
    }
  }, [isLoading, hasError, toast]);

  // 実際の案件データを変換
  const recentCases = projects.slice(0, 6).map(project => {
    const createdAt = new Date(project.created_at);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: project.id,
      title: project.title,
      company: project.client_company || '未設定',
      location: project.location || '未設定',
      postedAt: createdAt.toLocaleDateString('ja-JP'),
      source: project.source === 'manual_entry' ? 'manual' : 'mail',
      daysAgo
    };
  });

  // 実際の候補者データを変換
  const recentCandidates = allEngineers.slice(0, 5).map(engineer => {
    const updatedAt = new Date(engineer.updated_at);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: engineer.id,
      name: engineer.name,
      skills: Array.isArray(engineer.skills) ? engineer.skills.join(', ') : engineer.skills || '未設定',
      experience: engineer.experience || '未設定',
      lastUpdated: updatedAt.toLocaleDateString('ja-JP'),
      daysAgo
    };
  });

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

  // 実データに基づく統計計算
  const totalProjects = projects.length;
  const totalEngineers = allEngineers.length;
  const ownEngineersCount = ownEngineers.length;
  const otherEngineersCount = otherEngineers.length;
  
  // 案件のステータス別統計
  const activeProjects = projects.filter(p => p.status === '募集中').length;
  const completedProjects = projects.filter(p => p.status === '完了').length;
  
  // 最近の活動統計
  const recentProjectsCount = recentCases.filter(c => c.daysAgo <= 7).length;
  const recentEngineersCount = recentCandidates.filter(c => c.daysAgo <= 7).length;
  
  // 実際のデータに基づく年間月別統計を計算
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based (0=1月, 11=12月)
  
  const getMonthlyData = () => {
    const monthlyStats = Array.from({ length: 12 }, (_, index) => {
      const monthName = `${index + 1}月`;
      
      // 該当月のプロジェクト数を計算
      const monthProjects = projects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate.getFullYear() === currentYear && projectDate.getMonth() === index;
      }).length;
      
      // 該当月のエンジニア数を計算  
      const monthEngineers = allEngineers.filter(engineer => {
        const engineerDate = new Date(engineer.created_at);
        return engineerDate.getFullYear() === currentYear && engineerDate.getMonth() === index;
      }).length;
      
      return {
        month: monthName,
        projects: monthProjects,
        engineers: monthEngineers
      };
    });
    
    return monthlyStats;
  };
  
  const chartData = getMonthlyData();
  
  const pieData = [
    { name: '自社エンジニア', value: ownEngineersCount, color: '#0088FE' },
    { name: '他社エンジニア', value: otherEngineersCount, color: '#00C49F' },
  ];

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

  // 実データに基づく年間案件趋势を計算
  const getMonthlyProjectData = () => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthName = `${index + 1}月`;
      
      // 該当月の案件数を計算
      const monthProjectCount = projects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate.getFullYear() === currentYear && projectDate.getMonth() === index;
      }).length;
      
      return {
        name: monthName,
        案件数: monthProjectCount
      };
    });
  };
  
  const monthlyData = getMonthlyProjectData();

  // 実データから技術スキル分布を計算
  const skillCounts = new Map();
  allEngineers.forEach(engineer => {
    const skills = Array.isArray(engineer.skills) ? engineer.skills : [];
    skills.forEach(skill => {
      const trimmedSkill = skill.trim();
      if (trimmedSkill) {
        skillCounts.set(trimmedSkill, (skillCounts.get(trimmedSkill) || 0) + 1);
      }
    });
  });
  
  const skillsData = Array.from(skillCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // 実データから地域分布を計算
  const locationCounts = new Map();
  projects.forEach(project => {
    const location = project.location || 'その他';
    locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });
  
  const locationData = Array.from(locationCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, 案件数: value }));

  // ローディング表示
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground japanese-text">
              ダッシュボードデータを読み込んでいます...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // エラー表示
  if (hasError) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <p className="text-red-600 japanese-text">データの読み込みでエラーが発生しました</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="japanese-text"
            >
              再読み込み
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-8">
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
            value={totalProjects.toString()}
            description={activeProjects > 0 ? `有効案件: ${activeProjects}件` : '有効案件なし'} 
            icon={<FileText className="h-4 w-4" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatsCard 
            title="現在の有効案件" 
            value={activeProjects.toString()}
            description={completedProjects > 0 ? `完了済み: ${completedProjects}件` : '完了済みなし'} 
            icon={<Activity className="h-4 w-4" />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatsCard 
            title="候補者データベース" 
            value={totalEngineers.toString()}
            description={`自社: ${ownEngineersCount}名 | 他社: ${otherEngineersCount}名`} 
            icon={<Users className="h-4 w-4" />}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
          <StatsCard 
            title="今週の新規" 
            value={`${recentProjectsCount + recentEngineersCount}`}
            description={`案件: ${recentProjectsCount}件 | 候補者: ${recentEngineersCount}名`} 
            icon={<TrendingUp className="h-4 w-4" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
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
