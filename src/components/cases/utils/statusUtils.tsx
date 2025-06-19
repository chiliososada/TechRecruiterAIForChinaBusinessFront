
// Status utilities for case management

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

// Status badge component for consistent status display
export const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case '募集中':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span className="japanese-text">募集中</span>
        </Badge>
      );
    case '募集終了':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          <span className="japanese-text">募集終了</span>
        </Badge>
      );
    case '保留中':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span className="japanese-text">保留中</span>
        </Badge>
      );
    case '要確認':
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="japanese-text">要確認</span>
        </Badge>
      );
    case 'アーカイブ済':
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 flex items-center">
          <XCircle className="h-3 w-3 mr-1" />
          <span className="japanese-text">アーカイブ済</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <span className="japanese-text">{status || '不明'}</span>
        </Badge>
      );
  }
};

// Get status badge color classes for consistent styling
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case '募集中':
      return 'bg-green-100 text-green-800 border-green-200';
    case '募集終了':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case '保留中':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case '要確認':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'アーカイブ済':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get all available statuses for filtering
export const getAvailableStatuses = () => [
  { value: 'all', label: '全て' },
  { value: '募集中', label: '募集中' },
  { value: '募集終了', label: '募集終了' },
  { value: '保留中', label: '保留中' },
  { value: '要確認', label: '要確認' },
];

// Get default process options for case management
export const getDefaultProcesses = (): string[] => [
  '要件定義',
  '基本設計',
  '詳細設計',
  '実装',
  'テスト',
  '運用・保守'
];

// 正规化数据库状态到显示状态的映射
export const normalizeStatus = (dbStatus: string): string => {
  const statusMap: Record<string, string> = {
    '募集中': '募集中',
    '募集完了': '募集終了', // 数据库中的'募集完了'映射到UI显示的'募集終了'
    'アーカイブ済': 'アーカイブ済',
    '保留中': '保留中',
    '要確認': '要確認',
    '': '不明'
  };
  
  return statusMap[dbStatus] || dbStatus;
};

// 检查是否为已归档状态
export const isArchivedStatus = (status: string): boolean => {
  return status === 'アーカイブ済';
};
