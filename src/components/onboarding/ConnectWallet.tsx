import { useWallet } from '../../context/WalletContext'

export function ConnectWallet() {
  const { status, error, connect } = useWallet()

  return (
    <div className="mx-auto mt-24 max-w-sm text-center">
      <h1 className="text-xl font-semibold text-ink">Bridle</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Parental controls for your AI agent's wallet. Connect your Stellar wallet to set up or manage its spending
        guardrails.
      </p>

      {status === 'not-installed' ? (
        <div className="mt-6 rounded-lg border border-warning bg-warning-soft p-4 text-sm">
          <p className="font-medium text-ink">Freighter isn't installed</p>
          <p className="mt-1 text-ink-muted">Bridle uses the Freighter wallet extension to sign policy changes with your own key.</p>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block font-medium text-accent hover:text-accent-hover"
          >
            Install Freighter →
          </a>
        </div>
      ) : (
        <button
          type="button"
          onClick={connect}
          disabled={status === 'connecting'}
          className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect Freighter'}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-blocked">{error}</p>}
    </div>
  )
}
