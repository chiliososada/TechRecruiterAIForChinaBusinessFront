
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Mail, File } from 'lucide-react';

export function BatchMatchingTab2() {
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterRate, setFilterRate] = useState<string>('');
  const [filterSkills, setFilterSkills] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [showCases, setShowCases] = useState<boolean>(false);

  // Sample data for demonstration
  const technicians = [
    {
      id: 1,
      name: '田中 太郎',
      skills: 'React, TypeScript, AWS',
      matchCount: 3,
    },
    {
      id: 2,
      name: '佐藤 花子',
      skills: 'Java, Spring Boot, Oracle',
      matchCount: 5,
    },
    {
      id: 3,
      name: '鈴木 一郎',
      skills: 'Python, Django, AWS',
      matchCount: 2,
    },
    {
      id: 4,
      name: '高橋 次郎',
      skills: 'PHP, Laravel, MySQL',
      matchCount: 4,
    }
  ];

  // Sample case details for modal
  const caseDetails = [
    {
      id: 1,
      name: 'ECサイト開発案件',
      company: '株式会社A',
      location: '東京（リモート可）',
      skills: 'React, TypeScript, AWS',
      rate: '70万円/月',
      matchScore: 95,
    },
    {
      id: 2,
      name: 'コーポレートサイトリニューアル',
      company: '株式会社B',
      location: '大阪（リモート可）',
      skills: 'React, Next.js, TypeScript',
      rate: '65万円/月',
      matchScore: 87,
    },
    {
      id: 3,
      name: 'クラウド移行プロジェクト',
      company: '株式会社C',
      location: '東京（オンサイト）',
      skills: 'AWS, TypeScript, Terraform',
      rate: '75万円/月',
      matchScore: 78,
    }
  ];

  const handleSearch = () => {
    setIsSearched(true);
  };

  return (
    <div className="space-y-6">
      {/* Filter Area */}
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4 japanese-text">フィルター条件設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">希望勤務地</label>
            <Input 
              placeholder="例：東京都、リモート" 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">希望単価</label>
            <Input 
              placeholder="例：60-80万/月" 
              value={filterRate}
              onChange={(e) => setFilterRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">得意スキル</label>
            <Input 
              placeholder="例：Java, React, AWS" 
              value={filterSkills}
              onChange={(e) => setFilterSkills(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">希望案件タイプ</label>
            <Input 
              placeholder="例：リモート案件、長期案件" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSearch} className="japanese-text">
            技術者に合う案件を検索
          </Button>
        </div>
      </div>

      {/* Results Area */}
      {isSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">技術者名</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">マッチ案件数</TableHead>
                <TableHead className="japanese-text">案件一覧</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell>{tech.skills}</TableCell>
                  <TableCell>{tech.matchCount}件</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="japanese-text"
                      onClick={() => setShowCases(true)}
                    >
                      案件を見る
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Cases Dialog */}
      <Dialog open={showCases} onOpenChange={setShowCases}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="japanese-text">マッチング案件一覧 - 田中 太郎</DialogTitle>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">案件名</TableHead>
                <TableHead className="japanese-text">会社</TableHead>
                <TableHead className="japanese-text">勤務地</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">単価</TableHead>
                <TableHead className="japanese-text">マッチ率</TableHead>
                <TableHead className="japanese-text">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseDetails.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.name}</TableCell>
                  <TableCell>{caseItem.company}</TableCell>
                  <TableCell>{caseItem.location}</TableCell>
                  <TableCell>{caseItem.skills}</TableCell>
                  <TableCell>{caseItem.rate}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${caseItem.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{caseItem.matchScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" title="メールを送信">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="案件詳細を見る">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="提案資料を出力">
                        <File className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2 mt-4">
            <Button className="japanese-text">
              <Mail className="mr-2 h-4 w-4" />
              選択した案件を提案
            </Button>
            <Button variant="outline" className="japanese-text">
              <File className="mr-2 h-4 w-4" />
              選択した案件のPDF出力
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
