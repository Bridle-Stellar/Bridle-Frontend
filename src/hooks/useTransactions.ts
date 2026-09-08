import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listTransactions } from '../api/transactions'
import { queryKeys } from '../api/queryKeys'
import type { TransactionListParams } from '../api/types'

export function useTransactions(params: TransactionListParams = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => listTransactions(params),
    placeholderData: keepPreviousData,
  })
}

/** Compact recent-activity feed for the Overview screen. */
export function useRecentTransactions(limit = 8) {
  return useTransactions({ limit })
}
