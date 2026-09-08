import { buildAddAgentTx, buildRemoveAgentTx } from '../api/policy'
import { Card } from '../components/common/Card'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { AgentManager } from '../components/policy/AgentManager'
import { PolicyUnavailableNotice } from '../components/policy/PolicyUnavailableNotice'
import { useWallet } from '../context/WalletContext'
import { usePolicyState } from '../hooks/usePolicy'
import { useSignAndSubmitPolicyTx } from '../hooks/usePolicyMutation'

export function SettingsPage() {
  const policy = usePolicyState()
  const { address, network, disconnect } = useWallet()
  const mutation = useSignAndSubmitPolicyTx()

  const errorMessage = mutation.isError ? (mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.') : null

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-ink">Settings</h1>

      <Card title="Session">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="text-ink-muted">Connected wallet</p>
            <p className="truncate font-mono text-ink">{address}</p>
          </div>
          <button type="button" onClick={disconnect} className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-paper-muted">
            Disconnect
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">Network: {network ?? 'unknown'}. To switch networks, change it in the Freighter extension and reconnect.</p>
        <p className="mt-1 text-xs text-ink-muted">
          Disconnecting only clears this app's session. To fully revoke Bridle's access, remove this site from Freighter's own connected-sites list.
        </p>
      </Card>

      {policy.isLoading ? (
        <LoadingState label="Loading agents…" />
      ) : policy.isError ? (
        <ErrorState onRetry={() => policy.refetch()} />
      ) : policy.data && !policy.data.available ? (
        <PolicyUnavailableNotice />
      ) : policy.data && address ? (
        <AgentManager
          agents={policy.data.data.agents}
          saving={mutation.isPending}
          error={errorMessage}
          onAdd={async (agent) => {
            await mutation.mutateAsync(() => buildAddAgentTx({ agent, owner_public_key: address }))
          }}
          onRemove={async (agent) => {
            await mutation.mutateAsync(() => buildRemoveAgentTx({ agent, owner_public_key: address }))
          }}
        />
      ) : null}
    </div>
  )
}
