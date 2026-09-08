import { buildAddAllowlistEntryTx, buildKillSwitchTx, buildRemoveAllowlistEntryTx, buildSetDailyCapTx, buildSetPerCallMaxTx } from '../api/policy'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { AllowlistManager } from '../components/policy/AllowlistManager'
import { AmountLimitCard } from '../components/policy/AmountLimitCard'
import { KillSwitchToggle } from '../components/policy/KillSwitchToggle'
import { PolicyUnavailableNotice } from '../components/policy/PolicyUnavailableNotice'
import { useWallet } from '../context/WalletContext'
import { usePolicyState } from '../hooks/usePolicy'
import { useSignAndSubmitPolicyTx } from '../hooks/usePolicyMutation'

export function PolicyPage() {
  const policy = usePolicyState()
  const { address } = useWallet()
  const mutation = useSignAndSubmitPolicyTx()

  if (policy.isLoading) return <LoadingState label="Loading policy…" />
  if (policy.isError) return <ErrorState onRetry={() => policy.refetch()} />
  if (!policy.data) return null
  if (!policy.data.available) return <PolicyUnavailableNotice />
  if (!address) return null

  const state = policy.data.data
  const errorMessage = mutation.isError ? (mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.') : null

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-ink">Policy</h1>

      <AmountLimitCard
        title="Daily cap"
        helpText="The most the agent can spend in a UTC day, across all destinations."
        currentSmallestUnit={state.daily_cap}
        token={state.token}
        saving={mutation.isPending}
        saveError={errorMessage}
        onSave={async (value) => {
          await mutation.mutateAsync(() => buildSetDailyCapTx({ daily_cap: value, owner_public_key: address }))
        }}
      />

      <AmountLimitCard
        title="Per-call max"
        helpText="The most the agent can spend in a single payment."
        currentSmallestUnit={state.per_call_max}
        token={state.token}
        saving={mutation.isPending}
        saveError={errorMessage}
        onSave={async (value) => {
          await mutation.mutateAsync(() => buildSetPerCallMaxTx({ per_call_max: value, owner_public_key: address }))
        }}
      />

      <AllowlistManager
        allowlist={state.allowlist}
        saving={mutation.isPending}
        error={errorMessage}
        onAdd={async (destination, category) => {
          await mutation.mutateAsync(() => buildAddAllowlistEntryTx({ destination, category, owner_public_key: address }))
        }}
        onRemove={async (destination) => {
          await mutation.mutateAsync(() => buildRemoveAllowlistEntryTx({ destination, owner_public_key: address }))
        }}
      />

      <KillSwitchToggle
        active={state.kill_switch_active}
        saving={mutation.isPending}
        error={errorMessage}
        onToggle={async (next) => {
          await mutation.mutateAsync(() => buildKillSwitchTx({ active: next, owner_public_key: address }))
        }}
      />
    </div>
  )
}
