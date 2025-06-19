
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { CaseUploadForm } from '@/components/cases/CaseUploadForm';
import { StructuredCaseForm } from '@/components/cases/StructuredCaseForm';

export const CaseUploadTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top section with file upload (1/3) and structured case form (2/3) */}
      <div className="grid grid-cols-3 gap-6">
        {/* File Upload Card (1/3 width) */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="japanese-text">ファイルをアップロード</CardTitle>
              <CardDescription className="japanese-text">
                案件情報のファイル（Excel、PDF、Word）をアップロードしてください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold japanese-text">クリックしてファイルをアップロード</span>
                    </p>
                    <p className="text-xs text-muted-foreground japanese-text">
                      Excel、PDF、またはWord形式
                    </p>
                  </div>
                  <Input
                    id="dropzone-file"
                    type="file"
                    accept=".xlsx,.xls,.pdf,.doc,.docx"
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Structured Case Form Card (2/3 width) */}
        <div className="col-span-2">
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
      </div>

      {/* Bottom section with case input form - improved styling */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <CaseUploadForm />
        </div>
      </div>
    </div>
  );
};
