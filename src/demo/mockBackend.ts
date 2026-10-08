/**
 * In-memory stand-in for Bridle Backend, used only when DEMO_MODE is on
 * (see ./demoMode.ts). It answers the same routes, with the same response
 * shapes, as src/api/*. All data is made up and lives only in this tab.
 *
 * One deliberate difference from the real backend: it answers GET /policy.
 * The real Bridle Backend doesn't expose that read yet (see README, "Known
 * gaps"), so against a real backend the Policy screen shows "Can't confirm
 * current policy details" instead. The demo serves a sample policy so the
 * editing flow can be shown.
 *
 * Amounts follow the same smallest-unit convention as the real API and are
 * built and summed with decimal.js, never float math.
 */
import Decimal from 'decimal.js'
import { ApiError } from '../api/client'
import type {
  AllowlistEntry,
  DestinationSpend,
  PaymentStatus,
  PolicyState,
  RejectionReason,
  SpendSummary,
  StatsBucket,
  StatsResponse,
  TransactionOut,
  TransactionPage,
  UnsignedTransactionEnvelope,
} from '../api/types'
import { toSmallestUnit } from '../lib/decimal'
import { DEMO_WALLET } from './demoMode'

const TOKEN = 'native'
const AGENT = 'GBIKNGCKV37DYFTXGEPCNWEKBYH5ZWYA5K2WB62BJGR4M5YKSENNPUIX'
const DEST = {
  openai: 'GA3TOQO3RYBVTUAV2HRPSSMAZTCDUUWPNDTPSLI5N3BPE5PTNXKS4WSO',
  dataset: 'GCXYNOH5B62Y4LBWCMWZKFJN62NGAIUHMEQTSOKVBR6OTU3GFL7SHJJ7',
  compute: 'GDEH4YEWGTJJ6VXB5GMO7WRFAUVVN2K7MKEPZHGNXHT7B4XZSNGLAJWC',
  unknown: 'GBIUNIILM7UWHF6UAJIOSKTNDFQAGLXAPBQJ37N5TPJKPX5FH675OYKE',
}

const REJECTION_DETAIL: Record<RejectionReason, string> = {
  destination_not_allowlisted: 'Destination is not on the allowlist.',
  per_call_max_exceeded: 'Amount exceeds the per-call maximum.',
  daily_cap_exceeded: 'Exceeds remaining daily budget.',
  kill_switch_active: 'Emergency stop is active.',
  chain_authorization_denied: 'The contract denied authorization.',
  upstream_error: 'Upstream payment error.',
}

/** Display XLM -> smallest-unit integer string, via the app's own decimal helpers. */
function xlm(display: string): string {
  return toSmallestUnit(display, TOKEN)
}

interface Seed {
  /** Whole days before today (UTC). 0 = today. */
  day: number
  /** Fraction of the way through that day (for today: of the time elapsed so far). */
  at: number
  dest: keyof typeof DEST
  amount: string
  reason?: RejectionReason
}

// Today's approved spend is 55 XLM against a 100 XLM cap, with two blocked
// attempts, so the Overview shows a partly-used budget and a recent block.
const SEEDS: Seed[] = [
  { day: 0, at: 0.95, dest: 'openai', amount: '12.5' },
  { day: 0, at: 0.85, dest: 'unknown', amount: '5', reason: 'destination_not_allowlisted' },
  { day: 0, at: 0.7, dest: 'compute', amount: '20' },
  { day: 0, at: 0.5, dest: 'dataset', amount: '15' },
  { day: 0, at: 0.35, dest: 'compute', amount: '30', reason: 'per_call_max_exceeded' },
  { day: 0, at: 0.2, dest: 'openai', amount: '7.5' },
  { day: 1, at: 0.8, dest: 'openai', amount: '18' },
  { day: 1, at: 0.6, dest: 'compute', amount: '24' },
  { day: 1, at: 0.3, dest: 'dataset', amount: '9.75' },
  // 91.5 XLM approved, then a 25 XLM request that would exceed the 100 XLM cap.
  { day: 2, at: 0.95, dest: 'compute', amount: '25', reason: 'daily_cap_exceeded' },
  { day: 2, at: 0.9, dest: 'compute', amount: '22' },
  { day: 2, at: 0.75, dest: 'openai', amount: '25' },
  { day: 2, at: 0.6, dest: 'dataset', amount: '24.5' },
  { day: 2, at: 0.45, dest: 'compute', amount: '20' },
  { day: 3, at: 0.7, dest: 'openai', amount: '11' },
  { day: 3, at: 0.4, dest: 'dataset', amount: '6.25' },
  { day: 4, at: 0.8, dest: 'openai', amount: '8', reason: 'kill_switch_active' },
  { day: 4, at: 0.5, dest: 'compute', amount: '19' },
  { day: 5, at: 0.6, dest: 'openai', amount: '14' },
  { day: 5, at: 0.3, dest: 'compute', amount: '21.5' },
  { day: 5, at: 0.2, dest: 'unknown', amount: '2', reason: 'destination_not_allowlisted' },
  { day: 6, at: 0.5, dest: 'dataset', amount: '12' },
  { day: 7, at: 0.7, dest: 'openai', amount: '16.5' },
  { day: 7, at: 0.4, dest: 'compute', amount: '23' },
  { day: 8, at: 0.5, dest: 'openai', amount: '9' },
  { day: 9, at: 0.6, dest: 'compute', amount: '17' },
  { day: 9, at: 0.3, dest: 'dataset', amount: '8.5' },
  { day: 10, at: 0.5, dest: 'openai', amount: '13' },
  { day: 12, at: 0.5, dest: 'compute', amount: '20' },
  { day: 13, at: 0.5, dest: 'openai', amount: '10' },
]

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

const DAY_MS = 24 * 60 * 60 * 1000

function seedTransactions(now: Date): TransactionOut[] {
  const today = startOfUtcDay(now).getTime()
  return SEEDS.map((seed, i) => {
    const dayStart = today - seed.day * DAY_MS
    const span = seed.day === 0 ? now.getTime() - today : DAY_MS
    const status: PaymentStatus = seed.reason ? 'rejected' : 'approved'
    return {
      id: `demo-tx-${String(i + 1).padStart(3, '0')}`,
      agent: AGENT,
      destination: DEST[seed.dest],
      token: TOKEN,
      amount: Number(xlm(seed.amount)),
      status,
      rejection_reason: seed.reason ?? null,
      detail: seed.reason ? REJECTION_DETAIL[seed.reason] : null,
      payment_tx_hash: seed.reason ? null : `demo${String(i + 1).padStart(4, '0')}`,
      contract_tx_hash: seed.reason ? null : `demoauth${String(i + 1).padStart(4, '0')}`,
      source: 'relay' as const,
      created_at: new Date(dayStart + Math.floor(span * seed.at)).toISOString(),
    }
  }).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

interface DemoState {
  transactions: TransactionOut[]
  policy: Omit<PolicyState, 'spent_today' | 'remaining_today'>
}

function initialState(now: Date): DemoState {
  const allowlist: AllowlistEntry[] = [
    { destination: DEST.openai, category: 'api' },
    { destination: DEST.dataset, category: 'data' },
    { destination: DEST.compute, category: 'compute' },
  ]
  return {
    transactions: seedTransactions(now),
    policy: {
      owner: DEMO_WALLET.address,
      agents: [AGENT],
      token: TOKEN,
      daily_cap: xlm('100'),
      per_call_max: xlm('25'),
      kill_switch_active: false,
      allowlist,
    },
  }
}

let state: DemoState | null = null

function getState(): DemoState {
  state ??= initialState(new Date())
  return state
}

/** Test hook: start over from the seeded data. */
export function resetDemoState(now: Date = new Date()): void {
  state = initialState(now)
}

function sumAmounts(txs: TransactionOut[]): Decimal {
  return txs.reduce((acc, tx) => acc.plus(tx.amount), new Decimal(0))
}

function spendToday(s: DemoState, now: Date) {
  const start = startOfUtcDay(now)
  const spent = sumAmounts(s.transactions.filter((tx) => tx.status === 'approved' && new Date(tx.created_at) >= start))
  const cap = new Decimal(s.policy.daily_cap)
  const remaining = Decimal.max(cap.minus(spent), 0)
  return { start, spent, cap, remaining }
}

function summary(s: DemoState, now: Date): SpendSummary {
  const { start, spent, cap, remaining } = spendToday(s, now)
  return {
    period_start: start.toISOString(),
    period_end: new Date(start.getTime() + DAY_MS).toISOString(),
    token: TOKEN,
    total_spent: spent.toNumber(),
    cap: cap.toNumber(),
    remaining: remaining.toNumber(),
  }
}

function policyState(s: DemoState, now: Date): PolicyState {
  const { spent, remaining } = spendToday(s, now)
  return { ...s.policy, spent_today: spent.toFixed(0), remaining_today: remaining.toFixed(0) }
}

function filterByDate(txs: TransactionOut[], query: URLSearchParams): TransactionOut[] {
  const start = query.get('start_date')
  const end = query.get('end_date')
  return txs.filter((tx) => (!start || tx.created_at >= start) && (!end || tx.created_at <= end))
}

function listTransactions(s: DemoState, query: URLSearchParams): TransactionPage {
  const status = query.get('status')
  const destination = query.get('destination')?.trim()
  const limit = Number(query.get('limit') ?? 50)
  const offset = Number(query.get('offset') ?? 0)
  const matching = filterByDate(s.transactions, query).filter(
    (tx) => (!status || tx.status === status) && (!destination || tx.destination === destination),
  )
  return { items: matching.slice(offset, offset + limit), total: matching.length, limit, offset }
}

function stats(s: DemoState, query: URLSearchParams): StatsResponse {
  const txs = filterByDate(s.transactions, query)
  const hourly = query.get('bucket') === 'hour'

  const byDest = new Map<string, { total: Decimal; count: number }>()
  const buckets = new Map<string, { approved: number; rejected: number; amount: Decimal }>()
  for (const tx of txs) {
    const created = new Date(tx.created_at)
    const key = hourly
      ? new Date(Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate(), created.getUTCHours())).toISOString()
      : startOfUtcDay(created).toISOString()
    const bucket = buckets.get(key) ?? { approved: 0, rejected: 0, amount: new Decimal(0) }
    if (tx.status === 'approved') {
      bucket.approved += 1
      bucket.amount = bucket.amount.plus(tx.amount)
      const dest = byDest.get(tx.destination) ?? { total: new Decimal(0), count: 0 }
      byDest.set(tx.destination, { total: dest.total.plus(tx.amount), count: dest.count + 1 })
    } else {
      bucket.rejected += 1
    }
    buckets.set(key, bucket)
  }

  const by_destination: DestinationSpend[] = [...byDest.entries()]
    .map(([destination, v]) => ({ destination, total_spent: v.total.toNumber(), payment_count: v.count }))
    .sort((a, b) => b.total_spent - a.total_spent)
  const over_time: StatsBucket[] = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period_start, v]) => ({
      period_start,
      approved_count: v.approved,
      rejected_count: v.rejected,
      approved_amount: v.amount.toNumber(),
    }))
  return { by_destination, over_time }
}

function envelope(description: string): UnsignedTransactionEnvelope {
  return { xdr: 'DEMO-UNSIGNED-XDR', network_passphrase: DEMO_WALLET.networkPassphrase, description: `[demo] ${description}` }
}

/** Applies a policy write directly to the demo state (there is nothing to sign) and returns a placeholder envelope. */
function applyPolicyWrite(s: DemoState, path: string, body: Record<string, unknown>): UnsignedTransactionEnvelope {
  const p = s.policy
  switch (path) {
    case '/policy/daily-cap':
      p.daily_cap = String(body.daily_cap)
      return envelope('update_daily_cap')
    case '/policy/per-call-max':
      p.per_call_max = String(body.per_call_max)
      return envelope('update_per_call_max')
    case '/policy/allowlist/add': {
      const destination = String(body.destination)
      p.allowlist = [...p.allowlist.filter((e) => e.destination !== destination), { destination, category: String(body.category) }]
      return envelope('add_allowlist_entry')
    }
    case '/policy/allowlist/remove':
      p.allowlist = p.allowlist.filter((e) => e.destination !== String(body.destination))
      return envelope('remove_allowlist_entry')
    case '/policy/agents/add':
      if (!p.agents.includes(String(body.agent))) p.agents = [...p.agents, String(body.agent)]
      return envelope('add_agent')
    case '/policy/agents/remove':
      if (p.agents.length <= 1) throw new ApiError(400, 'Cannot remove the last registered agent.', { detail: 'last_agent' })
      p.agents = p.agents.filter((a) => a !== String(body.agent))
      return envelope('remove_agent')
    case '/policy/kill-switch':
      p.kill_switch_active = Boolean(body.active)
      return envelope('set_kill_switch')
    default:
      throw new ApiError(400, `Demo mode doesn't support ${path}.`)
  }
}

const LATENCY_MS = 200

/** Answers one Bridle Backend request from demo state. Same contract as src/api/client.ts's request(). */
export async function demoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

  const s = getState()
  const now = new Date()
  const url = new URL(path, 'http://demo.invalid')
  const method = (init?.method ?? 'GET').toUpperCase()
  const route = url.pathname

  if (method === 'POST' && route.startsWith('/policy/')) {
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : {}
    return applyPolicyWrite(s, route, body) as T
  }

  if (method === 'GET') {
    if (route === '/policy') return policyState(s, now) as T
    if (route === '/transactions/summary') return summary(s, now) as T
    if (route === '/transactions/stats') return stats(s, url.searchParams) as T
    if (route === '/transactions') return listTransactions(s, url.searchParams) as T
    if (route.startsWith('/transactions/')) {
      const id = decodeURIComponent(route.slice('/transactions/'.length))
      const tx = s.transactions.find((t) => t.id === id)
      if (tx) return tx as T
    }
  }

  throw new ApiError(404, `Bridle Backend request to ${path} failed with 404`)
}
