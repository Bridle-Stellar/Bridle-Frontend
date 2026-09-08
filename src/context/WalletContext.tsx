import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { connectWallet, FreighterNotInstalledError, getConnectedWallet } from '../lib/freighter'

export type WalletStatus = 'checking' | 'disconnected' | 'connecting' | 'connected' | 'not-installed'

interface WalletContextValue {
  status: WalletStatus
  address: string | null
  network: string | null
  networkPassphrase: string | null
  error: string | null
  /** True once the app's own connection attempt is done, so a first-load flash of "disconnected" can be avoided if desired. */
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | null>(null)

const EXPECTED_NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015'

export function isExpectedNetwork(networkPassphrase: string | null): boolean {
  return networkPassphrase === EXPECTED_NETWORK_PASSPHRASE
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>('checking')
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<string | null>(null)
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getConnectedWallet()
      .then((wallet) => {
        if (cancelled) return
        if (wallet) {
          setAddress(wallet.address)
          setNetwork(wallet.network)
          setNetworkPassphrase(wallet.networkPassphrase)
          setStatus('connected')
        } else {
          setStatus('disconnected')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('disconnected')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const connect = useCallback(async () => {
    setStatus('connecting')
    setError(null)
    try {
      const wallet = await connectWallet()
      setAddress(wallet.address)
      setNetwork(wallet.network)
      setNetworkPassphrase(wallet.networkPassphrase)
      setStatus('connected')
    } catch (err) {
      if (err instanceof FreighterNotInstalledError) {
        setStatus('not-installed')
      } else {
        setStatus('disconnected')
        setError(err instanceof Error ? err.message : 'Could not connect to Freighter.')
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    // Freighter has no programmatic "revoke" call — this only clears this
    // app's own session. Fully cutting access requires revoking the site
    // in the Freighter extension itself (surfaced in Settings).
    setAddress(null)
    setNetwork(null)
    setNetworkPassphrase(null)
    setStatus('disconnected')
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({ status, address, network, networkPassphrase, error, connect, disconnect }),
    [status, address, network, networkPassphrase, error, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
