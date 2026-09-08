import { ApiError, apiGet, apiPost } from './client'
import type {
  AcceptOwnershipRequest,
  AddAgentRequest,
  AddAllowlistEntryRequest,
  KillSwitchRequest,
  PolicyState,
  RemoveAgentRequest,
  RemoveAllowlistEntryRequest,
  SetDailyCapRequest,
  SetPerCallMaxRequest,
  TransferOwnershipRequest,
  UnsignedTransactionEnvelope,
} from './types'

/**
 * Result of trying to read current policy state. `available: false` means
 * specifically "the backend doesn't expose this yet" (a 404 from the
 * documented-but-unimplemented GET /policy — see types.ts) and should
 * render as a distinct "can't confirm current policy" state, never as a
 * default/assumed value — this is safety-relevant state (the kill switch
 * in particular), so guessing is worse than admitting we don't know.
 *
 * A genuine network/server failure is NOT swallowed here — it propagates
 * so callers surface the same "can't reach Bridle right now" state used
 * everywhere else, rather than confusing "down" with "not implemented".
 */
export type PolicyStateResult = { available: true; data: PolicyState } | { available: false }

export async function getPolicyState(): Promise<PolicyStateResult> {
  try {
    const data = await apiGet<PolicyState>('/policy')
    return { available: true, data }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { available: false }
    }
    throw err
  }
}

export function buildSetDailyCapTx(payload: SetDailyCapRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/daily-cap', payload)
}

export function buildSetPerCallMaxTx(payload: SetPerCallMaxRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/per-call-max', payload)
}

export function buildAddAllowlistEntryTx(payload: AddAllowlistEntryRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/allowlist/add', payload)
}

export function buildRemoveAllowlistEntryTx(payload: RemoveAllowlistEntryRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/allowlist/remove', payload)
}

export function buildAddAgentTx(payload: AddAgentRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/agents/add', payload)
}

export function buildRemoveAgentTx(payload: RemoveAgentRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/agents/remove', payload)
}

export function buildKillSwitchTx(payload: KillSwitchRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/kill-switch', payload)
}

export function buildTransferOwnershipTx(payload: TransferOwnershipRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/ownership/transfer', payload)
}

export function buildAcceptOwnershipTx(payload: AcceptOwnershipRequest): Promise<UnsignedTransactionEnvelope> {
  return apiPost<UnsignedTransactionEnvelope>('/policy/ownership/accept', payload)
}
