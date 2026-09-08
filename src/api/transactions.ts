import { apiGet } from './client'
import type {
  SpendSummary,
  StatsParams,
  StatsResponse,
  TransactionListParams,
  TransactionOut,
  TransactionPage,
} from './types'

export function listTransactions(params: TransactionListParams = {}): Promise<TransactionPage> {
  return apiGet<TransactionPage>('/transactions', { ...params })
}

export function getTransaction(id: string): Promise<TransactionOut> {
  return apiGet<TransactionOut>(`/transactions/${encodeURIComponent(id)}`)
}

export function getSpendSummary(): Promise<SpendSummary> {
  return apiGet<SpendSummary>('/transactions/summary')
}

export function getStats(params: StatsParams = {}): Promise<StatsResponse> {
  return apiGet<StatsResponse>('/transactions/stats', { ...params })
}
