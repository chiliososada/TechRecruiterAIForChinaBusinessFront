import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  CircleDollarSign, 
  Flag, 
  Users, 
  User, 
  Code, 
  FileText, 
  Clock,
  Languages,
  MessageSquare,
  FileCode
} from 'lucide-react';
import { getDefaultProcesses } from './utils/statusUtils';
import { useProjects, Project } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function StructuredCaseForm() {
  const { createProject, loading } = useProjects();
  const { currentTenant } = useAuth();
  const location = useLocation();

  // Determine company type from route
  const getCompanyType = () => {
    return location.pathname.includes('/company/other') ? '他社' : '自社';
  };

  const [caseData, setCaseData] = useState({
    title: '',
    client_company: '',
    partner_company: '',
    manager_name: '',
    manager_email: '',
    skills: [] as string[],
    experience: '不問',
    location: '',
    work_type: '',
    duration: '',
    budget: '',
    desired_budget: '',
    japanese_level: '不問',
    priority: '中',
    status: '募集中',
    start_date: '',
    foreigner_accepted: false,
    freelancer_accepted: false,
    interview_count: '1',
    processes: [] as string[],
    description: '',
    detail_description: ''
  });

  const handleChange = (field: string, value: any) => {
    setCaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTenant?.id) {
      toast({
        title: "エラー",
        description: "テナント情報が不足しています",
        variant: "destructive",
      });
      return;
    }

    if (!caseData.title.trim()) {
      toast({
        title: "エラー",
        description: "案件タイトルは必須です",
        variant: "destructive",
      });
      return;
    }

    const projectData: Omit<Project, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'created_by'> = {
      title: caseData.title,
      client_company: caseData.client_company || undefined,
      partner_company: caseData.partner_company || undefined,
      manager_name: caseData.manager_name || undefined,
      manager_email: caseData.manager_email || undefined,
      skills: caseData.skills,
      experience: caseData.experience,
      location: caseData.location || undefined,
      work_type: caseData.work_type || undefined,
      duration: caseData.duration || undefined,
      budget: caseData.budget || undefined,
      desired_budget: caseData.desired_budget || undefined,
      japanese_level: caseData.japanese_level,
      priority: caseData.priority,
      status: caseData.status,
      start_date: caseData.start_date || undefined,
      foreigner_accepted: caseData.foreigner_accepted,
      freelancer_accepted: caseData.freelancer_accepted,
      interview_count: caseData.interview_count,
      processes: caseData.processes,
      description: caseData.description || undefined,
      detail_description: caseData.detail_description || undefined,
      company_type: getCompanyType() // Now this should work with the updated type
    };

    const result = await createProject(projectData);
    
    if (result) {
      // Reset form after successful creation
      setCaseData({
        title: '',
        client_company: '',
        partner_company: '',
        manager_name: '',
        manager_email: '',
        skills: [],
        experience: '不問',
        location: '',
        work_type: '',
        duration: '',
        budget: '',
        desired_budget: '',
        japanese_level: '不問',
        priority: '中',
        status: '募集中',
        start_date: '',
        foreigner_accepted: false,
        freelancer_accepted: false,
        interview_count: '1',
        processes: [],
        description: '',
        detail_description: ''
      });
    }
  };

  // Helper function to toggle process selection
  const toggleProcess = (process: string) => {
    const currentProcesses = caseData.processes || [];
    const isSelected = currentProcesses.includes(process);
    
    const newProcesses = isSelected 
      ? currentProcesses.filter(p => p !== process)
      : [...currentProcesses, process];
    
    handleChange('processes', newProcesses);
  };

  const processOptions = getDefaultProcesses();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
        <div className="flex space-x-2">
          <div className="bg-primary/10 p-2 rounded-md mt-1">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <Label htmlFor="title" className="text-sm font-medium mb-1 japanese-text">案件タイトル *</Label>
            <Input 
              id="title" 
              value={caseData.title} 
              onChange={(e) => handleChange('title', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              required
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-primary/10 p-2 rounded-md mt-1">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <Label htmlFor="client_company" className="text-sm font-medium mb-1 japanese-text">クライアント会社名</Label>
            <Input 
              id="client_company" 
              value={caseData.client_company} 
              onChange={(e) => handleChange('client_company', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-cyan-100 p-2 rounded-md mt-1">
            <User className="h-4 w-4 text-cyan-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="manager_name" className="text-sm font-medium mb-1 japanese-text">担当者名</Label>
            <Input 
              id="manager_name" 
              value={caseData.manager_name} 
              onChange={(e) => handleChange('manager_name', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-blue-100 p-2 rounded-md mt-1">
            <Users className="h-4 w-4 text-blue-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="manager_email" className="text-sm font-medium mb-1 japanese-text">担当者メール</Label>
            <Input 
              id="manager_email" 
              type="email"
              value={caseData.manager_email} 
              onChange={(e) => handleChange('manager_email', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-indigo-100 p-2 rounded-md mt-1">
            <Code className="h-4 w-4 text-indigo-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="experience" className="text-sm font-medium mb-1 japanese-text">必要経験</Label>
            <Select value={caseData.experience} onValueChange={(value) => handleChange('experience', value)}>
              <SelectTrigger className="japanese-text border-primary/30 focus:border-primary mt-1">
                <SelectValue placeholder="経験年数を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                <SelectItem value="1年以上" className="japanese-text">1年以上</SelectItem>
                <SelectItem value="3年以上" className="japanese-text">3年以上</SelectItem>
                <SelectItem value="5年以上" className="japanese-text">5年以上</SelectItem>
                <SelectItem value="10年以上" className="japanese-text">10年以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-purple-100 p-2 rounded-md mt-1">
            <Briefcase className="h-4 w-4 text-purple-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="work_type" className="text-sm font-medium mb-1 japanese-text">勤務形態</Label>
            <Input 
              id="work_type" 
              value={caseData.work_type} 
              onChange={(e) => handleChange('work_type', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              placeholder="例：リモート可（週3出社）"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-amber-100 p-2 rounded-md mt-1">
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="duration" className="text-sm font-medium mb-1 japanese-text">期間</Label>
            <Input 
              id="duration" 
              value={caseData.duration} 
              onChange={(e) => handleChange('duration', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              placeholder="例：6ヶ月〜"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-emerald-100 p-2 rounded-md mt-1">
            <Languages className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="japanese_level" className="text-sm font-medium mb-1 japanese-text">日本語レベル</Label>
            <Select value={caseData.japanese_level} onValueChange={(value) => handleChange('japanese_level', value)}>
              <SelectTrigger className="japanese-text border-primary/30 focus:border-primary mt-1">
                <SelectValue placeholder="日本語レベルを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="不問" className="japanese-text">不問</SelectItem>
                <SelectItem value="日常会話レベル" className="japanese-text">日常会話レベル</SelectItem>
                <SelectItem value="ビジネスレベル" className="japanese-text">ビジネスレベル</SelectItem>
                <SelectItem value="ネイティブレベル" className="japanese-text">ネイティブレベル</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-rose-100 p-2 rounded-md mt-1">
            <Flag className="h-4 w-4 text-rose-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="priority" className="text-sm font-medium mb-1 japanese-text">優先度</Label>
            <Select value={caseData.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger className="japanese-text border-primary/30 focus:border-primary mt-1">
                <SelectValue placeholder="優先度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="低" className="japanese-text">低</SelectItem>
                <SelectItem value="中" className="japanese-text">中</SelectItem>
                <SelectItem value="高" className="japanese-text">高</SelectItem>
                <SelectItem value="緊急" className="japanese-text">緊急</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-green-100 p-2 rounded-md mt-1">
            <MapPin className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="location" className="text-sm font-medium mb-1 japanese-text">勤務地</Label>
            <Input 
              id="location" 
              value={caseData.location} 
              onChange={(e) => handleChange('location', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              placeholder="例：東京都"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-blue-100 p-2 rounded-md mt-1">
            <Calendar className="h-4 w-4 text-blue-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="start_date" className="text-sm font-medium mb-1 japanese-text">参画開始日</Label>
            <Input 
              id="start_date" 
              type="date"
              value={caseData.start_date} 
              onChange={(e) => handleChange('start_date', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-amber-100 p-2 rounded-md mt-1">
            <MessageSquare className="h-4 w-4 text-amber-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="interview_count" className="text-sm font-medium mb-1 japanese-text">面談回数</Label>
            <Input 
              id="interview_count"
              type="number"
              min="1" 
              value={caseData.interview_count} 
              onChange={(e) => handleChange('interview_count', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-green-100 p-2 rounded-md mt-1">
            <CircleDollarSign className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="budget" className="text-sm font-medium mb-1 japanese-text">単価</Label>
            <Input 
              id="budget" 
              value={caseData.budget} 
              onChange={(e) => handleChange('budget', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              placeholder="例：60万円〜80万円"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="bg-purple-100 p-2 rounded-md mt-1">
            <CircleDollarSign className="h-4 w-4 text-purple-700" />
          </div>
          <div className="flex-1">
            <Label htmlFor="desired_budget" className="text-sm font-medium mb-1 japanese-text">希望単価</Label>
            <Input 
              id="desired_budget" 
              value={caseData.desired_budget} 
              onChange={(e) => handleChange('desired_budget', e.target.value)} 
              className="japanese-text border-primary/30 focus:border-primary mt-1"
              placeholder="例：65万円〜"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className={`${caseData.foreigner_accepted ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-md mt-1`}>
            <Users className={`h-4 w-4 ${caseData.foreigner_accepted ? 'text-green-700' : 'text-red-700'}`} />
          </div>
          <div className="flex-1">
            <Label htmlFor="foreigner_accepted" className="text-sm font-medium mb-1 japanese-text">外国人採用</Label>
            <Select 
              value={caseData.foreigner_accepted ? "true" : "false"}
              onValueChange={(value) => handleChange('foreigner_accepted', value === "true")}
            >
              <SelectTrigger className="japanese-text border-primary/30 focus:border-primary mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">可能</SelectItem>
                <SelectItem value="false">不可</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className={`${caseData.freelancer_accepted ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-md mt-1`}>
            <User className={`h-4 w-4 ${caseData.freelancer_accepted ? 'text-green-700' : 'text-red-700'}`} />
          </div>
          <div className="flex-1">
            <Label htmlFor="freelancer_accepted" className="text-sm font-medium mb-1 japanese-text">個人事業者</Label>
            <Select 
              value={caseData.freelancer_accepted ? "true" : "false"}
              onValueChange={(value) => handleChange('freelancer_accepted', value === "true")}
            >
              <SelectTrigger className="japanese-text border-primary/30 focus:border-primary mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">可能</SelectItem>
                <SelectItem value="false">不可</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <Code className="h-4 w-4 mr-1 text-indigo-700" />
          <Label htmlFor="skills" className="text-sm font-medium mb-1 japanese-text">スキル要件（カンマ区切り）</Label>
        </div>
        <Input 
          id="skills" 
          value={caseData.skills.join(', ')} 
          onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()).filter(s => s))} 
          className="japanese-text border-primary/30 focus:border-primary mt-1"
          placeholder="例：Java, Spring Boot, SQL"
        />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <FileCode className="h-4 w-4 mr-1 text-purple-600" />
          <Label className="text-sm font-medium mb-1 japanese-text">工程</Label>
        </div>
        <div className="grid grid-cols-2 gap-2 border rounded-md p-3 bg-muted/5 mt-1">
          {processOptions.map((process) => (
            <div key={process} className="flex items-center space-x-2">
              <Checkbox 
                id={`process-${process}`} 
                checked={(caseData.processes || []).includes(process)}
                onCheckedChange={() => toggleProcess(process)}
              />
              <Label htmlFor={`process-${process}`} className="text-sm japanese-text">
                {process}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 mr-1 text-gray-600" />
          <Label htmlFor="description" className="text-sm font-medium mb-1 japanese-text">案件概要</Label>
        </div>
        <Textarea 
          id="description" 
          value={caseData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="japanese-text border-primary/30 focus:border-primary mt-1"
          placeholder="案件の概要を入力してください"
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 mr-1 text-gray-600" />
          <Label htmlFor="detail_description" className="text-sm font-medium mb-1 japanese-text">案件詳細</Label>
        </div>
        <Textarea 
          id="detail_description" 
          value={caseData.detail_description}
          onChange={(e) => handleChange('detail_description', e.target.value)}
          rows={5}
          className="japanese-text border-primary/30 focus:border-primary mt-1"
          placeholder="案件の詳細情報を入力してください"
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit" className="japanese-text" disabled={loading}>
          {loading ? '保存中...' : '案件を保存'}
        </Button>
      </div>
    </form>
  );
}

export default StructuredCaseForm;
