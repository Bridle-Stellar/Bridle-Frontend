import { describe, expect, it } from 'vitest'
import type { RejectionReason } from '../api/types'
import { describeRejection } from './rejectionReasons'

// Kept in sync with Bridle Backend's app/models.py:RejectionReason.
const ALL_BACKEND_REASONS: RejectionReason[] = [
  'destination_not_allowlisted',
  'per_call_max_exceeded',
  'daily_cap_exceeded',
  'kill_switch_active',
  'chain_authorization_denied',
  'upstream_error',
]

describe('describeRejection', () => {
  it('has a distinct, non-jargon sentence for every known backend rejection reason', () => {
    const sentences = new Set<string>()
    for (const reason of ALL_BACKEND_REASONS) {
      const sentence = describeRejection(reason)
      expect(sentence).toBeTruthy()
      expect(sentence.toLowerCase()).not.toContain('sep-41')
      expect(sentence.toLowerCase()).not.toContain('auth entry')
      sentences.add(sentence)
    }
    expect(sentences.size).toBe(ALL_BACKEND_REASONS.length)
  })

  it('falls back to a safe sentence for a code this frontend does not recognize', () => {
    const sentence = describeRejection('some_future_reason_code')
    expect(sentence).toBeTruthy()
    expect(sentence.length).toBeGreaterThan(0)
  })

  it('falls back gracefully for null/undefined', () => {
    expect(describeRejection(null)).toBeTruthy()
    expect(describeRejection(undefined)).toBeTruthy()
  })
})
