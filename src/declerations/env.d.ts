/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STAGE: "development" | "staging" | "production";
  readonly VITE_STRIPE_PK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
