
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CandidateTextInputProps {
  onStructuredData?: (data: any) => void;
}

export function CandidateTextInput({ onStructuredData }: CandidateTextInputProps) {
  const [candidateText, setCandidateText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleExtract = () => {
    if (!candidateText.trim()) {
      toast({
        title: "テキストが入力されていません",
        description: "候補者情報を入力してください",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing - in a real app, this would call an API
    setTimeout(() => {
      // Extract data from text using simple parsing
      // This is a simplified example - in a real app, you'd use NLP or an AI service
      const extractedData = {
        skills: extractSkills(candidateText),
        experience: extractExperience(candidateText),
        rate: extractRate(candidateText),
        location: extractLocation(candidateText),
        workType: extractWorkType(candidateText),
        availability: extractAvailability(candidateText)
      };
      
      if (onStructuredData) {
        onStructuredData(extractedData);
      } else {
        toast({
          title: "データ抽出",
          description: "候補者情報からデータを抽出しました",
        });
      }
      
      setIsProcessing(false);
    }, 1500);
  };
  
  // Simple extraction functions (these would be more sophisticated in a real app)
  const extractSkills = (text: string) => {
    const skills = ['Java', 'Python', 'React', 'AWS', 'Docker', 'TypeScript', 'JavaScript'];
    return skills.filter(skill => text.includes(skill)).join(', ');
  };
  
  const extractExperience = (text: string) => {
    if (text.includes('10年')) return '10年以上';
    if (text.includes('5年')) return '5年';
    if (text.includes('3年')) return '3年';
    return '1年';
  };
  
  const extractRate = (text: string) => {
    // Look for patterns like "60~80万円" or "60万円"
    const rateMatch = text.match(/(\d+)\s*[~～]\s*(\d+)\s*万円/) || text.match(/(\d+)\s*万円/);
    if (rateMatch) {
      if (rateMatch.length > 2) {
        return `${rateMatch[1]}〜${rateMatch[2]}万円`;
      } else {
        return `${rateMatch[1]}万円`;
      }
    }
    return '60〜80万円';
  };
  
  const extractLocation = (text: string) => {
    if (text.includes('東京')) return '東京';
    if (text.includes('大阪')) return '大阪';
    if (text.includes('名古屋')) return '名古屋';
    return '東京';
  };
  
  const extractWorkType = (text: string) => {
    if (text.includes('フルリモート')) return 'フルリモート';
    if (text.includes('リモート')) return 'リモート可';
    return 'オンサイト';
  };
  
  const extractAvailability = (text: string) => {
    if (text.includes('即日')) return '即日';
    if (text.includes('1週間')) return '1週間以内';
    if (text.includes('2週間')) return '2週間以内';
    return '1ヶ月以内';
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid w-full gap-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="candidate-text" className="japanese-text">候補者の情報</Label>
            <Textarea
              id="candidate-text"
              placeholder="例：「Javaの経験が5年あります。希望単価は60〜80万円、勤務地は東京希望です。リモート勤務可能で、即日稼働できます。」"
              className="min-h-[120px] japanese-text"
              value={candidateText}
              onChange={(e) => setCandidateText(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExtract} 
          disabled={isProcessing || !candidateText.trim()}
          className="w-full japanese-text"
        >
          {isProcessing ? (
            <>処理中...</>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              構造化データを生成
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
