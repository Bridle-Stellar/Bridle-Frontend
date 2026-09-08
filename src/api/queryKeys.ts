import type { StatsParams, TransactionListParams } from './types'

export const queryKeys = {
  policy: ['policy'] as const,
  spendSummary: ['transactions', 'summary'] as const,
  transactions: (params: TransactionListParams) => ['transactions', 'list', params] as const,
  transaction: (id: string) => ['transactions', 'detail', id] as const,
  stats: (params: StatsParams) => ['transactions', 'stats', params] as const,
}
