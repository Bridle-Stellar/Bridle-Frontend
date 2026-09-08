import { NavLink, Outlet } from 'react-router-dom'
import { isExpectedNetwork, useWallet } from '../../context/WalletContext'
import { shortenAddress } from '../../lib/format'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/transactions', label: 'Transactions', end: false },
  { to: '/policy', label: 'Policy', end: false },
  { to: '/settings', label: 'Settings', end: false },
]

export function AppShell() {
  const { address, network, networkPassphrase, disconnect } = useWallet()
  const networkMismatch = networkPassphrase !== null && !isExpectedNetwork(networkPassphrase)

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-base font-semibold text-ink">Bridle</span>
            <nav className="flex gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-paper-muted'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          {address && (
            <div className="flex items-center gap-3">
              {networkMismatch && (
                <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">Wrong network: {network}</span>
              )}
              <span className="rounded-full bg-paper-muted px-2.5 py-1 font-mono text-xs text-ink-muted" title={address}>
                {shortenAddress(address)}
              </span>
              <button type="button" onClick={disconnect} className="text-sm font-medium text-ink-muted hover:text-ink">
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
