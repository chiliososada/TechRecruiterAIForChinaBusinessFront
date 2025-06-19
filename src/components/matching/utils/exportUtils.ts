
import { EnhancedMatchingResult } from '../types';

/**
 * Export data to CSV file and trigger download
 */
export const exportToCSV = (data: EnhancedMatchingResult[], filename: string) => {
  // Define CSV headers
  const headers = [
    '案件名',
    '候補者名',
    'マッチング率',
    'マッチング理由',
    '推薦コメント',
    '候補者所属',
    '案件会社',
    'メモ'
  ];

  // Transform data to CSV rows
  const rows = data.map(item => [
    item.caseName || '',
    item.candidateName || '',
    item.matchingRate || '',
    item.matchingReason || '',
    item.recommendationComment || '',
    item.candidateCompany || '',
    item.caseCompany || '',
    item.memo || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => {
        // Handle cells that contain commas, quotes, or newlines
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0,10)}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
