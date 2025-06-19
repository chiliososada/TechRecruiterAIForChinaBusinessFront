
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function CompanyRegistrationForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    registrantName: '',
    position: '',
    loginEmail: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateInputs = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    if (!formData.companyName) {
      newErrors.companyName = "会社名を入力してください";
      isValid = false;
    }

    if (!formData.companyEmail) {
      newErrors.companyEmail = "会社メールアドレスを入力してください";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = "有効なメールアドレスを入力してください";
      isValid = false;
    }

    if (!formData.registrantName) {
      newErrors.registrantName = "登録者名を入力してください";
      isValid = false;
    }

    if (!formData.loginEmail) {
      newErrors.loginEmail = "ログイン用メールアドレスを入力してください";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginEmail)) {
      newErrors.loginEmail = "有効なメールアドレスを入力してください";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください";
      isValid = false;
    } else if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(formData.password)) {
      newErrors.password = "パスワードは数字と文字を含む必要があります";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(formData.loginEmail, formData.password, {
        registration_type: 'company',
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        first_name: formData.registrantName.split(' ')[0] || formData.registrantName,
        last_name: formData.registrantName.split(' ').slice(1).join(' ') || '',
        position: formData.position,
      });
      
      if (error) {
        console.error("会社登録エラー:", error);
        
        if (error.message.includes("already registered")) {
          toast({
            title: "登録失敗",
            description: "このメールアドレスは既に登録されています",
            variant: "destructive",
          });
        } else {
          toast({
            title: "登録失敗",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('予期しない登録エラー:', error);
      toast({
        title: "登録失敗",
        description: "予期しないエラーが発生しました。しばらくしてからもう一度お試しください",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="japanese-text">会社名 *</Label>
          <Input 
            id="companyName" 
            value={formData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            disabled={isSubmitting}
            placeholder="株式会社サンプル"
            className={errors.companyName ? "border-red-500" : ""}
          />
          {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyEmail" className="japanese-text">会社メールアドレス *</Label>
          <Input 
            id="companyEmail" 
            type="email"
            value={formData.companyEmail}
            onChange={(e) => handleInputChange('companyEmail', e.target.value)}
            disabled={isSubmitting}
            placeholder="info@company.com"
            className={errors.companyEmail ? "border-red-500" : ""}
          />
          <p className="text-xs text-muted-foreground">主要通知の受信用</p>
          {errors.companyEmail && <p className="text-sm text-red-500">{errors.companyEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrantName" className="japanese-text">登録者名 *</Label>
          <Input 
            id="registrantName" 
            value={formData.registrantName}
            onChange={(e) => handleInputChange('registrantName', e.target.value)}
            disabled={isSubmitting}
            placeholder="田中 太郎"
            className={errors.registrantName ? "border-red-500" : ""}
          />
          {errors.registrantName && <p className="text-sm text-red-500">{errors.registrantName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="japanese-text">職位（任意）</Label>
          <Input 
            id="position" 
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            disabled={isSubmitting}
            placeholder="営業担当"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loginEmail" className="japanese-text">ログイン用メールアドレス *</Label>
          <Input 
            id="loginEmail" 
            type="email"
            value={formData.loginEmail}
            onChange={(e) => handleInputChange('loginEmail', e.target.value)}
            disabled={isSubmitting}
            placeholder="user@company.com"
            className={errors.loginEmail ? "border-red-500" : ""}
          />
          {errors.loginEmail && <p className="text-sm text-red-500">{errors.loginEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="japanese-text">パスワード *</Label>
          <Input 
            id="password" 
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={isSubmitting}
            placeholder="••••••••"
            className={errors.password ? "border-red-500" : ""}
          />
          <p className="text-xs text-muted-foreground">8文字以上、数字と文字を含む</p>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full japanese-text" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "登録中..." : "会社アカウント登録"}
        </Button>
      </CardFooter>
    </form>
  );
}
