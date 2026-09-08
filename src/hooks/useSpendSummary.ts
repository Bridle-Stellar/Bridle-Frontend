import { useQuery } from '@tanstack/react-query'
import { getSpendSummary } from '../api/transactions'
import { queryKeys } from '../api/queryKeys'

/**
 * "Spent today / remaining" is the number an owner checks most anxiously
 * right after connecting an agent to real spending power — refetch it
 * often enough that the Overview screen feels live, not cached.
 */
const SPEND_SUMMARY_REFETCH_INTERVAL_MS = 5_000

export function useSpendSummary() {
  return useQuery({
    queryKey: queryKeys.spendSummary,
    queryFn: getSpendSummary,
    refetchInterval: SPEND_SUMMARY_REFETCH_INTERVAL_MS,
    staleTime: 2_000,
  })
}
