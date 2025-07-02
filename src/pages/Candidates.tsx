
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsWithContext } from '@/components/ui/tabs';
import { CandidateList } from '@/components/candidates/CandidateList';
import { ResumeUploadStyled as ResumeUpload } from '@/components/candidates/ResumeUploadStyled';
import { useLocation } from 'react-router-dom';
import { Engineer, NewEngineerType } from '@/components/candidates/types';
import { toast } from 'sonner';
import { CandidateDetails } from '@/components/candidates/CandidateDetails';
import { CandidateEdit } from '@/components/candidates/CandidateEdit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useEngineers } from '@/hooks/useEngineers';
import { transformDatabaseToUIEngineer, transformUIToDatabaseEngineer } from '@/utils/engineerDataTransform';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';

interface CandidatesProps {
  companyType?: 'own' | 'other';
}


export function Candidates({ companyType = 'own' }: CandidatesProps) {
  const location = useLocation();
  const { currentTenant, loading: authLoading } = useAuth();
  
  // URLからファイル名を抽出するヘルパー関数
  const extractFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // タイムスタンプ付きファイル名から元のファイル名を推測
      const decodedFileName = decodeURIComponent(fileName);
      const timestampPattern = /^\d{8}_\d{6}_(.+)$/;
      const match = decodedFileName.match(timestampPattern);
      
      if (match && match[1]) {
        let originalName = match[1];
        
        // 特殊なケースの処理
        if (originalName === '-.xls' || originalName === '-.xlsx') {
          return '履歴書.xls';
        } else if (originalName.startsWith('-')) {
          originalName = '職務経歴書' + originalName;
        }
        
        return originalName;
      }
      
      return decodedFileName;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return '履歴書ファイル';
    }
  };
  
  // Company type from URL for backward compatibility
  const urlCompanyType = location.pathname.includes('/company/other') ? 'other' : 'own';
  const effectiveCompanyType = urlCompanyType || companyType;
  
  // Page title based on company type
  const pageTitle = effectiveCompanyType === 'own' ? '自社人材管理' : '他社人材管理';

  // Generate a unique contextId based on company type to keep tabs independent
  const tabContextId = `candidates-${effectiveCompanyType}`;

  // Use real database operations
  const { engineers: dbEngineers, loading: engineersLoading, error, createEngineer, updateEngineer, deleteEngineer } = useEngineers(effectiveCompanyType);

  // Transform database engineers to UI format
  const engineers = dbEngineers.map(transformDatabaseToUIEngineer);


  // Add state for modal visibility and selected engineer
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [engineerToDelete, setEngineerToDelete] = useState<string | null>(null);

  // Handle candidate view/edit actions
  const handleViewDetails = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsDetailsOpen(true);
    toast.info(`${engineer.name}の詳細を表示`);
  };

  const handleEditEngineer = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsEditOpen(true);
    toast.info(`${engineer.name}の編集を開始`);
  };

  const handleDeleteEngineer = (id: string) => {
    setEngineerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (engineerToDelete) {
      const success = await deleteEngineer(engineerToDelete);
      if (success) {
        setIsDeleteDialogOpen(false);
        setEngineerToDelete(null);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const engineer = dbEngineers.find(e => e.id === id);
    if (engineer) {
      await updateEngineer(id, { current_status: newStatus });
    }
  };

  const handleEngineerStatusChange = (value: string) => {
    if (selectedEngineer) {
      handleStatusChange(selectedEngineer.id, value);
    }
  };
  
  // Add a function to handle resume downloads
  const handleDownloadResume = async (id: string) => {
    const engineer = dbEngineers.find(e => e.id === id);
    if (engineer && engineer.resume_url) {
      try {
        // データベースのresume_file_nameを使用、なければデフォルト名を生成
        console.log('=== Resume Download Debug ===');
        console.log('Engineer ID:', id);
        console.log('Engineer name:', engineer.name);
        console.log('Database resume_file_name:', engineer.resume_file_name);
        console.log('Resume URL:', engineer.resume_url);
        
        let downloadFileName = engineer.resume_file_name;
        if (!downloadFileName || downloadFileName.trim() === '') {
          // データベースにファイル名がない場合、URLから抽出を試行
          console.log('resume_file_name is empty, trying to extract from URL');
          
          // URLからファイル名を抽出してタイムスタンプ部分を除去
          const urlFileName = extractFileNameFromUrl(engineer.resume_url);
          
          if (urlFileName && urlFileName !== '履歴書ファイル') {
            downloadFileName = urlFileName;
            console.log('Extracted filename from URL:', downloadFileName);
          } else {
            // 最終フォールバック: 従来の形式
            const extension = engineer.resume_url.includes('.xlsx') ? '.xlsx' : '.xls';
            downloadFileName = `履歴書_${engineer.name}_${new Date().toISOString().split('T')[0]}${extension}`;
            console.log('Using fallback filename:', downloadFileName);
          }
        } else {
          console.log('Using database filename:', downloadFileName);
        }
        
        console.log('Final download filename:', downloadFileName);
        
        // fetch APIを使用してファイルをダウンロードし、正しいファイル名を設定
        const response = await fetch(engineer.resume_url);
        const blob = await response.blob();
        
        // Blobからダウンロード用URLを作成
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadFileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the temporary URL
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success('履歴書のダウンロードを開始しました');
      } catch (error) {
        console.error('Resume download error:', error);
        toast.error('履歴書のダウンロードに失敗しました');
      }
    } else {
      toast.error('履歴書ファイルが見つかりません');
    }
  };


  // Handle engineer edit
  const handleEngineerChange = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
  };

  const handleSaveEdit = async (engineerToSave?: Engineer) => {
    // Use the engineerToSave parameter if provided, otherwise fall back to selectedEngineer
    const engineerData = engineerToSave || selectedEngineer;
    
    console.log('=== Candidates handleSaveEdit Debug ===');
    console.log('Original engineer data:', {
      id: engineerData?.id,
      name: engineerData?.name,
      resumeUrl: engineerData?.resumeUrl,
      resumeText: engineerData?.resumeText ? `${engineerData.resumeText.substring(0, 100)}...` : 'No text'
    });
    
    if (engineerData) {
      const transformedData = transformUIToDatabaseEngineer(engineerData);
      
      console.log('Transformed data for database:', {
        id: engineerData.id,
        resume_url: transformedData.resume_url,
        resume_text: transformedData.resume_text ? `${transformedData.resume_text.substring(0, 100)}...` : 'No text'
      });
      
      const success = await updateEngineer(engineerData.id, transformedData);
      if (success) {
        setIsEditOpen(false);
      }
    }
  };

  // Handle creating new engineer
  const handleCreateEngineer = async (formData: NewEngineerType) => {
    const transformedData = transformUIToDatabaseEngineer(formData);
    const result = await createEngineer(transformedData);
    return result !== null;
  };

  // Show loading spinner while auth or engineers are loading
  if (authLoading || engineersLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="h-12 w-12" />
            <p className="text-sm text-muted-foreground japanese-text">
              {authLoading ? '認証情報を読み込んでいます...' : '人材データを読み込んでいます...'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-red-600 japanese-text">エラーが発生しました: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 japanese-text"
            >
              再読み込み
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show message if no tenant is available
  if (!currentTenant) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground japanese-text">テナント情報が見つかりません</p>
            <p className="text-sm text-muted-foreground japanese-text">
              しばらく待ってから再度お試しください
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-8">
        <h1 className="text-3xl font-bold mb-6 japanese-text">{pageTitle}</h1>
        
        <TabsWithContext defaultValue="list" className="w-full" contextId={tabContextId}>
          <TabsList className="mb-4">
            <TabsTrigger value="list" contextId={tabContextId} className="japanese-text">技術者一覧</TabsTrigger>
            <TabsTrigger value="resume" contextId={tabContextId} className="japanese-text">技術者登録</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" contextId={tabContextId} className="w-full">
            <CandidateList 
              engineers={engineers}
              onViewDetails={handleViewDetails}
              onEditEngineer={handleEditEngineer}
              onDeleteEngineer={handleDeleteEngineer}
              onStatusChange={handleStatusChange}
              onDownloadResume={handleDownloadResume}
              isOwnCompany={effectiveCompanyType === 'own'}
            />
          </TabsContent>
          
          
          <TabsContent value="resume" contextId={tabContextId}>
            <ResumeUpload 
              onCreateEngineer={handleCreateEngineer} 
              isOwnCompany={effectiveCompanyType === 'own'} 
            />
          </TabsContent>
        </TabsWithContext>

        {/* 候補者詳細モーダル */}
        <CandidateDetails 
          open={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen}
          engineer={selectedEngineer}
          onStatusChange={handleEngineerStatusChange}
          onEditClick={() => {
            setIsDetailsOpen(false);
            setIsEditOpen(true);
          }}
        />

        {/* 候補者編集モーダル */}
        <CandidateEdit 
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          engineer={selectedEngineer}
          onEngineerChange={handleEngineerChange}
          onSave={handleSaveEdit}
          isOwnCompany={effectiveCompanyType === 'own'}
        />

        {/* 削除確認ダイアログ */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="japanese-text">候補者削除の確認</AlertDialogTitle>
              <AlertDialogDescription className="japanese-text">
                この候補者を削除してもよろしいですか？この操作は元に戻すことができません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="japanese-text">キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="japanese-text bg-red-600 hover:bg-red-700">
                削除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}

export default Candidates;
