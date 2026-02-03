/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_NEON_DATABASE_URL?: string;
  readonly VITE_CONVEX_URL?: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
