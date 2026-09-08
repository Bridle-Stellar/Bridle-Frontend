/** "Old value → new value" line shown before any policy change is confirmed. */
export function DiffRow({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-paper-muted px-3 py-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">
        {from} <span className="text-ink-muted">→</span> {to}
      </span>
    </div>
  )
}
