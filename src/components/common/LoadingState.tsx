export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-6 text-sm text-ink-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true" />
      {label}
    </div>
  )
}
