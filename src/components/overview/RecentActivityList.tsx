import { Link } from 'react-router-dom'
import type { TransactionOut } from '../../api/types'
import { formatRelativeTime, shortenAddress } from '../../lib/format'
import { describeRejection } from '../../lib/rejectionReasons'
import { Card } from '../common/Card'
import { MoneyAmount } from '../common/MoneyAmount'
import { StatusPill } from '../common/StatusPill'

export function RecentActivityList({ transactions }: { transactions: TransactionOut[] }) {
  return (
    <Card
      title="Recent activity"
      action={
        <Link to="/transactions" className="text-sm font-medium text-accent hover:text-accent-hover">
          View all
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <p className="text-sm text-ink-muted">No activity yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusPill status={tx.status} />
                  <span className="truncate font-medium text-ink">
                    <MoneyAmount amount={tx.amount} token={tx.token} />
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  to {shortenAddress(tx.destination)}
                  {tx.status === 'rejected' && ` · ${describeRejection(tx.rejection_reason)}`}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink-muted">{formatRelativeTime(tx.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
