-- engineersテーブルにmanager_nameとmanager_emailカラムを追加
ALTER TABLE public.engineers 
ADD COLUMN manager_name text,
ADD COLUMN manager_email text;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX idx_engineers_manager_email ON public.engineers(manager_email);

-- コメントを追加（ドキュメントのため）
COMMENT ON COLUMN public.engineers.manager_name IS '担当者名 - 自社の場合は自動設定、他社の場合は手動入力';
COMMENT ON COLUMN public.engineers.manager_email IS '担当者メールアドレス - 自社の場合は自動設定、他社の場合は手動入力';