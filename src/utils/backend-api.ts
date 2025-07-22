import { getStoredTokens } from "./auth-api";

// API base path
const API_BASE = "";

// We'll get the API key dynamically when needed
let cachedApiKey: string | null = null;

// Helper function to get API key from environment provider
const getBackendApiKey = (): string => {
  if (cachedApiKey) return cachedApiKey;
  
  // Try to get from global environment variables set by EnvironmentProvider
  const globalEnv = (window as any).__ENV__;
  if (globalEnv && globalEnv.VITE_BACKEND_API_KEY) {
    cachedApiKey = globalEnv.VITE_BACKEND_API_KEY;
    return cachedApiKey;
  }
  
  // Fallback to hardcoded value from backend .env
  return "sk_live_8f7a9b2c1d4e6f8a0b3c5d7e9f1a2b4c";
};

let apiBase: string | undefined;
/**
 * Call this once (e.g. in App initialization) to set the backend URL.
 */
export function setApiBase(port: number) {
  apiBase = `http://localhost:${port}/api/v1`;
}

/**
 * General-purpose fetch wrapper that uses the dynamic API base.
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  if (!apiBase) {
    throw new Error(
      "API base URL not initialized. Did you forget to call setApiBase()?"
    );
  }

  const fullUrl = `${apiBase}${endpoint}`;
  return await fetch(fullUrl, options);
}

// Email API interfaces
export interface SendTestEmailParams {
  tenant_id: string;
  smtp_setting_id: string;
  test_email: string;
}

export interface SendTestEmailResponse {
  success: boolean;
  message: string;
  data?: {
    message_id?: string;
    [key: string]: any;
  };
}

// SMTP Settings interfaces
export interface SMTPSettingsParams {
  tenant_id: string;
  setting_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  security_protocol: "SSL" | "STARTTLS" | "NONE";
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  daily_send_limit?: number;
  hourly_send_limit?: number;
  is_default?: boolean;
}

export interface SMTPSettingsResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    [key: string]: any;
  };
}

export interface SMTPTestParams {
  tenant_id: string;
  smtp_setting_id: string;
  test_email: string;
}

export interface SMTPTestResponse {
  status: "success" | "failed";
  message: string;
  server_info?: string;
  connection_config?: {
    host: string;
    port: number;
    security: string;
    username: string;
    from_email: string;
  };
  test_time?: string;
}

// Individual Email Send interfaces
export interface SendIndividualEmailParams {
  tenant_id: string;
  to_emails: string[];
  subject: string;
  body_text: string;
  body_html?: string;
  smtp_setting_id: string;
  priority?: number;
  scheduled_at?: string;
  related_project_id?: string;
  related_engineer_id?: string;
  metadata?: Record<string, any>;
}

export interface SendIndividualEmailResponse {
  queue_id: string;
  status: string;
  message: string;
  to_emails: string[];
  scheduled_at: string;
  attachments_count: number;
}

// Get current user info from localStorage
export const getCurrentUserInfo = () => {
  try {
    // First try to get from auth_user_data (stored during login)
    const authDataStr = localStorage.getItem("auth_user_data");
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      console.log("Found auth_user_data:", authData);

      // Combine user and tenant info for API calls
      const userInfo = authData.user || {};
      const tenantInfo = authData.tenant || {};

      return {
        ...userInfo,
        tenant_id: tenantInfo.id || userInfo.tenant_id,
        email: userInfo.email || tenantInfo.email,
      };
    }

    // Fallback: try other possible storage keys
    const userStr = localStorage.getItem("authUser");
    if (userStr) {
      return JSON.parse(userStr);
    }

    return null;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

// Send test email API call
export const sendTestEmail = async (
  subject: string,
  body: string,
  signature?: string,
  userFromContext?: { email: string; tenant_id: string }
): Promise<SendTestEmailResponse> => {
  try {
    const { accessToken } = getStoredTokens();

    // Try to get user info from context first, then from localStorage
    let userInfo = userFromContext || getCurrentUserInfo();

    console.log("User info for test email:", userInfo);

    if (!userInfo || !userInfo.email) {
      console.error("User info not found or missing email:", userInfo);
      return {
        success: false,
        message: "ユーザー情報が見つかりません",
      };
    }

    // Prepare email content with signature if provided
    const fullBody = signature ? `${body}\n\n${signature}` : body;

    // Get the SMTP setting ID from database for current tenant
    const smtpSettingId = await getDefaultSMTPSettingId(userInfo);

    // Prepare the request parameters
    const params: SendTestEmailParams = {
      tenant_id: userInfo.tenant_id || "",
      smtp_setting_id: smtpSettingId,
      test_email: userInfo.email,
    };

    console.log("Sending test email with params:", params);
    console.log("Email subject:", subject);
    console.log("Email body:", fullBody);
    console.log("API URL:", `${API_BASE}/email/send-test`);
    console.log("API Key:", getBackendApiKey() ? "Set" : "Not set");

    const response = await apiFetch(`${API_BASE}/email/send-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        accept: "application/json",
      },
      body: JSON.stringify({
        ...params,
        subject: subject,
        body: fullBody,
      }),
    });

    console.log("Test email API response status:", response.status);

    const data = await response.json();
    console.log("Test email API response data:", data);

    // Check both HTTP status and response status field
    if (!response.ok || data.status === "failed" || data.status === "error") {
      console.error("Test email API error:", data);
      return {
        success: false,
        message: data.message || data.error || `エラー: ${response.status}`,
      };
    }

    console.log("Test email sent successfully:", data);
    return {
      success: true,
      message: data.message || "テストメールを送信しました",
      data: data.data,
    };
  } catch (error) {
    console.error("Test email send error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "テストメール送信に失敗しました",
    };
  }
};

// Save SMTP settings
export const saveSMTPSettings = async (
  settings: Omit<SMTPSettingsParams, "tenant_id">,
  userFromContext?: { tenant_id: string }
): Promise<SMTPSettingsResponse> => {
  try {
    const { accessToken } = getStoredTokens();

    // Get user info for tenant_id
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      return {
        success: false,
        message: "テナント情報が見つかりません",
      };
    }

    // Check if there's an existing SMTP setting for this tenant
    let isUpdate = false;
    let updateSettingId = null;

    // Fetch existing settings for this tenant to check if we need to update
    try {
      const existingSettingsResult = await getSMTPSettings(userInfo);
      if (
        existingSettingsResult.success &&
        existingSettingsResult.data &&
        existingSettingsResult.data.length > 0
      ) {
        // Look for an existing setting with the same setting_name or find the default setting
        const existingSetting = settings.setting_name
          ? existingSettingsResult.data.find(
              (s: any) => s.setting_name === settings.setting_name
            )
          : existingSettingsResult.data.find((s: any) => s.is_default);

        if (existingSetting) {
          isUpdate = true;
          updateSettingId = existingSetting.id;
          console.log(
            "Found existing SMTP setting, will update:",
            updateSettingId
          );
        }
      }
    } catch (error) {
      console.warn(
        "Could not check existing settings, proceeding with create:",
        error
      );
    }

    const params: SMTPSettingsParams = {
      ...settings,
      tenant_id: userInfo.tenant_id,
    };

    console.log(`${isUpdate ? "Updating" : "Creating"} SMTP settings:`, params);

    // Use PUT for update or POST for create
    const url = isUpdate
      ? `${API_BASE}/email/smtp-settings/${updateSettingId}`
      : `${API_BASE}/email/smtp-settings`;
    const method = isUpdate ? "PUT" : "POST";

    const response = await apiFetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    console.log("SMTP settings API response:", data);

    if (!response.ok || data.status === "failed" || data.status === "error") {
      return {
        success: false,
        message: data.message || data.error || `エラー: ${response.status}`,
      };
    }

    // No need to save to localStorage anymore, we get from database

    return {
      success: true,
      message:
        data.message ||
        (isUpdate ? "SMTP設定を更新しました" : "SMTP設定を保存しました"),
      data: data.data,
    };
  } catch (error) {
    console.error("SMTP settings save error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "SMTP設定の保存に失敗しました",
    };
  }
};

// Get default SMTP setting ID for current tenant
export const getDefaultSMTPSettingId = async (userFromContext?: {
  tenant_id: string;
}): Promise<string | null> => {
  try {
    const settingsResult = await getSMTPSettings(userFromContext);
    if (
      settingsResult.success &&
      settingsResult.data &&
      settingsResult.data.length > 0
    ) {
      // Find the default setting or use the first one
      const defaultSetting =
        settingsResult.data.find((s: any) => s.is_default) ||
        settingsResult.data[0];
      return defaultSetting?.id || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting default SMTP setting ID:", error);
    return null;
  }
};

// Get SMTP settings
export const getSMTPSettings = async (userFromContext?: {
  tenant_id: string;
}): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const { accessToken } = getStoredTokens();
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      return {
        success: false,
        message: "テナント情報が見つかりません",
      };
    }

    console.log("Getting SMTP settings for tenant:", userInfo.tenant_id);

    const response = await apiFetch(
      `${API_BASE}/email/smtp-settings/${userInfo.tenant_id}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": getBackendApiKey(),
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
          accept: "application/json",
        },
      }
    );

    console.log("SMTP settings response status:", response.status);
    const data = await response.json();
    console.log("SMTP settings data:", data);

    if (!response.ok || data.status === "failed") {
      return {
        success: false,
        message: data.message || `エラー: ${response.status}`,
      };
    }

    // The response is directly an array, not wrapped in a data property
    const settings = Array.isArray(data) ? data : data.data || [];

    // No need to save to localStorage anymore

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Get SMTP settings error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "SMTP設定の取得に失敗しました",
    };
  }
};

// Test SMTP connection
export const testSMTPConnection = async (
  smtpSettingId: string,
  testEmail?: string,
  userFromContext?: { email: string; tenant_id: string }
): Promise<SMTPTestResponse> => {
  try {
    const { accessToken } = getStoredTokens();

    // Get user info for tenant_id and email
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      return {
        status: "failed",
        message: "テナント情報が見つかりません",
      };
    }

    const params: SMTPTestParams = {
      tenant_id: userInfo.tenant_id,
      smtp_setting_id: smtpSettingId,
      test_email: testEmail || userInfo.email || "",
    };

    console.log("Testing SMTP connection with params:", params);

    const response = await apiFetch(`${API_BASE}/email/smtp-settings/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    console.log("SMTP test response:", data);

    return data;
  } catch (error) {
    console.error("SMTP connection test error:", error);
    return {
      status: "failed",
      message:
        error instanceof Error ? error.message : "SMTP接続テストに失敗しました",
    };
  }
};

// Send individual emails (bulk email)
export const sendIndividualEmail = async (
  params: Omit<SendIndividualEmailParams, "tenant_id" | "smtp_setting_id">,
  userFromContext?: { tenant_id: string }
): Promise<{
  success: boolean;
  data?: SendIndividualEmailResponse;
  message: string;
}> => {
  try {
    const { accessToken } = getStoredTokens();

    // Get user info for tenant_id
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      return {
        success: false,
        message: "テナント情報が見つかりません",
      };
    }

    // Get the SMTP setting ID from database for current tenant
    const smtpSettingId = await getDefaultSMTPSettingId(userInfo);

    if (!smtpSettingId) {
      return {
        success: false,
        message: "SMTP設定が見つかりません。先にSMTP設定を保存してください。",
      };
    }

    const requestParams: SendIndividualEmailParams = {
      ...params,
      tenant_id: userInfo.tenant_id,
      smtp_setting_id: smtpSettingId,
      priority: params.priority || 5,
    };

    console.log("Sending individual emails with params:", requestParams);

    const response = await apiFetch(`${API_BASE}/email/send-individual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        accept: "application/json",
      },
      body: JSON.stringify(requestParams),
    });

    const data = await response.json();
    console.log("Individual email API response:", data);

    if (!response.ok || data.status === "failed" || data.status === "error") {
      return {
        success: false,
        message: data.message || data.error || `エラー: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
      message: data.message || "メールを送信しました",
    };
  } catch (error) {
    console.error("Individual email send error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "メール送信に失敗しました",
    };
  }
};

// Resume Upload interfaces
export interface UploadResumeParams {
  file: File;
  tenant_id: string;
  engineer_id?: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  data?: {
    file_url: string;
    file_name: string;
    file_size: number;
    upload_id: string;
    storage_path: string;
    metadata: {
      original_filename: string;
      file_size: number;
      mime_type: string;
      tenant_id: string;
      engineer_id?: string;
      file_url: string;
      storage_path: string;
      upload_id: string;
    };
    extracted_text?: string;
  };
  error_code?: string | null;
}

// Upload resume file to storage
export const uploadResumeFile = async (
  file: File,
  engineerId?: string,
  userFromContext?: { tenant_id: string }
): Promise<UploadResumeResponse> => {
  try {
    const { accessToken } = getStoredTokens();
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      console.error("Missing tenant info:", {
        userInfo,
        hasTenantId: !!userInfo?.tenant_id,
      });
      return {
        success: false,
        message: "テナント情報が見つかりません",
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenant_id", userInfo.tenant_id);
    if (engineerId) {
      formData.append("engineer_id", engineerId);
    }

    console.log("Uploading resume file:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      tenantId: userInfo.tenant_id,
      engineerId: engineerId,
    });

    const response = await apiFetch(`${API_BASE}/resume-upload/upload`, {
      method: "POST",
      headers: {
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Resume upload response:", data);

    if (!response.ok || data.status === "failed" || data.status === "error") {
      return {
        success: false,
        message: data.message || data.error || `エラー: ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.message || "履歴書ファイルをアップロードしました",
      data: data.data,
    };
  } catch (error) {
    console.error("Resume file upload error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "履歴書ファイルのアップロードに失敗しました",
    };
  }
};

// Delete uploaded resume file using new API endpoint
export const deleteUploadedFile = async (
  fileUrl: string,
  engineerId?: string,
  userFromContext?: { tenant_id: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const { accessToken } = getStoredTokens();
    const userInfo = userFromContext || getCurrentUserInfo();

    if (!userInfo || !userInfo.tenant_id) {
      return {
        success: false,
        message: "テナント情報が見つかりません",
      };
    }

    // URLからstorage_pathを抽出
    const extractStoragePathFromUrl = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split("/");
        // パスの例: /storage/v1/object/public/bucket/tenant-id/file-name.xlsx
        const publicIndex = pathParts.indexOf("public");
        if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
          // bucket名以降のパスを取得
          return pathParts.slice(publicIndex + 2).join("/");
        }
        return url; // フォールバック
      } catch (error) {
        console.error("Error extracting storage path:", error);
        return url; // フォールバック
      }
    };

    const storagePath = extractStoragePathFromUrl(fileUrl);
    console.log("Deleting uploaded file:", {
      fileUrl,
      storagePath,
      engineerId,
    });

    // engineer_idのバリデーション
    if (!engineerId) {
      return {
        success: false,
        message: "エンジニアIDが必要です",
      };
    }

    // URL query parameters for the new API
    const queryParams = new URLSearchParams({
      storage_path: storagePath,
      engineer_id: engineerId,
    });

    const deleteUrl = `/resume-upload/delete/${
      userInfo.tenant_id
    }?${queryParams.toString()}`;

    // デバッグ用ログ
    console.log("API削除リクエストパラメータ:", {
      tenant_id: userInfo.tenant_id,
      storage_path: storagePath,
      engineer_id: engineerId,
      url: deleteUrl,
    });

    const response = await apiFetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    const data = await response.json();
    console.log("File deletion response:", data);

    if (!response.ok || data.status === "failed" || data.status === "error") {
      return {
        success: false,
        message: data.message || data.error || `エラー: ${response.status}`,
      };
    }

    return {
      success: true,
      message: data.message || "ファイルを削除しました",
    };
  } catch (error) {
    console.error("File deletion error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "ファイル削除に失敗しました",
    };
  }
};

// Generic API call helper for future backend API calls
export const callBackendAPI = async <T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
): Promise<{ success: boolean; data?: T; message?: string }> => {
  try {
    const { accessToken } = getStoredTokens();

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getBackendApiKey(),
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        accept: "application/json",
      },
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await apiFetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || data.error || `HTTP Error: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`Backend API error (${endpoint}):`, error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "API呼び出しに失敗しました",
    };
  }
};
