
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { RegistrationTypeSelector } from './RegistrationTypeSelector';
import { CompanyRegistrationForm } from './CompanyRegistrationForm';
import { PersonalRegistrationForm } from './PersonalRegistrationForm';
import { ArrowLeft } from 'lucide-react';

interface RegisterFormProps {
  onGoogleLogin: () => void;
}

export function RegisterForm({ onGoogleLogin }: RegisterFormProps) {
  const [selectedType, setSelectedType] = useState<'company' | 'personal' | null>(null);

  const handleBack = () => {
    setSelectedType(null);
  };

  if (!selectedType) {
    return (
      <>
        <CardContent className="pt-4">
          <RegistrationTypeSelector onSelectType={setSelectedType} />
        </CardContent>
        <CardContent className="pt-0">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground japanese-text">または</span>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onGoogleLogin} 
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <FcGoogle className="h-5 w-5" />
            <span className="japanese-text">Googleアカウントで登録</span>
          </Button>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardContent className="pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 p-0 h-auto japanese-text"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          アカウントタイプ選択に戻る
        </Button>
      </CardContent>
      
      {selectedType === 'company' ? (
        <CompanyRegistrationForm />
      ) : (
        <PersonalRegistrationForm />
      )}
    </>
  );
}
