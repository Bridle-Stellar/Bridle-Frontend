import { Link } from 'react-router-dom'
import { KillSwitchBanner } from '../components/overview/KillSwitchBanner'
import { LastRejectionCard } from '../components/overview/LastRejectionCard'
import { RecentActivityList } from '../components/overview/RecentActivityList'
import { SpendProgressCard } from '../components/overview/SpendProgressCard'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useLastRejection } from '../hooks/useLastRejection'
import { usePolicyState } from '../hooks/usePolicy'
import { useSpendSummary } from '../hooks/useSpendSummary'
import { useRecentTransactions } from '../hooks/useTransactions'

export function OverviewPage() {
  const summary = useSpendSummary()
  const recent = useRecentTransactions()
  const lastRejection = useLastRejection()
  const policy = usePolicyState()

  if (summary.isLoading) return <LoadingState label="Loading overview…" />
  if (summary.isError || !summary.data) {
    return <ErrorState message={summary.error instanceof Error ? summary.error.message : undefined} onRetry={() => summary.refetch()} />
  }

  const looksUnconfigured = policy.data?.available && policy.data.data.daily_cap === '0' && policy.data.data.allowlist.length === 0

  return (
    <div className="space-y-4">
      {policy.isError ? (
        <ErrorState message="Couldn't check the emergency-stop state." onRetry={() => policy.refetch()} />
      ) : (
        policy.data && <KillSwitchBanner policy={policy.data} />
      )}

      {looksUnconfigured && (
        <div className="rounded-lg border border-accent bg-accent-soft p-4 text-sm">
          <p className="font-medium text-ink">No spending policy set up yet</p>
          <p className="mt-1 text-ink-muted">Get your agent's guardrails running in under a minute.</p>
          <Link to="/onboarding" className="mt-2 inline-block font-medium text-accent hover:text-accent-hover">
            Set up policy →
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SpendProgressCard summary={summary.data} />
        {lastRejection.isLoading ? <LoadingState label="Checking for blocked payments…" /> : <LastRejectionCard transaction={lastRejection.data} />}
      </div>

      {recent.isLoading ? (
        <LoadingState label="Loading recent activity…" />
      ) : recent.isError ? (
        <ErrorState message="Couldn't load recent activity." onRetry={() => recent.refetch()} />
      ) : (
        <RecentActivityList transactions={recent.data?.items ?? []} />
      )}
    </div>
  )
}
