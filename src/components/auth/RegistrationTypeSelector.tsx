
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';

interface RegistrationTypeSelectorProps {
  onSelectType: (type: 'company' | 'personal') => void;
}

export function RegistrationTypeSelector({ onSelectType }: RegistrationTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold japanese-text">アカウントタイプを選択</h3>
        <p className="text-sm text-muted-foreground japanese-text">
          登録するアカウントのタイプを選択してください
        </p>
      </div>
      
      <div className="grid gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onSelectType('company')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="japanese-text">会社アカウント</CardTitle>
            <CardDescription className="japanese-text">
              企業・組織用のアカウントです
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full japanese-text"
              onClick={(e) => {
                e.stopPropagation();
                onSelectType('company');
              }}
            >
              会社として登録
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => onSelectType('personal')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="japanese-text">個人アカウント</CardTitle>
            <CardDescription className="japanese-text">
              個人用のアカウントです
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full japanese-text"
              onClick={(e) => {
                e.stopPropagation();
                onSelectType('personal');
              }}
            >
              個人として登録
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
