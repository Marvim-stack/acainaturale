/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MP_PUBLIC_KEY: string;
  // adicione outras variáveis se precisar:
  // readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
