import type { TransactionPage } from '../../api/types'
import { formatTimestamp, shortenAddress } from '../../lib/format'
import { describeRejection } from '../../lib/rejectionReasons'
import { MoneyAmount } from '../common/MoneyAmount'
import { StatusPill } from '../common/StatusPill'

export function TransactionTable({ page, onPageChange }: { page: TransactionPage; onPageChange: (offset: number) => void }) {
  const from = page.total === 0 ? 0 : page.offset + 1
  const to = Math.min(page.offset + page.limit, page.total)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-paper">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Destination</th>
              <th className="px-4 py-2.5 font-medium">Reason</th>
              <th className="px-4 py-2.5 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {page.items.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-2.5">
                  <StatusPill status={tx.status} />
                </td>
                <td className="px-4 py-2.5 font-medium text-ink">
                  <MoneyAmount amount={tx.amount} token={tx.token} />
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-muted">{shortenAddress(tx.destination, 6, 6)}</td>
                <td className="px-4 py-2.5 text-ink-muted">{tx.status === 'rejected' ? describeRejection(tx.rejection_reason) : '—'}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-ink-muted">{formatTimestamp(tx.created_at)}</td>
              </tr>
            ))}
            {page.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No transactions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-ink-muted">
        <span>{page.total === 0 ? 'No results' : `${from}–${to} of ${page.total}`}</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page.offset === 0}
            onClick={() => onPageChange(Math.max(0, page.offset - page.limit))}
            className="rounded-md px-3 py-1.5 font-medium hover:bg-paper-muted disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={to >= page.total}
            onClick={() => onPageChange(page.offset + page.limit)}
            className="rounded-md px-3 py-1.5 font-medium hover:bg-paper-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
