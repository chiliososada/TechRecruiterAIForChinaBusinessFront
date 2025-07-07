// CSV导入导出工具函数

export interface BulkEmailContactCSV {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_position?: string;
  group_name?: string;
  group_color?: string;
  notes?: string;
}

// CSV模板定义
export const CSV_TEMPLATE_HEADERS = [
  'company_name',
  'contact_name', 
  'contact_email',
  'contact_position',
  'group_name',
  'group_color',
  'notes'
];

// 日语表头对应
export const CSV_HEADERS_JP = {
  company_name: '会社名',
  contact_name: '担当者名',
  contact_email: 'メールアドレス',
  contact_position: '役職',
  group_name: 'グループ名',
  group_color: 'グループ色',
  notes: '備考'
};

// 预设的组颜色选项
export const PRESET_GROUP_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16'  // Lime
];

// 示例数据
export const SAMPLE_DATA: BulkEmailContactCSV[] = [
  {
    company_name: '株式会社サンプル',
    contact_name: '田中太郎',
    contact_email: 'tanaka@sample.co.jp',
    contact_position: '開発部長',
    group_name: 'IT企業',
    group_color: '#3B82F6',
    notes: 'システム開発案件に興味あり'
  },
  {
    company_name: 'テクノロジー株式会社',
    contact_name: '佐藤花子',
    contact_email: 'sato@technology.co.jp',
    contact_position: '人事部マネージャー',
    group_name: 'IT企業',
    group_color: '#3B82F6',
    notes: '新卒採用担当'
  },
  {
    company_name: '商事会社ABC',
    contact_name: '山田次郎',
    contact_email: 'yamada@abc-trading.co.jp',
    contact_position: 'IT部課長',
    group_name: '商社',
    group_color: '#10B981',
    notes: 'DX推進プロジェクト担当'
  }
];

/**
 * CSV文字列を生成する
 */
export const generateCSV = (data: BulkEmailContactCSV[], includeHeaders = true): string => {
  const headers = CSV_TEMPLATE_HEADERS.map(key => CSV_HEADERS_JP[key as keyof typeof CSV_HEADERS_JP]);
  const csvRows: string[] = [];

  if (includeHeaders) {
    csvRows.push(headers.join(','));
  }

  data.forEach(row => {
    const values = CSV_TEMPLATE_HEADERS.map(header => {
      const value = row[header as keyof BulkEmailContactCSV] || '';
      // CSVエスケープ処理
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
};

/**
 * CSV模板下载（包含示例数据）
 */
export const downloadCSVTemplate = (): void => {
  const csvContent = generateCSV(SAMPLE_DATA);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_email_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * 空白CSV模板下载（仅表头）
 */
export const downloadEmptyCSVTemplate = (): void => {
  const csvContent = generateCSV([], true);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_email_empty_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * CSV文字列をパースしてオブジェクトに変換
 */
export const parseCSV = (csvText: string): BulkEmailContactCSV[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSVファイルにデータがありません');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
  const data: BulkEmailContactCSV[] = [];

  // ヘッダーマッピング
  const headerMap: { [key: string]: keyof BulkEmailContactCSV } = {};
  headers.forEach((header, index) => {
    for (const [key, jpHeader] of Object.entries(CSV_HEADERS_JP)) {
      if (header === jpHeader || header === key) {
        headerMap[index] = key as keyof BulkEmailContactCSV;
        break;
      }
    }
  });

  // データ行の処理
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: Partial<BulkEmailContactCSV> = {};

    values.forEach((value, index) => {
      const field = headerMap[index];
      if (field) {
        row[field] = value.trim();
      }
    });

    // 必須フィールドの検証
    if (row.company_name && row.contact_name && row.contact_email) {
      // デフォルト値の設定
      if (!row.group_name) row.group_name = 'デフォルトグループ';
      if (!row.group_color) row.group_color = PRESET_GROUP_COLORS[0];
      
      data.push(row as BulkEmailContactCSV);
    }
  }

  return data;
};

/**
 * CSV行をパースしてフィールドに分割
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

/**
 * メールアドレスの検証
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 導入データの検証
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validData: BulkEmailContactCSV[];
  invalidData: { row: number; data: Partial<BulkEmailContactCSV>; errors: string[] }[];
}

export const validateImportData = (data: BulkEmailContactCSV[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    validData: [],
    invalidData: []
  };

  const seenEmails = new Set<string>();
  const seenContacts = new Set<string>();

  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    const rowNum = index + 2; // +2 because index starts at 0 and we skip header

    // 必須フィールドのチェック
    if (!row.company_name?.trim()) {
      rowErrors.push('会社名は必須です');
    }
    if (!row.contact_name?.trim()) {
      rowErrors.push('担当者名は必須です');
    }
    if (!row.contact_email?.trim()) {
      rowErrors.push('メールアドレスは必須です');
    } else if (!validateEmail(row.contact_email)) {
      rowErrors.push('メールアドレスの形式が正しくありません');
    } else {
      // 重複チェック
      if (seenEmails.has(row.contact_email.toLowerCase())) {
        rowErrors.push('このメールアドレスは既に存在します');
      } else {
        seenEmails.add(row.contact_email.toLowerCase());
      }
    }

    // 重複する連絡先チェック
    const contactKey = `${row.company_name}_${row.contact_name}`.toLowerCase();
    if (seenContacts.has(contactKey)) {
      result.warnings.push(`行${rowNum}: 同じ会社の同じ担当者が重複しています`);
    } else {
      seenContacts.add(contactKey);
    }

    // グループ色の検証
    if (row.group_color && !row.group_color.match(/^#[0-9A-Fa-f]{6}$/)) {
      result.warnings.push(`行${rowNum}: グループ色の形式が正しくありません（#RRGGBBの形式で入力してください）`);
      row.group_color = PRESET_GROUP_COLORS[0]; // デフォルト色に設定
    }

    if (rowErrors.length > 0) {
      result.invalidData.push({
        row: rowNum,
        data: row,
        errors: rowErrors
      });
      result.isValid = false;
    } else {
      result.validData.push(row);
    }
  });

  // 全体的なエラーメッセージ
  if (result.invalidData.length > 0) {
    result.errors.push(`${result.invalidData.length}件のデータにエラーがあります`);
  }

  return result;
};