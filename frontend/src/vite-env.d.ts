interface ImportMetaEnv {
  readonly VITE_PROD_SERVER_URL?: string;
  readonly VITE_SERVER_URL?: string;
  readonly VITE_DEV_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

