
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { matchingHistoryService, SavedMatchingHistory } from '@/services/matchingHistoryService';
import { toast } from 'sonner';

interface BatchMatchingTab3Props {
  isActive?: boolean;
}

export function BatchMatchingTab3({ isActive = false }: BatchMatchingTab3Props) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<SavedMatchingHistory | null>(null);
  const [savedMatchingHistory, setSavedMatchingHistory] = useState<SavedMatchingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState<SavedMatchingHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { currentTenant } = useAuth();

  // データベースから保存済みマッチング履歴を取得
  useEffect(() => {
    const fetchSavedHistory = async () => {
      if (!currentTenant?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('履歴取得開始 - テナントID:', currentTenant.id);
        const history = await matchingHistoryService.getSavedMatchingHistory(currentTenant.id);
        console.log('取得した履歴データ:', history);
        setSavedMatchingHistory(history);
      } catch (error) {
        console.error('履歴取得エラー:', error);
        toast.error('履歴の取得に失敗しました');
        setSavedMatchingHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedHistory();
  }, [currentTenant?.id]);

  // タブが表示されたときに履歴を再取得する関数
  const refreshHistory = async () => {
    if (!currentTenant?.id) return;
    
    try {
      console.log('履歴の手動更新開始');
      const history = await matchingHistoryService.getSavedMatchingHistory(currentTenant.id);
      console.log('更新された履歴データ:', history);
      setSavedMatchingHistory(history);
    } catch (error) {
      console.error('履歴更新エラー:', error);
    }
  };

  // タブがアクティブになったときに履歴を更新
  useEffect(() => {
    if (isActive) {
      console.log('履歴タブがアクティブになりました - データ再取得');
      refreshHistory();
    }
  }, [isActive, currentTenant?.id]);

  // Function to handle viewing details of a saved matching
  const handleViewDetail = (history: SavedMatchingHistory) => {
    setSelectedHistory(history);
    setShowDetail(true);
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (history: SavedMatchingHistory) => {
    setDeletingHistory(history);
    setShowDeleteDialog(true);
  };

  // Function to execute delete
  const handleDeleteConfirm = async () => {
    if (!deletingHistory || !currentTenant?.id) return;

    try {
      setIsDeleting(true);
      await matchingHistoryService.deleteMatchingHistory(deletingHistory.id, currentTenant.id);
      
      // ローカル状態から削除
      setSavedMatchingHistory(prev => prev.filter(item => item.id !== deletingHistory.id));
      
      toast.success('マッチング履歴を削除しました');
      setShowDeleteDialog(false);
      setDeletingHistory(null);
    } catch (error) {
      console.error('削除エラー:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b japanese-text">マッチング結果履歴</h3>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 japanese-text">履歴を読み込み中...</p>
          </div>
        ) : savedMatchingHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 japanese-text">
              マッチング結果履歴はまだありません。検索結果から「履歴に保存」ボタンをクリックして保存してください。
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="japanese-text">保存日時</TableHead>
                <TableHead className="japanese-text">案件名</TableHead>
                <TableHead className="japanese-text">技術者名</TableHead>
                <TableHead className="japanese-text">マッチ率</TableHead>
                <TableHead className="japanese-text">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedMatchingHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>
                    {history.saved_at 
                      ? new Date(history.saved_at).toLocaleString('ja-JP')
                      : history.reviewed_at 
                        ? new Date(history.reviewed_at).toLocaleString('ja-JP')
                        : new Date(history.updated_at).toLocaleString('ja-JP')
                    }
                  </TableCell>
                  <TableCell>{history.projectDetail?.title || '案件名未設定'}</TableCell>
                  <TableCell>{history.engineerDetail?.name || '技術者名未設定'}</TableCell>
                  <TableCell>{Math.round((history.match_score || 0) * 100)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="japanese-text"
                        onClick={() => handleViewDetail(history)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        詳細
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(history)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="japanese-text">
              マッチング詳細 - {selectedHistory?.saved_at 
                ? new Date(selectedHistory.saved_at).toLocaleString('ja-JP')
                : selectedHistory?.reviewed_at 
                  ? new Date(selectedHistory.reviewed_at).toLocaleString('ja-JP') 
                  : '日時未設定'
              }
            </DialogTitle>
          </DialogHeader>
          
          {selectedHistory && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case details */}
                <Card className="p-4">
                  <h4 className="font-medium text-lg mb-2">案件情報</h4>
                  <p><span className="font-medium">案件名:</span> {selectedHistory.projectDetail?.title || '案件名未設定'}</p>
                  <p><span className="font-medium">会社名:</span> {selectedHistory.projectDetail?.client_company || selectedHistory.projectDetail?.partner_company || '会社名未設定'}</p>
                  <p><span className="font-medium">担当者:</span> {selectedHistory.projectDetail?.manager_name || '未設定'}</p>
                  <p><span className="font-medium">担当者メール:</span> {selectedHistory.projectDetail?.manager_email || '未設定'}</p>
                  <p><span className="font-medium">勤務地:</span> {selectedHistory.projectDetail?.location || '未設定'}</p>
                  <p><span className="font-medium">勤務形態:</span> {selectedHistory.projectDetail?.work_type || '未設定'}</p>
                  <p><span className="font-medium">単価:</span> {selectedHistory.projectDetail?.budget || selectedHistory.projectDetail?.desired_budget || '未設定'}</p>
                </Card>
                
                {/* Candidate details */}
                <Card className="p-4">
                  <h4 className="font-medium text-lg mb-2">技術者情報</h4>
                  <p><span className="font-medium">技術者名:</span> {selectedHistory.engineerDetail?.name || '技術者名未設定'}</p>
                  <p><span className="font-medium">所属会社:</span> {selectedHistory.engineerDetail?.company_name || '未設定'}</p>
                  <p><span className="font-medium">会社種別:</span> {selectedHistory.engineerDetail?.company_type || '未設定'}</p>
                  <p><span className="font-medium">スキル:</span> {selectedHistory.matched_skills?.join(', ') || selectedHistory.engineerDetail?.skills?.join(', ') || '未設定'}</p>
                  <p><span className="font-medium">経験年数:</span> {selectedHistory.engineerDetail?.experience || '未設定'}</p>
                  <p><span className="font-medium">日本語レベル:</span> {selectedHistory.engineerDetail?.japanese_level || '未設定'}</p>
                  <p><span className="font-medium">営業状態:</span> {selectedHistory.engineerDetail?.current_status || '未設定'}</p>
                </Card>
              </div>
              
              {/* Matching details */}
              <Card className="p-4">
                <h4 className="font-medium text-lg mb-2">マッチング詳細</h4>
                <p><span className="font-medium">マッチング率:</span> {Math.round((selectedHistory.match_score || 0) * 100)}%</p>
                {selectedHistory.match_reasons && selectedHistory.match_reasons.length > 0 && (
                  <p><span className="font-medium">マッチング理由:</span> {selectedHistory.match_reasons.join(', ')}</p>
                )}
                {selectedHistory.concerns && selectedHistory.concerns.length > 0 && (
                  <p><span className="font-medium">懸念事項:</span> {selectedHistory.concerns.join(', ')}</p>
                )}
                {selectedHistory.comment && (
                  <p><span className="font-medium">コメント:</span> {selectedHistory.comment}</p>
                )}
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="japanese-text">マッチング履歴の削除</AlertDialogTitle>
            <AlertDialogDescription className="japanese-text">
              このマッチング履歴を削除してもよろしいですか？
              <br />
              <strong>{deletingHistory?.projectDetail?.title}</strong> と <strong>{deletingHistory?.engineerDetail?.name}</strong> のマッチングが削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="japanese-text">キャンセル</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 japanese-text"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
