
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function AuthHeader() {
  return (
    <CardHeader>
      <CardTitle className="text-center text-2xl font-bold japanese-text">採用管理システム</CardTitle>
      <CardDescription className="text-center japanese-text">ログインまたはアカウント登録</CardDescription>
    </CardHeader>
  );
}
