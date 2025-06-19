
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface CaseTextInputProps {
  onStructuredData: (data: {
    title: string;
    company: string;
    skills: string;
    experience: string;
    budget: string;
    location: string;
    workType: string;
    originalText: string;
  }) => void;
}

export function CaseTextInput({ onStructuredData }: CaseTextInputProps) {
  const [caseText, setCaseText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleExtract = () => {
    if (!caseText.trim()) {
      toast({
        title: "エラー",
        description: "案件テキストを入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing with a timeout
    setTimeout(() => {
      try {
        // Extract information from text (in a real app, this would use AI or pattern matching)
        // This is a simple simulation of extracting structured data
        let title = "未特定";
        let company = "未特定";
        let skills = "";
        let experience = "3";
        let budget = "60~80";
        let location = "東京";
        let workType = "リモート可";
        
        // Simple extractors based on keywords
        const lines = caseText.split('\n');
        
        // Check for title in the first few lines
        for (let i = 0; i < Math.min(3, lines.length); i++) {
          if (lines[i].includes('案件') || lines[i].includes('募集') || lines[i].includes('開発')) {
            title = lines[i].trim();
            break;
          }
        }
        
        // Extract client/company
        const companyMatch = caseText.match(/[株式会社|合同会社|有限会社][\w\s]{1,20}/g);
        if (companyMatch && companyMatch.length > 0) {
          company = companyMatch[0];
        }
        
        // Extract skills
        const skillKeywords = [
          'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
          'Node.js', 'PHP', 'Ruby', 'C#', 'C++', 'Swift', 'Kotlin', 'Go', 'Rust',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Spring', 'Django', 'Rails',
          'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server'
        ];
        
        const foundSkills = skillKeywords.filter(skill => 
          caseText.includes(skill)
        );
        
        skills = foundSkills.join(', ');
        
        // Extract experience
        const expMatch = caseText.match(/(\d+)年.*経験/);
        if (expMatch) {
          experience = expMatch[1];
        }
        
        // Extract budget
        const budgetMatch = caseText.match(/(\d+)万[~～](\d+)万/);
        if (budgetMatch) {
          budget = `${budgetMatch[1]}~${budgetMatch[2]}`;
        }
        
        // Extract location
        const locations = ['東京', '大阪', '名古屋', '福岡', '札幌', '仙台', '広島', '横浜'];
        for (const loc of locations) {
          if (caseText.includes(loc)) {
            location = loc;
            break;
          }
        }
        
        // Extract work type
        if (caseText.includes('リモート')) {
          if (caseText.includes('フルリモート')) {
            workType = 'フルリモート';
          } else {
            workType = 'リモート可';
          }
        } else if (caseText.includes('オンサイト')) {
          workType = 'オンサイト';
        } else if (caseText.includes('ハイブリッド')) {
          workType = 'ハイブリッド';
        }

        // Return structured data
        onStructuredData({
          title,
          company,
          skills,
          experience,
          budget,
          location,
          workType,
          originalText: caseText
        });
        
        toast({
          title: "抽出成功",
          description: "案件テキストからデータを抽出しました",
        });
      } catch (error) {
        toast({
          title: "抽出エラー",
          description: "データの抽出に失敗しました",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="案件テキストを貼り付けてください。例：
【案件名】Java開発エンジニア
【会社名】株式会社テック
【スキル】Java, Spring Boot, MySQL
【経験】5年以上
【単価】60万～80万円
【場所】東京
【勤務形態】リモート可能"
        value={caseText}
        onChange={(e) => setCaseText(e.target.value)}
        className="min-h-[200px] japanese-text"
      />
      
      <Button 
        onClick={handleExtract} 
        disabled={isProcessing || !caseText.trim()} 
        className="w-full japanese-text"
      >
        {isProcessing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            <span>分析中...</span>
          </>
        ) : (
          "テキストからデータを抽出"
        )}
      </Button>
    </div>
  );
}
