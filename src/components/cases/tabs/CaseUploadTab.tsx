import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StructuredCaseForm } from '@/components/cases/StructuredCaseForm';

export const CaseUploadTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 只保留结构化表单，移除文件上传部分 */}
      <Card>
        <CardHeader>
          <CardTitle className="japanese-text">案件情報の構造化</CardTitle>
          <CardDescription className="japanese-text">
            手動で案件情報を入力し、データベースに保存します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StructuredCaseForm />
        </CardContent>
      </Card>
    </div>
  );
};