/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDLE_API_URL: string
  readonly VITE_SOROBAN_RPC_URL: string
  readonly VITE_STELLAR_NETWORK_PASSPHRASE: string
  /** "true" only in the public demo build — see src/demo/demoMode.ts. */
  readonly VITE_DEMO_MODE?: string
}

/** Set from VITE_DEMO_MODE at build time by vite.config.ts — use DEMO_MODE from src/demo/demoMode.ts instead. */
declare const __BRIDLE_DEMO_MODE__: boolean

interface ImportMeta {
  readonly env: ImportMetaEnv
}
