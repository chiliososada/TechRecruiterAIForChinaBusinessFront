import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Building, ArrowDown, ArrowUp, Mail, Calendar, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, generatePaginationRange } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';

// 会社データ
const companies = [
  { 
    id: 1, 
    name: 'テクノソリューション株式会社',
    website: 'https://technosolution.co.jp',
    emailDomain: 'technosolution.co.jp',
    totalEmails: 45,
    caseEmails: 42,
    engineerEmails: 3,
    lastEmailDate: '2025-05-12T10:30:00',
    firstEmailDate: '2024-06-10T08:15:00',
    contactPerson: '田中一郎'
  },
  { 
    id: 2, 
    name: 'ウェブシステム株式会社',
    website: 'https://websystem.co.jp',
    emailDomain: 'websystem.co.jp',
    totalEmails: 28,
    caseEmails: 26,
    engineerEmails: 2,
    lastEmailDate: '2025-05-11T14:25:00',
    firstEmailDate: '2024-07-05T11:30:00',
    contactPerson: '山田三郎'
  },
  { 
    id: 3, 
    name: 'タレントエージェンシー株式会社',
    website: 'https://talentagency.co.jp',
    emailDomain: 'talentagency.co.jp',
    totalEmails: 36,
    caseEmails: 2,
    engineerEmails: 34,
    lastEmailDate: '2025-05-10T09:15:00',
    firstEmailDate: '2024-08-12T14:45:00',
    contactPerson: '小林次郎'
  },
  { 
    id: 4, 
    name: 'クラウドテック株式会社',
    website: 'https://cloudtech.jp',
    emailDomain: 'cloudtech.jp',
    totalEmails: 22,
    caseEmails: 20,
    engineerEmails: 2,
    lastEmailDate: '2025-05-09T16:40:00',
    firstEmailDate: '2024-09-18T09:20:00',
    contactPerson: '鈴木四郎'
  },
  { 
    id: 5, 
    name: 'エンジニアマッチング株式会社',
    website: 'https://engineermatch.co.jp',
    emailDomain: 'engineermatch.co.jp',
    totalEmails: 31,
    caseEmails: 3,
    engineerEmails: 28,
    lastEmailDate: '2025-05-08T11:50:00',
    firstEmailDate: '2024-10-25T15:10:00',
    contactPerson: '渡辺五郎'
  }
];

// メールデータ（指定された会社のメール履歴）
const getCompanyEmails = (companyId: number) => {
  // 実際のアプリでは、この関数はAPIから会社のメール履歴を取得します
  const emailsData = [
    {
      id: 1,
      companyId: 1, // テクノソリューション
      subject: 'Java開発エンジニアのご紹介',
      sender: 'tanaka@technosolution.co.jp',
      senderName: '田中一郎',
      receivedDate: '2025-05-12T10:30:00',
      emailType: 'case',
      content: `
Java開発エンジニアを募集しております。
スキル：Java, Spring Boot, SQL
単価：60~80万円
場所：東京（リモート可）
開始：即日
ご興味ある方はお返事ください。`,
      extractionResults: {
        position: 'Java開発エンジニア',
        skills: ['Java', 'Spring Boot', 'SQL'],
        budget: '60~80万円',
        location: '東京（リモート可）',
        startDate: '即日'
      }
    },
    {
      id: 2,
      companyId: 1, // テクノソリューション
      subject: 'Python案件のご案内',
      sender: 'tanaka@technosolution.co.jp',
      senderName: '田中一郎',
      receivedDate: '2025-05-05T13:45:00',
      emailType: 'case',
      content: `
Python開発案件の��内です。
スキル：Python, Django, PostgreSQL
単価：65~75万円
場所：リモート可
開始：6月から
ご検討よろしくお願いします。`,
      extractionResults: {
        position: 'Python開発エンジニア',
        skills: ['Python', 'Django', 'PostgreSQL'],
        budget: '65~75万円',
        location: 'リモート可',
        startDate: '6月から'
      }
    },
    {
      id: 3,
      companyId: 1, // テクノソリューション
      subject: 'インフラエンジニア案件',
      sender: 'suzuki@technosolution.co.jp',
      senderName: '鈴木浩二',
      receivedDate: '2025-04-28T09:20:00',
      emailType: 'case',
      content: `
インフラエンジニア案件です。
スキル：AWS, Docker, Kubernetes
単価：70~90万円
場所：東京
開始：5月中旬
長期案件となります。`,
      extractionResults: {
        position: 'インフラエンジニア',
        skills: ['AWS', 'Docker', 'Kubernetes'],
        budget: '70~90万円',
        location: '東京',
        startDate: '5月中旬'
      }
    },
    {
      id: 4,
      companyId: 1, // テクノソリューション
      subject: 'フロントエンドエンジニア案件',
      sender: 'tanaka@technosolution.co.jp',
      senderName: '田中一郎',
      receivedDate: '2025-04-20T14:10:00',
      emailType: 'case',
      content: `
フロントエンドエンジニアの案件です。
スキル：React, TypeScript, Next.js
単価：65~80万円
場所：東京（リモート可）
開始：5月初旬
よろしくお願いします。`,
      extractionResults: {
        position: 'フロントエンドエンジニア',
        skills: ['React', 'TypeScript', 'Next.js'],
        budget: '65~80万円',
        location: '東京（リモート可）',
        startDate: '5月初旬'
      }
    },
    {
      id: 5,
      companyId: 1, // テクノソリューション
      subject: '佐々木エンジニアのご紹介',
      sender: 'tanaka@technosolution.co.jp',
      senderName: '田中一郎',
      receivedDate: '2025-04-15T11:30:00',
      emailType: 'engineer',
      content: `
佐々木エンジニアのプロフィールをお送りします。
スキル：Java, Spring Boot, Vue.js
経験：7年
希望：リモート可、60万円以上
ご検討よろしくお願いします。`,
      extractionResults: {
        engineerName: '佐々木',
        skills: ['Java', 'Spring Boot', 'Vue.js'],
        experience: '7年',
        preferredConditions: 'リモート可、60万円以上'
      }
    }
  ];
  
  return emailsData.filter(email => email.companyId === companyId);
};

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

export function CompanyEmailHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<typeof companies[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [companyListPage, setCompanyListPage] = useState(1);
  const [companyEmails, setCompanyEmails] = useState<ReturnType<typeof getCompanyEmails>>([]);
  const [selectedEmail, setSelectedEmail] = useState<(typeof companyEmails)[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  
  const itemsPerPage = 10;

  // 会社検索
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.emailDomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ページネーション用の会社リスト
  const paginatedCompanies = filteredCompanies.slice(
    (companyListPage - 1) * itemsPerPage,
    companyListPage * itemsPerPage
  );

  const totalCompanyPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  // 会社選択
  const selectCompany = (company: typeof companies[0]) => {
    setSelectedCompany(company);
    setCompanyEmails(getCompanyEmails(company.id));
    setCurrentPage(1);
  };

  // ページネーション用のメール取得
  const paginatedEmails = companyEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(companyEmails.length / itemsPerPage);

  // メール詳細を表示
  const showEmailDetails = (email: typeof companyEmails[0]) => {
    setSelectedEmail(email);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">会社別のメール履歴</CardTitle>
          <CardDescription className="japanese-text">
            会社ごとのメール履歴とコミュニケーションの分析
          </CardDescription>

          {/* 会社検索 */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="会社名またはメールドメインで検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 japanese-text"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedCompany ? (
            // 会社一覧
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="japanese-text">会社名</TableHead>
                      <TableHead className="japanese-text">ドメイン</TableHead>
                      <TableHead className="japanese-text text-center">総メール数</TableHead>
                      <TableHead className="japanese-text text-center">案件数</TableHead>
                      <TableHead className="japanese-text text-center">技術者数</TableHead>
                      <TableHead className="japanese-text">担当者</TableHead>
                      <TableHead className="japanese-text">最新メール日</TableHead>
                      <TableHead className="japanese-text text-right">詳細</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCompanies.map((company) => (
                      <TableRow key={company.id} className="cursor-pointer" onClick={() => selectCompany(company)}>
                        <TableCell className="font-medium japanese-text">{company.name}</TableCell>
                        <TableCell>{company.emailDomain}</TableCell>
                        <TableCell className="text-center">{company.totalEmails}</TableCell>
                        <TableCell className="text-center">{company.caseEmails}</TableCell>
                        <TableCell className="text-center">{company.engineerEmails}</TableCell>
                        <TableCell className="japanese-text">{company.contactPerson}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(company.lastEmailDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="japanese-text">
                            履歴を見る
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 japanese-text">
                          該当する会社がありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* 会社リストのページネーション */}
              {totalCompanyPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={companyListPage}
                    totalPages={totalCompanyPages}
                    onPageChange={(page) => setCompanyListPage(Number(page))}
                  />
                </div>
              )}
            </>
          ) : (
            // 選択された会社のメール履歴
            <>
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCompany(null)}
                  className="japanese-text mb-4"
                >
                  ← 会社一覧に戻る
                </Button>
                
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium japanese-text flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      {selectedCompany.name}
                    </h3>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {selectedCompany.website}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCompany.emailDomain}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold">{selectedCompany.totalEmails}</div>
                      <div className="text-xs text-muted-foreground japanese-text">総メール数</div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-blue-600">{selectedCompany.caseEmails}</div>
                      <div className="text-xs text-muted-foreground japanese-text">案件メール</div>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-2xl font-bold text-green-600">{selectedCompany.engineerEmails}</div>
                      <div className="text-xs text-muted-foreground japanese-text">技術者メール</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center md:items-end">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">初回: {new Date(selectedCompany.firstEmailDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">最新: {new Date(selectedCompany.lastEmailDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium mb-2 japanese-text">メール履歴</h4>
                
                {companyEmails.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="japanese-text">タイプ</TableHead>
                          <TableHead className="japanese-text">件名</TableHead>
                          <TableHead className="japanese-text">送信者</TableHead>
                          <TableHead className="japanese-text">受信日時</TableHead>
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
                            <TableCell className="font-medium japanese-text truncate max-w-[300px]">
                              {email.subject}
                            </TableCell>
                            <TableCell className="japanese-text">{email.senderName}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(email.receivedDate).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="japanese-text">
                                詳細
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-md japanese-text">
                    メール履歴がありません
                  </div>
                )}
                
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
              </div>
            </>
          )}
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
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm japanese-text">メール詳細</h4>
              <Badge className={selectedEmail?.emailType ? emailTypeBadgeColor[selectedEmail.emailType] : ''}>
                {selectedEmail?.emailType ? emailTypeTranslation[selectedEmail.emailType] : ''}
              </Badge>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium japanese-text">
                  <Mail className="h-4 w-4 inline mr-1" />
                  メール内容
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
                  {selectedEmail.content}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {selectedEmail ? new Date(selectedEmail.receivedDate).toLocaleString() : ''}
                </div>
              </div>
            </div>

            {/* AI抽出結果セクション追加 */}
            {selectedEmail && selectedEmail.extractionResults && (
              <div className="rounded-md border p-4">
                <h5 className="text-sm font-medium mb-3 japanese-text">
                  <FileText className="h-4 w-4 inline mr-1" />
                  AI抽出結果
                </h5>
                
                {selectedEmail.emailType === 'case' && (
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
                
                {selectedEmail.emailType === 'engineer' && (
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
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="japanese-text">閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
