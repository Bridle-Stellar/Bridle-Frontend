import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { StatsBucket } from '../../api/types'
import { toDisplayAmount } from '../../lib/decimal'
import { symbolFor } from '../../lib/tokens'
import { Card } from '../common/Card'

interface ChartRow {
  label: string
  approved: number
}

/**
 * Single series (approved spend per day) — a single series needs no
 * legend box, the card title already names it. Rejected-count is shown
 * elsewhere (Overview's blocked-payment card, the transaction table
 * itself) rather than as a second bar here: two measures of different
 * scale never share one axis.
 */
export function SpendOverTimeChart({ buckets, token }: { buckets: StatsBucket[]; token: string }) {
  const data: ChartRow[] = buckets.map((bucket) => ({
    label: new Date(bucket.period_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    approved: Number(toDisplayAmount(bucket.approved_amount, token)),
  }))

  return (
    <Card title="Spend over time (approved)">
      {data.length === 0 ? (
        <p className="text-sm text-ink-muted">Not enough data yet.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-ink-muted)' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                cursor={{ fill: 'var(--color-paper-muted)' }}
                formatter={(value) => [`${Number(value)} ${symbolFor(token)}`, 'Approved spend']}
                contentStyle={{
                  background: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: 'var(--color-ink)' }}
              />
              <Bar dataKey="approved" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
