
-- 创建 OAuth 客户端表
CREATE TABLE public.oauth_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text UNIQUE NOT NULL,
  client_secret text NOT NULL,
  client_name text NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id),
  redirect_uris text[] DEFAULT '{}',
  scopes text[] DEFAULT ARRAY['read'],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;

-- 创建索引以提高查询性能
CREATE INDEX idx_oauth_clients_client_id ON public.oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_tenant_id ON public.oauth_clients(tenant_id);

-- 创建更新时间触发器
CREATE TRIGGER update_oauth_clients_updated_at
    BEFORE UPDATE ON public.oauth_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
