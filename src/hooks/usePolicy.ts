import { useQuery } from '@tanstack/react-query'
import { getPolicyState } from '../api/policy'
import { queryKeys } from '../api/queryKeys'

/**
 * Current policy snapshot (cap, per-call max, allowlist, agents,
 * kill-switch state). Backed by the documented-but-unimplemented GET
 * /policy — see src/api/policy.ts and src/api/types.ts for why the result
 * carries `available: false` instead of throwing when it 404s.
 */
export function usePolicyState() {
  return useQuery({
    queryKey: queryKeys.policy,
    queryFn: getPolicyState,
    staleTime: 10_000,
  })
}
