/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDLE_API_URL: string
  readonly VITE_SOROBAN_RPC_URL: string
  readonly VITE_STELLAR_NETWORK_PASSPHRASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
