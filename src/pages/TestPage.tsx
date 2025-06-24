import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

export function TestPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-blue-600">テストページ</h1>
        <p className="text-lg">このページが表示されれば、基本的なレイアウトは動作しています。</p>
        <div className="bg-green-100 p-4 rounded border">
          <h2 className="text-xl font-semibold">動作確認</h2>
          <ul className="list-disc list-inside mt-2">
            <li>メインレイアウトが正常に表示されている</li>
            <li>サイドバーが表示されている</li>
            <li>コンテンツエリアが表示されている</li>
            <li>Tailwind CSSが適用されている</li>
          </ul>
        </div>
        <div className="bg-blue-100 p-4 rounded border">
          <h3 className="text-lg font-semibold">次のステップ</h3>
          <p>このページが正常に表示される場合は、サイドバーのナビゲーションを使用して他のページにアクセスしてください。</p>
        </div>
      </div>
    </MainLayout>
  );
}

export default TestPage;