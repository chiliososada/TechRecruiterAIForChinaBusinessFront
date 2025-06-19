
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Mail, File } from 'lucide-react';

export function BatchMatchingTab1() {
  const [filterStartDate, setFilterStartDate] = useState<string>('即日');
  const [filterSkills, setFilterSkills] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterRate, setFilterRate] = useState<string>('');
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [showCandidates, setShowCandidates] = useState<boolean>(false);

  // Sample data for demonstration
  const matchingResults = [
    {
      id: 1,
      caseName: 'XX証券向けシステム開発',
      companyName: '株式会社A',
      candidateCount: 5,
      topCandidates: ['山田太郎', '佐藤一郎', '鈴木次郎']
    },
    {
      id: 2,
      caseName: '物流管理システム構築',
      companyName: '株式会社B',
      candidateCount: 3,
      topCandidates: ['高橋三郎', '田中四郎', '伊藤五郎']
    },
    {
      id: 3,
      caseName: 'ECサイトリニューアル',
      companyName: '株式会社C',
      candidateCount: 7,
      topCandidates: ['渡辺六郎', '小林七郎', '加藤八郎']
    }
  ];

  // Sample candidates details for modal
  const candidatesDetails = [
    {
      id: 1,
      name: '山田太郎',
      skills: 'Java, AWS, Spring Boot',
      experience: '10年',
      matchScore: 92,
    },
    {
      id: 2,
      name: '佐藤一郎',
      skills: 'Java, React, AWS',
      experience: '8年',
      matchScore: 87,
    },
    {
      id: 3,
      name: '鈴木次郎',
      skills: 'AWS, Docker, Kubernetes',
      experience: '5年',
      matchScore: 83,
    },
    {
      id: 4,
      name: '高橋三郎',
      skills: 'Java, Spring, Oracle',
      experience: '7年',
      matchScore: 78,
    },
    {
      id: 5,
      name: '田中四郎',
      skills: 'AWS, Terraform, Python',
      experience: '6年',
      matchScore: 75,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">案件開始時期</label>
            <Input 
              placeholder="例：即日、翌月以降" 
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">必須スキル</label>
            <Input 
              placeholder="例：Java, AWS, React" 
              value={filterSkills}
              onChange={(e) => setFilterSkills(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">勤務地</label>
            <Input 
              placeholder="例：東京都、フルリモート" 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">案件タイプ</label>
            <Input 
              placeholder="例：開発、運用、インフラ" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium japanese-text">単価帯</label>
            <Input 
              placeholder="例：60-80万/月" 
              value={filterRate}
              onChange={(e) => setFilterRate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSearch} className="japanese-text">
            案件に合う技術者を検索
          </Button>
        </div>
      </div>

      {/* Results Area */}
      {isSearched && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">案件名</TableHead>
                <TableHead className="japanese-text">会社名</TableHead>
                <TableHead className="japanese-text">技術者数</TableHead>
                <TableHead className="japanese-text">候補者（上位3人）</TableHead>
                <TableHead className="japanese-text">詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchingResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.caseName}</TableCell>
                  <TableCell>{result.companyName}</TableCell>
                  <TableCell>{result.candidateCount}名</TableCell>
                  <TableCell>{result.topCandidates.join('、')}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="japanese-text"
                      onClick={() => setShowCandidates(true)}
                    >
                      候補者一覧を見る
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Candidates Dialog */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="japanese-text">候補者一覧 - XX証券向けシステム開発</DialogTitle>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">名前</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">経験</TableHead>
                <TableHead className="japanese-text">マッチ率</TableHead>
                <TableHead className="japanese-text">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesDetails.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.skills}</TableCell>
                  <TableCell>{candidate.experience}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${candidate.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{candidate.matchScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" title="メールを送信">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" title="履歴書を見る">
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
              選択した候補者に一括メール送信
            </Button>
            <Button variant="outline" className="japanese-text">
              <File className="mr-2 h-4 w-4" />
              選択した候補者のPDF出力
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
