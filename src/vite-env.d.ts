/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_SUPABASE_URL: string
  readonly VITE_AUTH_SUPABASE_ANON_KEY: string
  readonly VITE_BUSINESS_SUPABASE_URL: string
  readonly VITE_BUSINESS_SUPABASE_ANON_KEY: string
  readonly VITE_BACKEND_API_URL: string
  readonly VITE_BACKEND_API_KEY: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_APP_NAME: string
  readonly VITE_AUTH_REDIRECT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
