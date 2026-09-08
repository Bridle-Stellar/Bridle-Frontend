import type { TransactionOut } from '../../api/types'
import { formatRelativeTime, shortenAddress } from '../../lib/format'
import { describeRejection } from '../../lib/rejectionReasons'
import { Card } from '../common/Card'
import { MoneyAmount } from '../common/MoneyAmount'

/** "A blocked spend the owner doesn't know about is a support problem waiting to happen" — so this is always visible, not tucked into the transaction log. */
export function LastRejectionCard({ transaction }: { transaction: TransactionOut | null }) {
  if (!transaction) {
    return (
      <Card title="Most recent blocked payment">
        <p className="text-sm text-healthy">No blocked payments — everything the agent has tried has gone through.</p>
      </Card>
    )
  }

  return (
    <Card title="Most recent blocked payment" className="border-warning">
      <p className="text-sm font-medium text-ink">{describeRejection(transaction.rejection_reason)}</p>
      <p className="mt-2 text-sm text-ink-muted">
        <MoneyAmount amount={transaction.amount} token={transaction.token} /> to {shortenAddress(transaction.destination)} ·{' '}
        {formatRelativeTime(transaction.created_at)}
      </p>
    </Card>
  )
}
