import type { PolicyStateResult } from '../../api/policy'
import { PolicyUnavailableNotice } from '../policy/PolicyUnavailableNotice'

/** Kill-switch state is safety-critical, so this never guesses: if the backend can't confirm it, say so instead of assuming "off". */
export function KillSwitchBanner({ policy }: { policy: PolicyStateResult }) {
  if (!policy.available) return <PolicyUnavailableNotice />
  if (!policy.data.kill_switch_active) return null

  return (
    <div className="rounded-lg border border-blocked bg-blocked-soft p-4 text-sm">
      <p className="font-semibold text-blocked">Emergency stop is ON — no payments can go through</p>
      <p className="mt-1 text-ink-muted">Turn it back off from the Policy page when you're ready to resume spending.</p>
    </div>
  )
}
