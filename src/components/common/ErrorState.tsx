/** Shown instead of a blank screen or stale numbers when the backend/chain is unreachable. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-paper p-6 text-center">
      <p className="text-sm font-semibold text-ink">Can't reach Bridle right now</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
        {message ?? "The dashboard couldn't load this from Bridle Backend. Check that it's running and reachable, then try again."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Try again
        </button>
      )}
    </div>
  )
}
