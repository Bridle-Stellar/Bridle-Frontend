/**
 * Types mirroring Bridle Backend's Pydantic schemas (app/schemas.py) and
 * ORM models (app/models.py), cross-checked field-for-field against that
 * repo's README (the auth-model-confirmed version, with the two-step
 * /relay/prepare + /relay/submit flow and the per-function /policy/*
 * endpoints). Re-check against a live instance's `/docs` (OpenAPI) if
 * Bridle Backend moves again.
 *
 * UNIT CONVENTION: every amount below (`amount`, `total_spent`, `cap`,
 * `remaining`, `daily_cap`, `per_call_max`, ...) is an integer in the
 * token's *smallest unit* (e.g. stroops for native XLM), never a decimal
 * display value. Convert with `src/lib/decimal.ts` at the point of display
 * or input — never do naive float math on these directly.
 */

export type PaymentStatus = 'approved' | 'rejected'

export type RejectionReason =
  | 'destination_not_allowlisted'
  | 'per_call_max_exceeded'
  | 'daily_cap_exceeded'
  | 'kill_switch_active'
  | 'chain_authorization_denied'
  | 'upstream_error'

export interface RejectionDetail {
  reason: RejectionReason
  message: string
}

export interface TransactionOut {
  id: string
  /** Stellar address of the registered agent that made this request, when known. */
  agent: string | null
  destination: string
  token: string
  /** Smallest-unit amount. See UNIT CONVENTION above. */
  amount: number
  status: PaymentStatus
  rejection_reason: RejectionReason | null
  detail: string | null
  payment_tx_hash: string | null
  contract_tx_hash: string | null
  source: 'relay' | 'sync'
  created_at: string
}

export interface TransactionPage {
  items: TransactionOut[]
  total: number
  limit: number
  offset: number
}

export interface TransactionListParams {
  status?: PaymentStatus
  destination?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface SpendSummary {
  period_start: string
  period_end: string
  token: string
  total_spent: number
  cap: number
  remaining: number
}

export interface DestinationSpend {
  destination: string
  total_spent: number
  payment_count: number
}

export interface StatsBucket {
  period_start: string
  approved_count: number
  rejected_count: number
  approved_amount: number
}

export interface StatsResponse {
  by_destination: DestinationSpend[]
  over_time: StatsBucket[]
}

export interface StatsParams {
  start_date?: string
  end_date?: string
  bucket?: 'hour' | 'day'
}

// ---------------------------------------------------------------------------
// Policy write proxy (confirmed: POST /policy/* -> unsigned XDR, signed by
// the owner's wallet and submitted directly to the network). One contract
// instance holds exactly one token's policy, so none of these carry a
// `token` field — the token itself is part of the (currently unreadable,
// see PolicyState below) policy snapshot.
// ---------------------------------------------------------------------------

export interface UnsignedTransactionEnvelope {
  xdr: string
  network_passphrase: string
  description: string
}

export interface SetDailyCapRequest {
  /** Decimal string, smallest unit. */
  daily_cap: string
  owner_public_key: string
}

export interface SetPerCallMaxRequest {
  /** Decimal string, smallest unit. */
  per_call_max: string
  owner_public_key: string
}

export interface AddAllowlistEntryRequest {
  destination: string
  /** Free-form category tag the owner assigns on-chain, e.g. "compute", "data", "api" — this doubles as the human label the owner sees. */
  category: string
  owner_public_key: string
}

export interface RemoveAllowlistEntryRequest {
  destination: string
  owner_public_key: string
}

export interface AddAgentRequest {
  agent: string
  owner_public_key: string
}

export interface RemoveAgentRequest {
  /** The contract itself refuses this if `agent` is the last remaining registered agent. */
  agent: string
  owner_public_key: string
}

export interface KillSwitchRequest {
  active: boolean
  owner_public_key: string
}

export interface TransferOwnershipRequest {
  new_owner: string
  owner_public_key: string
}

export interface AcceptOwnershipRequest {
  pending_owner_public_key: string
}

// ---------------------------------------------------------------------------
// GET /policy — UNCONFIRMED, DOCUMENTED STUB. Does not exist yet.
//
// Confirmed still true against Bridle Backend's finalized README: it
// exposes /transactions/* (reads) and /policy/* (a write proxy -> unsigned
// XDR, one endpoint per contract function) but no endpoint returns the
// *current* full policy snapshot (daily cap, per-call max, allowlist,
// registered agents, owner, kill-switch state). Internally its
// SorobanContractClient already computes all of this
// (get_policy_snapshot() + get_spend_status()) for the local pre-check —
// it just isn't surfaced through a router.
//
// `src/api/policy.ts` calls GET /policy defensively: a 404 (or any
// failure) is treated as "not yet available" rather than a hard error, and
// the UI shows an explicit "can't confirm current policy" state instead of
// guessing or hiding the gap. See this repo's README, "Known gaps", for
// the follow-up needed in Bridle Backend to make this real — it's a small
// addition (one router function serializing PolicySnapshot + SpendStatus,
// mirroring how /transactions/summary already partially does this).
// ---------------------------------------------------------------------------

export interface AllowlistEntry {
  destination: string
  /** On-chain free-form category tag — doubles as the display label. */
  category: string
}

export interface PolicyState {
  owner: string
  agents: string[]
  token: string
  /** Smallest-unit integer, as a decimal string (matches SetDailyCapRequest's convention). */
  daily_cap: string
  per_call_max: string
  spent_today: string
  remaining_today: string
  kill_switch_active: boolean
  allowlist: AllowlistEntry[]
}
