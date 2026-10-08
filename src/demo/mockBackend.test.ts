import { beforeEach, describe, expect, it } from 'vitest'
import { ApiError } from '../api/client'
import type { PolicyState, SpendSummary, StatsResponse, TransactionPage } from '../api/types'
import { DEMO_MODE } from './demoMode'
import { demoRequest, resetDemoState } from './mockBackend'

beforeEach(() => resetDemoState())

describe('demo mode flag', () => {
  it('is off unless the build sets VITE_DEMO_MODE=true', () => {
    expect(DEMO_MODE).toBe(false)
  })
})

describe('demo mock backend', () => {
  it("summarizes today's approved spend against the cap in smallest units", async () => {
    const summary = await demoRequest<SpendSummary>('/transactions/summary')
    expect(summary.token).toBe('native')
    expect(summary.cap).toBe(1_000_000_000) // 100 XLM
    expect(summary.total_spent).toBe(550_000_000) // 55 XLM
    expect(summary.remaining).toBe(450_000_000)
  })

  it('filters and paginates transactions like the real endpoint', async () => {
    const rejected = await demoRequest<TransactionPage>('/transactions?status=rejected&limit=2&offset=0')
    expect(rejected.items).toHaveLength(2)
    expect(rejected.total).toBeGreaterThan(2)
    expect(rejected.items.every((tx) => tx.status === 'rejected' && tx.rejection_reason !== null)).toBe(true)
  })

  it('applies a policy write so the next read reflects it', async () => {
    const before = await demoRequest<PolicyState>('/policy')
    expect(before.kill_switch_active).toBe(false)

    const envelope = await demoRequest<{ description: string }>('/policy/kill-switch', {
      method: 'POST',
      body: JSON.stringify({ active: true, owner_public_key: before.owner }),
    })
    expect(envelope.description).toMatch(/^\[demo\]/)

    const after = await demoRequest<PolicyState>('/policy')
    expect(after.kill_switch_active).toBe(true)
  })

  it('keeps policy amounts as smallest-unit strings', async () => {
    await demoRequest('/policy/daily-cap', { method: 'POST', body: JSON.stringify({ daily_cap: '1500000000', owner_public_key: 'x' }) })
    const policy = await demoRequest<PolicyState>('/policy')
    expect(policy.daily_cap).toBe('1500000000')
    expect(policy.remaining_today).toBe('950000000')
  })

  it('buckets stats by day', async () => {
    const stats = await demoRequest<StatsResponse>('/transactions/stats?bucket=day')
    expect(stats.over_time.length).toBeGreaterThan(5)
    expect(stats.by_destination[0].total_spent).toBeGreaterThan(0)
  })

  it('404s on routes the backend does not have', async () => {
    await expect(demoRequest('/nope')).rejects.toBeInstanceOf(ApiError)
  })
})
