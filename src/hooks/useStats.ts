import { useQuery } from '@tanstack/react-query'
import { getStats } from '../api/transactions'
import { queryKeys } from '../api/queryKeys'
import type { StatsParams } from '../api/types'

export function useStats(params: StatsParams = {}) {
  return useQuery({
    queryKey: queryKeys.stats(params),
    queryFn: () => getStats(params),
  })
}
