import type { RejectionReason } from '../api/types'

/**
 * Human sentences for Bridle Backend's structured rejection reasons (see
 * app/models.py:RejectionReason in Bridle Backend). Every member of that
 * enum must have an entry here — `describeRejection`'s fallback exists for
 * a code this frontend hasn't been updated for yet, not as a substitute
 * for adding one when the backend adds a new reason.
 */
const REASON_SENTENCES: Record<RejectionReason, string> = {
  destination_not_allowlisted: "This destination hasn't been approved yet, so the payment was blocked.",
  per_call_max_exceeded: 'This payment is larger than the per-transaction limit allows.',
  daily_cap_exceeded: "This would put today's spending over the daily limit.",
  kill_switch_active: 'The emergency stop is on, so no payments can go through right now.',
  chain_authorization_denied: 'The policy contract denied this payment.',
  upstream_error: 'Something went wrong reaching the policy contract, so the payment was blocked to be safe.',
}

/**
 * `reason` is the structured code; `message` is the backend's own
 * free-text detail (shown as a secondary line, never as the primary
 * explanation — it's meant for developers, not the owner).
 */
export function describeRejection(reason: string | null | undefined): string {
  if (reason && reason in REASON_SENTENCES) {
    return REASON_SENTENCES[reason as RejectionReason]
  }
  return 'This payment was blocked by policy for a reason this dashboard doesn\'t recognize yet.'
}
