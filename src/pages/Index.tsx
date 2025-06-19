
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="p-8">
        <h2 className="text-3xl font-bold tracking-tight japanese-text">ダッシュボード</h2>
        <p className="mt-4 text-muted-foreground">ダッシュボード機能は準備中です。</p>

        {user ? (
          <div className="mt-6">
            <Link to="/profile">
              <Button className="japanese-text">プロフィールを確認</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <Link to="/auth">
              <Button className="japanese-text">ログイン / 新規登録</Button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
