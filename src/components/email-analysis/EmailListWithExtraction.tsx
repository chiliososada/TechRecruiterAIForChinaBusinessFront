
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, ArrowDown, ArrowUp, Mail, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, generatePaginationRange } from '@/components/ui/pagination';

// サンプルデータ
const emailData = [
  {
    id: 1,
    subject: 'Java開発エンジニアのご紹介',
    sender: 'tanaka@technosolution.co.jp',
    senderName: '田中一郎',
    company: 'テクノソリューション株式会社',
    receivedDate: '2025-05-12T10:30:00',
    emailType: 'case',
    extractionResults: {
      position: 'Java開発エンジニア',
      skills: ['Java', 'Spring Boot', 'SQL'],
      budget: '60~80万円',
      location: '東京（リモート可）',
      startDate: '即日',
      content: `
Java開発エンジニアを募集しております。
スキル：Java, Spring Boot, SQL
単価：60~80万円
場所：東京（リモート可）
開始：即日
ご興味ある方はお返事ください。`
    }
  },
  {
    id: 2,
    subject: 'PHPエンジニア募集のお知らせ',
    sender: 'yamada@websystem.co.jp',
    senderName: '山田三郎',
    company: 'ウェブシステム株式会社',
    receivedDate: '2025-05-11T14:25:00',
    emailType: 'case',
    extractionResults: {
      position: 'PHPエンジニア',
      skills: ['PHP', 'Laravel', 'MySQL'],
      budget: '55~75万円',
      location: '東京',
      startDate: '6月初旬',
      content: `
PHPエンジニアの案件です。
スキル：PHP, Laravel, MySQL
単価：55~75万円
場所：東京
開始：6月初旬`
    }
  },
  {
    id: 3,
    subject: '佐藤太郎様　履歴書送付',
    sender: 'kobayashi@talentagency.co.jp',
    senderName: '小林次郎',
    company: 'タレントエージェンシー株式会社',
    receivedDate: '2025-05-10T09:15:00',
    emailType: 'engineer',
    extractionResults: {
      engineerName: '佐藤太郎',
      skills: ['Java', 'Python', 'AWS'],
      experience: '8年',
      preferredConditions: 'リモートワーク希望、70万円以上',
      content: `
佐藤太郎様の履歴書をお送りします。
スキル：Java, Python, AWS
経験：8年
希望条件：リモートワーク、70万円以上
よろしくお願いいたします。`
    }
  },
  {
    id: 4,
    subject: 'フロントエンドエンジニアの案件紹介',
    sender: 'suzuki@cloudtech.jp',
    senderName: '鈴木四郎',
    company: 'クラウドテック株式会社',
    receivedDate: '2025-05-09T16:40:00',
    emailType: 'case',
    extractionResults: {
      position: 'フロントエンドエンジニア',
      skills: ['React', 'TypeScript', 'Next.js'],
      budget: '65~85万円',
      location: '大阪',
      startDate: '要相談',
      content: `
フロントエンドエンジニアの案件です。
スキル：React, TypeScript, Next.js
単価：65~85万円
場所：大阪
開始：要相談`
    }
  },
  {
    id: 5,
    subject: '鈴木花子様　エンジニア紹介',
    sender: 'watanabe@engineermatch.co.jp',
    senderName: '渡辺五郎',
    company: 'エンジニアマッチング株式会社',
    receivedDate: '2025-05-08T11:50:00',
    emailType: 'engineer',
    extractionResults: {
      engineerName: '鈴木花子',
      skills: ['React', 'Vue.js', 'UI/UXデザイン'],
      experience: '5年',
      preferredConditions: '週3リモート、60万円以上',
      content: `
鈴木花子様をご紹介いたします。
スキル：React, Vue.js, UI/UXデザイン
経験：5年
希望条件：週3リモート、60万円以上
ポートフォリオも充実しております。`
    }
  }
];

// メールタイプによるバッジの色
const emailTypeBadgeColor: Record<string, string> = {
  'case': 'bg-blue-100 text-blue-800',
  'engineer': 'bg-green-100 text-green-800'
};

// メールタイプの翻訳
const emailTypeTranslation: Record<string, string> = {
  'case': '案件',
  'engineer': '技術者'
};

export function EmailListWithExtraction() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<typeof emailData[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  
  const itemsPerPage = 10;

  // フィルター処理
  const filteredEmails = emailData.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      email.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || email.emailType === typeFilter;
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const emailDate = new Date(email.receivedDate).toISOString().split('T')[0];
      if (startDate && emailDate < startDate) {
        matchesDateRange = false;
      }
      if (endDate && emailDate > endDate) {
        matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  // ページネーション用のデータ取得
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);

  // フィルターのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  // メール詳細を表示
  const showEmailDetails = (email: typeof emailData[0]) => {
    setSelectedEmail(email);
    setIsDialogOpen(true);
  };

  // 抽出情報を表示するヘルパー関数
  const renderExtractedInfo = (email: typeof emailData[0]) => {
    if (email.emailType === 'case') {
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{email.extractionResults.position}</span>
          <span className="text-xs text-gray-500">
            {email.extractionResults.budget} | {email.extractionResults.location}
          </span>
        </div>
      );
    } else if (email.emailType === 'engineer') {
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{email.extractionResults.engineerName}</span>
          <span className="text-xs text-gray-500">
            {email.extractionResults.experience} | {email.extractionResults.preferredConditions}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">メール一覧（AI抽出結果）</CardTitle>
          <CardDescription className="japanese-text">
            AIによって抽出された構造化情報を持つメール一覧
          </CardDescription>

          {/* フィルターセクション */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="件名、送信者、会社名で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 japanese-text"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="japanese-text">
                  <SelectValue placeholder="メールタイプ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="japanese-text">すべて</SelectItem>
                  <SelectItem value="case" className="japanese-text">案件</SelectItem>
                  <SelectItem value="engineer" className="japanese-text">技術者</SelectItem>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="japanese-text">タイプ</TableHead>
                  <TableHead className="japanese-text">件名</TableHead>
                  <TableHead className="japanese-text">送信者</TableHead>
                  <TableHead className="japanese-text">会社</TableHead>
                  <TableHead className="japanese-text">受信日時</TableHead>
                  <TableHead className="japanese-text">抽出情報</TableHead>
                  <TableHead className="japanese-text text-right">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmails.map((email) => (
                  <TableRow key={email.id} className="cursor-pointer" onClick={() => showEmailDetails(email)}>
                    <TableCell>
                      <Badge className={emailTypeBadgeColor[email.emailType]}>
                        {emailTypeTranslation[email.emailType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium japanese-text truncate max-w-[200px]">
                      {email.subject}
                    </TableCell>
                    <TableCell className="japanese-text">{email.senderName}</TableCell>
                    <TableCell className="japanese-text">{email.company}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(email.receivedDate).toLocaleString()}
                    </TableCell>
                    <TableCell>{renderExtractedInfo(email)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="japanese-text">
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 japanese-text">
                      該当するメールがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション */}
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(Number(page))}
            />
          </div>
        </CardContent>
      </Card>

      {/* メール詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="japanese-text">{selectedEmail?.subject}</DialogTitle>
            <DialogDescription className="flex items-center space-x-2 pt-2">
              <span className="font-medium">{selectedEmail?.senderName}</span>
              <span className="text-muted-foreground">{selectedEmail?.sender}</span>
              <Badge className="ml-auto">
                {selectedEmail?.company}
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm japanese-text">メール情報</h4>
              <Badge className={selectedEmail?.emailType ? emailTypeBadgeColor[selectedEmail.emailType] : ''}>
                {selectedEmail?.emailType ? emailTypeTranslation[selectedEmail.emailType] : ''}
              </Badge>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium japanese-text">
                  <Mail className="h-4 w-4 inline mr-1" />
                  メール原文
                </h5>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsContentExpanded(!isContentExpanded)}
                  className="text-xs"
                >
                  {isContentExpanded ? (
                    <>
                      <ArrowUp className="h-3 w-3 mr-1" />
                      折りたたむ
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 mr-1" />
                      展開する
                    </>
                  )}
                </Button>
              </div>
              
              {isContentExpanded && selectedEmail && (
                <div className="text-sm whitespace-pre-line p-3 bg-muted rounded-md">
                  {selectedEmail.extractionResults.content}
                </div>
              )}
            </div>

            <div className="rounded-md border p-4">
              <h5 className="text-sm font-medium mb-3 japanese-text">
                <FileText className="h-4 w-4 inline mr-1" />
                AI抽出結果
              </h5>
              
              {selectedEmail?.emailType === 'case' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">ポジション</p>
                    <p className="text-sm japanese-text">{selectedEmail.extractionResults.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">予算</p>
                    <p className="text-sm">{selectedEmail.extractionResults.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">スキル</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEmail.extractionResults.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">勤務地</p>
                    <p className="text-sm japanese-text">{selectedEmail.extractionResults.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">開始時期</p>
                    <p className="text-sm japanese-text">{selectedEmail.extractionResults.startDate}</p>
                  </div>
                </div>
              )}
              
              {selectedEmail?.emailType === 'engineer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">エンジニア名</p>
                    <p className="text-sm japanese-text">{selectedEmail.extractionResults.engineerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">経験年数</p>
                    <p className="text-sm">{selectedEmail.extractionResults.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">スキル</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEmail.extractionResults.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground japanese-text">希望条件</p>
                    <p className="text-sm japanese-text">{selectedEmail.extractionResults.preferredConditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="japanese-text">閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
