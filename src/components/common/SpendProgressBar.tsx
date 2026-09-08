/**
 * Healthy under 80% of cap, warning from 80% up to the cap, blocked once
 * spend has reached/exceeded it — the same three-color vocabulary used
 * everywhere else in the app (see src/index.css).
 */
export function SpendProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.round(Math.min(Math.max(fraction, 0), 1) * 100)
  const colorClass = fraction >= 1 ? 'bg-blocked' : fraction >= 0.8 ? 'bg-warning' : 'bg-healthy'

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full border border-border bg-paper-muted"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${colorClass} transition-[width] duration-500 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  )
}
