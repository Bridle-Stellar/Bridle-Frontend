/** Shown wherever a screen needs full policy state (limits, allowlist, agents, kill switch) and GET /policy has 404'd — see src/api/types.ts's "GET /policy — UNCONFIRMED, DOCUMENTED STUB" note. */
export function PolicyUnavailableNotice() {
  return (
    <div className="rounded-lg border border-warning bg-warning-soft p-4 text-sm">
      <p className="font-medium text-ink">Can't confirm current policy details</p>
      <p className="mt-1 text-ink-muted">
        Bridle Backend doesn't expose a way to read full policy state yet (limits, allowlist, agents, kill switch) —
        only the write side is wired up. This is a known gap between the two repos; see this app's README, "Known
        gaps".
      </p>
    </div>
  )
}
