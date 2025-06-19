import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { candidatesData } from '@/components/candidates/data/candidatesData';
import { Engineer } from '@/components/candidates/types';
import { CandidateItem } from './types';

interface CandidateSelectionDialogProps {
  onSelect: (selectedCandidate: CandidateItem) => void;
}

export function CandidateSelectionDialog({ onSelect }: CandidateSelectionDialogProps) {
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  // Convert Engineer objects to CandidateItem format
  const convertEngineerToCandidateItem = (engineer: Engineer): CandidateItem => {
    return {
      id: parseInt(engineer.id),
      name: engineer.name,
      // Keep skills as is - our updated CandidateItem type supports both string and string[]
      skills: engineer.skills,
      companyType: engineer.companyType || '自社',
      companyName: engineer.companyName || '',
      nationality: engineer.nationality || '',
      age: engineer.age || '',
      gender: engineer.gender || '',
      experience: engineer.experience || '',
      japaneseLevel: engineer.japaneseLevel || '',
      availability: engineer.availability || '',
      status: Array.isArray(engineer.status) ? engineer.status : (engineer.status ? [engineer.status] : [])
    };
  };

  // Convert engineers to candidates
  const candidates: CandidateItem[] = candidatesData.map(convertEngineerToCandidateItem);
  
  // Filter candidates based on company type and search query
  const filteredCandidates = candidates.filter(candidate => {
    const matchesCompanyType = companyTypeFilter === "all" || candidate.companyType === companyTypeFilter;
    
    const matchesSearch = !searchQuery || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof candidate.skills === 'string' 
        ? candidate.skills.toLowerCase().includes(searchQuery.toLowerCase())
        : candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCompanyType && matchesSearch;
  });

  // Helper function to display skills regardless of their type
  const displaySkills = (skills: string | string[]): string => {
    if (Array.isArray(skills)) {
      return skills.join(', ');
    }
    return skills;
  };

  const handleSelect = (candidate: CandidateItem) => {
    onSelect(candidate);
    setOpen(false); // Close dialog after selection
    // Reset filters
    setSearchQuery("");
    setCompanyTypeFilter("all");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full japanese-text">
          <Users className="mr-2 h-4 w-4" />
          既存人材から選択
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="japanese-text">既存人材から選択</DialogTitle>
          <DialogDescription className="japanese-text">
            マッチングに使用する人材を選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <div>
              <Input 
                placeholder="人材を検索" 
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
                <TableHead className="w-24 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium japanese-text">{candidate.name}</TableCell>
                  <TableCell className="japanese-text">{displaySkills(candidate.skills)}</TableCell>
                  <TableCell className="japanese-text">{candidate.companyType}</TableCell>
                  <TableCell className="japanese-text">{candidate.companyType === '他社' ? candidate.companyName : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSelect(candidate)} 
                      className="japanese-text"
                    >
                      選択
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCandidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center japanese-text">
                    該当する人材が見つかりません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
