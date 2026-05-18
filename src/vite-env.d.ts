/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPLIANCE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
