/**
 * Demo mode: a build-time flag (`VITE_DEMO_MODE=true`) used only for the
 * public demo deployment. When on, every Bridle Backend request is served
 * by the in-memory mock in ./mockBackend.ts, "connecting" uses a fixed demo
 * address instead of Freighter, and policy changes are applied to that
 * mock instead of being signed or submitted. Nothing leaves the browser.
 *
 * It can only be turned on at build time (Vite inlines the env value), so a
 * normal build can't be switched into demo mode from the page, and demo
 * builds always render <DemoBanner /> so they can't be mistaken for a real
 * connection.
 */
import type { WalletConnection } from '../lib/freighter'

export const DEMO_MODE: boolean = __BRIDLE_DEMO_MODE__

export const DEMO_WALLET: WalletConnection = {
  address: 'GC2HVR3OEYHR3E5XMTUWU55KQ5ZIESGVGTIOIM2NPQB4IDSZBHW3USID',
  network: 'TESTNET',
  networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
}
