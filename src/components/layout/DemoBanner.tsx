import { useEffect } from 'react'

/**
 * Always-visible marker for demo builds (see src/demo/demoMode.ts). Not
 * dismissable on purpose: demo data must never be mistaken for a real
 * wallet or backend connection.
 */
export function DemoBanner() {
  useEffect(() => {
    if (!document.title.startsWith('[Demo]')) document.title = `[Demo] ${document.title}`
  }, [])

  return (
    <div role="status" className="sticky top-0 z-40 border-b border-warning bg-warning-soft px-4 py-2 text-center text-sm text-ink">
      <span className="mr-2 rounded bg-warning px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Demo data</span>
      Not connected to a wallet, Bridle Backend, or the Stellar network. Nothing here is real, signed, or sent anywhere.
    </div>
  )
}
