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
  attachment_id: string;
  filename: string;
  content_type: string;
  file_size: number;
  upload_url: string | null;
  status: string;
  message: string;
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
      formData.append('tenant_id', tenantId);
      formData.append('file', blob, filename);

      // アップロードAPI呼び出し
      const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
      const apiBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
      
      const uploadResponse = await fetch(`${apiBaseUrl}/api/v1/email/attachments/upload`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'ファイルのアップロードに失敗しました');
      }

      const uploadResult: UploadResponse = await uploadResponse.json();
      
      if (uploadResult.attachment_id && uploadResult.status === 'uploaded') {
        return {
          id: uploadResult.attachment_id,
          filename: uploadResult.filename,
          size: uploadResult.file_size,
          type: uploadResult.content_type,
          url: uploadResult.upload_url || undefined,
          engineerId,
          engineerName,
        };
      } else {
        throw new Error(uploadResult.message || 'アップロード結果が不正です');
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
    attachmentIds: string[],
    attachmentFilenames: string[]
  ): Promise<{ queue_id: string; status: string; message: string }> {
    try {
      const apiKey = import.meta.env.VITE_BACKEND_API_KEY;
      const apiBaseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
      
      // Prepare email body with signature if provided
      const fullBodyText = emailData.signature ? `${emailData.body}\n\n${emailData.signature}` : emailData.body;
      const fullBodyHtml = emailData.signature 
        ? `${emailData.body.replace(/\n/g, '<br>')}<br><br>${emailData.signature.replace(/\n/g, '<br>')}`
        : emailData.body.replace(/\n/g, '<br>');
      
      const requestBody = {
        tenant_id: tenantId,
        to_emails: emailData.to,
        ...(emailData.cc && emailData.cc.length > 0 && { cc_emails: emailData.cc }),
        ...(emailData.bcc && emailData.bcc.length > 0 && { bcc_emails: emailData.bcc }),
        subject: emailData.subject,
        body_text: fullBodyText,
        body_html: fullBodyHtml,
        scheduled_at: new Date().toISOString(),
        attachment_ids: attachmentIds,
        attachment_filenames: attachmentFilenames,
      };
      
      const response = await fetch(`${apiBaseUrl}/api/v1/email/send-individual-with-attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'メール送信に失敗しました');
      }

      const result = await response.json();
      return {
        queue_id: result.queue_id,
        status: result.status,
        message: result.message,
      };
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