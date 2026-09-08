import type { SpendSummary } from '../../api/types'
import { spentFraction } from '../../lib/decimal'
import { Card } from '../common/Card'
import { MoneyAmount } from '../common/MoneyAmount'
import { SpendProgressBar } from '../common/SpendProgressBar'

export function SpendProgressCard({ summary }: { summary: SpendSummary }) {
  const fraction = spentFraction(summary.total_spent, summary.cap)

  return (
    <Card title="Today's spending">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-ink">
          <MoneyAmount amount={summary.total_spent} token={summary.token} />
        </p>
        <p className="text-sm text-ink-muted">
          of <MoneyAmount amount={summary.cap} token={summary.token} /> daily cap
        </p>
      </div>
      <SpendProgressBar fraction={fraction} />
      <p className="mt-3 text-sm text-ink-muted">
        <MoneyAmount amount={summary.remaining} token={summary.token} /> remaining today
      </p>
    </Card>
  )
}
