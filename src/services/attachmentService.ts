import { businessClientManager } from '@/integrations/supabase/business-client';

export interface AttachmentInfo {
  id: string;
  filename: string;
  size: number;
  type: string;
  url?: string;
  engineerId?: string;
  engineerName?: string;
}

export interface UploadResponse {
  attachment_ids: string[];
  attachments: AttachmentInfo[];
}

export class AttachmentService {
  /**
   * Supabaseから履歴書ファイルをダウンロードして添付ファイルとしてアップロード
   */
  async uploadResumeFromSupabase(
    tenantId: string,
    engineerId: string,
    engineerName: string,
    resumeUrl: string
  ): Promise<AttachmentInfo> {
    try {
      // Supabaseから履歴書ファイルを取得
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error('履歴書ファイルの取得に失敗しました');
      }

      const blob = await response.blob();
      
      // ファイル名を生成（エンジニア名 + 履歴書）
      const fileExtension = this.getFileExtension(resumeUrl) || 'pdf';
      const filename = `${engineerName}_履歴書.${fileExtension}`;

      // FormDataを作成
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('engineerId', engineerId);
      formData.append('engineerName', engineerName);

      // アップロードAPI呼び出し
      const uploadResponse = await fetch(`/api/v1/email/attachments/upload?tenant_id=${tenantId}`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'ファイルのアップロードに失敗しました');
      }

      const uploadResult: UploadResponse = await uploadResponse.json();
      
      if (uploadResult.attachments && uploadResult.attachments.length > 0) {
        return {
          ...uploadResult.attachments[0],
          engineerId,
          engineerName,
        };
      } else {
        throw new Error('アップロード結果が不正です');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      throw error;
    }
  }

  /**
   * 添付ファイル付きメール送信
   */
  async sendEmailWithAttachments(
    tenantId: string,
    emailData: {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      signature?: string;
    },
    attachmentIds: string[]
  ): Promise<void> {
    try {
      const response = await fetch('/api/v1/email/send-individual-with-attachments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          ...emailData,
          attachment_ids: attachmentIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'メール送信に失敗しました');
      }
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  /**
   * URLからファイル拡張子を取得
   */
  private getFileExtension(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const extension = pathname.split('.').pop();
      return extension || null;
    } catch {
      return null;
    }
  }

  /**
   * ファイルサイズを人間が読める形式に変換
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * ファイルタイプに基づいてアイコンクラスを取得
   */
  getFileIconClass(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'text-red-600';
      case 'doc':
      case 'docx':
        return 'text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const attachmentService = new AttachmentService();