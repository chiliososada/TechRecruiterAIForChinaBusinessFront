
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsWithContext } from '@/components/ui/tabs';
import { CandidateList } from '@/components/candidates/CandidateList';
import { CandidateFormStyled as CandidateForm } from '@/components/candidates/CandidateFormStyled';
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

// Creating mock initialData for CandidateForm
const initialCandidateData: NewEngineerType = {
  name: '',
  skills: '',
  japaneseLevel: '',
  englishLevel: '',
  experience: '',
  availability: '',
  status: '',
  nationality: '',
  age: '',
  gender: '',
  nearestStation: '',
  education: '',
  arrivalYear: '',
  certifications: '',
  remarks: '',
  companyType: '自社',
  companyName: '',
  source: '',
  selfPromotion: '',
  workScope: '',
  workExperience: '',
  email: '',      // Added email field
  phone: '',      // Added phone field
  managerName: '', // Added manager name field
  managerEmail: '', // Added manager email field
  registeredAt: '',
  updatedAt: '',
};

export function Candidates({ companyType = 'own' }: CandidatesProps) {
  const location = useLocation();
  const { currentTenant, loading: authLoading } = useAuth();
  
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

  const [recommendationTemplate, setRecommendationTemplate] = useState<string>('');
  const [recommendationText, setRecommendationText] = useState<string>('');

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
  const handleDownloadResume = (id: string) => {
    console.log(`Download resume for candidate: ${id}`);
    toast.success('履歴書のダウンロードを開始しました');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by the form component now
  };

  const handleDataChange = (data: any) => {
    // Handle data change
    console.log('Form data changed:', data);
  };

  const handleGenerateRecommendation = () => {
    // Handle recommendation generation
    toast.success('推薦文を生成しました');
  };

  // Handle engineer edit
  const handleEngineerChange = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    console.log('Updated engineer:', engineer);
  };

  const handleSaveEdit = async () => {
    if (selectedEngineer) {
      const transformedData = transformUIToDatabaseEngineer(selectedEngineer);
      const success = await updateEngineer(selectedEngineer.id, transformedData);
      if (success) {
        setIsEditOpen(false);
      }
    }
  };

  // Handle creating new engineer
  const handleCreateEngineer = async (formData: NewEngineerType) => {
    console.log('=== Candidates.tsx handleCreateEngineer formData ===', formData);
    const transformedData = transformUIToDatabaseEngineer(formData);
    console.log('=== Candidates.tsx handleCreateEngineer transformedData ===', transformedData);
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
            <TabsTrigger value="list" contextId={tabContextId} className="japanese-text">人材一覧</TabsTrigger>
            <TabsTrigger value="add" contextId={tabContextId} className="japanese-text">新規登録</TabsTrigger>
            <TabsTrigger value="resume" contextId={tabContextId} className="japanese-text">履歴書アップロード</TabsTrigger>
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
          
          <TabsContent value="add" contextId={tabContextId}>
            <CandidateForm 
              initialData={{
                ...initialCandidateData,
                companyType: effectiveCompanyType === 'own' ? '自社' : '他社'
              }}
              onSubmit={handleSubmit}
              onDataChange={handleDataChange}
              onCreateEngineer={handleCreateEngineer}
              recommendationTemplate={recommendationTemplate}
              recommendationText={recommendationText}
              onRecommendationTemplateChange={setRecommendationTemplate}
              onRecommendationTextChange={setRecommendationText}
              onGenerateRecommendation={handleGenerateRecommendation}
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
