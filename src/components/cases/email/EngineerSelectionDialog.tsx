
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { Engineer } from '@/components/candidates/types'; // Use the candidates Engineer type
import { useEngineers } from '@/hooks/useEngineers';
import { transformDatabaseToUIEngineer } from '@/utils/engineerDataTransform';

interface EngineerSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (engineer: Engineer) => void;
}

export function EngineerSelectionDialog({ isOpen, onClose, onSelect }: EngineerSelectionDialogProps) {
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Load real engineers data from database - load all types
  const { engineers: ownEngineers, loading: ownLoading } = useEngineers('own');
  const { engineers: otherEngineers, loading: otherLoading } = useEngineers('other');
  
  // Combine both own and other company engineers
  const allDbEngineers = [...ownEngineers, ...otherEngineers];
  
  // Transform database engineers to UI format
  const allEngineers = allDbEngineers.map(transformDatabaseToUIEngineer);
  
  // Debug logging
  console.log('=== Engineer Selection Dialog ===');
  console.log('Own engineers:', ownEngineers.length);
  console.log('Other engineers:', otherEngineers.length);
  console.log('Total engineers:', allEngineers.length);
  console.log('Sample engineer:', allEngineers[0]);
  
  // Check if data is still loading
  const isLoading = ownLoading || otherLoading;
  
  // Use only real database data - no mock data fallback
  const engineersToFilter = allEngineers;
  const filteredEngineers = engineersToFilter.filter(engineer => {
    // Map database company_type to UI display values
    const engineerCompanyType = engineer.companyType === 'own' ? '自社' : 
                              engineer.companyType === 'other' ? '他社' : 
                              engineer.companyType;
    const matchesCompanyType = companyTypeFilter === "all" || engineerCompanyType === companyTypeFilter;
    
    const matchesSearch = !searchQuery || 
      engineer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (engineer.skills && Array.isArray(engineer.skills) 
        ? engineer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
        : false);
    
    return matchesCompanyType && matchesSearch;
  });

  const handleSelect = (engineer: Engineer) => {
    // Ensure engineer object matches the expected type
    const selectedEngineer: Engineer = {
      id: engineer.id,
      name: engineer.name,
      skills: engineer.skills || [],
      experience: engineer.experience,
      status: engineer.status,
      japaneseLevel: engineer.japaneseLevel,
      availability: engineer.availability,
      remarks: engineer.remarks,
      companyType: engineer.companyType,
      companyName: engineer.companyName,
      source: engineer.source,
      recommendation: engineer.recommendation,
      email: engineer.email,
      phone: engineer.phone,
      nationality: engineer.nationality,
      age: engineer.age,
      gender: engineer.gender,
      nearestStation: engineer.nearestStation,
      education: engineer.education,
      arrivalYear: engineer.arrivalYear,
      certifications: engineer.certifications,
      englishLevel: engineer.englishLevel,
      technicalKeywords: engineer.technicalKeywords,
      selfPromotion: engineer.selfPromotion,
      workScope: engineer.workScope,
      workExperience: engineer.workExperience,
      registeredAt: engineer.registeredAt,
      updatedAt: engineer.updatedAt,
      resumeUrl: engineer.resumeUrl,
      resumeText: engineer.resumeText,
      managerName: engineer.managerName,
      managerEmail: engineer.managerEmail
    };
    onSelect(selectedEngineer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="japanese-text">既存人材から選択</DialogTitle>
          <DialogDescription className="japanese-text">
            メールに記載する技術者を選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <div>
              <Input 
                placeholder="技術者を検索" 
                className="japanese-text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-type" className="japanese-text mb-2 block">所属会社</Label>
              <Select 
                value={companyTypeFilter} 
                onValueChange={setCompanyTypeFilter}
              >
                <SelectTrigger id="company-type" className="w-full japanese-text">
                  <SelectValue placeholder="所属会社を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="japanese-text">全て</SelectItem>
                  <SelectItem value="自社" className="japanese-text">自社</SelectItem>
                  <SelectItem value="他社" className="japanese-text">他社</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">氏名</TableHead>
                <TableHead className="japanese-text">スキル</TableHead>
                <TableHead className="japanese-text">所属</TableHead>
                <TableHead className="japanese-text">会社名</TableHead>
                <TableHead className="japanese-text">履歴書</TableHead>
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 japanese-text">
                    技術者データを読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredEngineers.length === 0 ? (
                allEngineers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 japanese-text">
                      技術者データが見つかりません。データベースに技術者情報を登録してください。
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 japanese-text">
                      検索条件に一致する技術者がいません
                    </TableCell>
                  </TableRow>
                )
              ) : (
                filteredEngineers.map((engineer) => (
                  <TableRow key={engineer.id}>
                    <TableCell className="font-medium japanese-text">{engineer.name}</TableCell>
                    <TableCell className="japanese-text">
                      {Array.isArray(engineer.skills) 
                        ? engineer.skills.join(', ') 
                        : engineer.skills}
                    </TableCell>
                    <TableCell className="japanese-text">{engineer.companyType}</TableCell>
                    <TableCell className="japanese-text">
                      {engineer.companyType === '他社' ? engineer.companyName : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {engineer.resumeUrl ? (
                        <Badge variant="secondary" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          あり
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">なし</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSelect(engineer)} 
                        className="japanese-text"
                      >
                        選択
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
