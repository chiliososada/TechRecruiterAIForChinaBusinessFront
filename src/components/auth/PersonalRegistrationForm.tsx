
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function PersonalRegistrationForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateInputs = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    if (!formData.name) {
      newErrors.name = "お名前を入力してください";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "メールアドレスを入力してください";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください";
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
      const { error } = await signUp(formData.email, formData.password, {
        registration_type: 'personal',
        first_name: formData.name.split(' ')[0] || formData.name,
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
      });
      
      if (error) {
        console.error("個人登録エラー:", error);
        
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
          <Label htmlFor="name" className="japanese-text">お名前 *</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isSubmitting}
            placeholder="田中 太郎"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="japanese-text">メールアドレス *</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isSubmitting}
            placeholder="your@email.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full japanese-text" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "登録中..." : "個人アカウント登録"}
        </Button>
      </CardFooter>
    </form>
  );
}
