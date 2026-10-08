/**
 * Thin wrapper around @stellar/freighter-api. Freighter's calls resolve
 * (never reject) with a `{ ..., error? }` shape rather than throwing, so
 * every call here is normalized into either a plain return value or a
 * thrown FreighterError — callers use ordinary try/catch instead of
 * checking `.error` themselves everywhere.
 */
import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  isAllowed as freighterIsAllowed,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api'
import { DEMO_MODE, DEMO_WALLET } from '../demo/demoMode'

export class FreighterError extends Error {
  code?: number

  constructor(message: string, code?: number) {
    super(message)
    this.name = 'FreighterError'
    this.code = code
  }
}

export class FreighterNotInstalledError extends FreighterError {
  constructor() {
    super('Freighter is not installed in this browser.')
    this.name = 'FreighterNotInstalledError'
  }
}

export interface WalletConnection {
  address: string
  network: string
  networkPassphrase: string
}

declare global {
  interface Window {
    /**
     * Test-only seam: when set (by a Playwright e2e test via
     * `page.addInitScript`), wallet reads short-circuit to this value
     * instead of talking to the real Freighter extension, which can't run
     * inside a headless/CI browser context. Inert in every real deployment
     * — nothing in the app sets this global itself. See
     * e2e/overview.spec.ts.
     */
    __BRIDLE_TEST_WALLET__?: WalletConnection
  }
}

function testWalletOverride(): WalletConnection | null {
  return typeof window !== 'undefined' ? (window.__BRIDLE_TEST_WALLET__ ?? null) : null
}

export async function isFreighterInstalled(): Promise<boolean> {
  if (DEMO_MODE || testWalletOverride()) return true
  const res = await freighterIsConnected()
  return Boolean(res.isConnected) && !res.error
}

/** Prompts Freighter's connect dialog if not already authorized for this site. */
export async function connectWallet(): Promise<WalletConnection> {
  if (DEMO_MODE) return DEMO_WALLET
  const testWallet = testWalletOverride()
  if (testWallet) return testWallet

  const installed = await isFreighterInstalled()
  if (!installed) throw new FreighterNotInstalledError()

  const access = await freighterRequestAccess()
  if (access.error || !access.address) {
    throw new FreighterError(access.error?.message ?? 'Freighter access request was declined.', access.error?.code)
  }

  const net = await freighterGetNetwork()
  if (net.error) {
    throw new FreighterError(net.error.message ?? 'Could not read the connected network from Freighter.', net.error.code)
  }

  return { address: access.address, network: net.network, networkPassphrase: net.networkPassphrase }
}

/** Reads the currently-connected address without prompting, or null if not connected/authorized. */
export async function getConnectedWallet(): Promise<WalletConnection | null> {
  // The test seam deliberately returns null here (not the override) so the
  // Connect Wallet screen still renders and a click still exercises
  // connectWallet() below — see the seam's doc comment.
  if (DEMO_MODE || testWalletOverride()) return null

  const installed = await isFreighterInstalled()
  if (!installed) return null

  const allowed = await freighterIsAllowed()
  if (allowed.error || !allowed.isAllowed) return null

  const addr = await freighterGetAddress()
  if (addr.error || !addr.address) return null

  const net = await freighterGetNetwork()
  if (net.error) return null

  return { address: addr.address, network: net.network, networkPassphrase: net.networkPassphrase }
}

/** Hands an unsigned XDR (as returned by Bridle Backend's policy write proxy) to Freighter for signing. */
export async function signXdr(xdr: string, opts: { networkPassphrase: string; address: string }): Promise<string> {
  const res = await freighterSignTransaction(xdr, opts)
  if (res.error || !res.signedTxXdr) {
    throw new FreighterError(res.error?.message ?? 'Freighter declined to sign this transaction.', res.error?.code)
  }
  return res.signedTxXdr
}
