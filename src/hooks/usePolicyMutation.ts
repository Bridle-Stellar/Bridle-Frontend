import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../api/queryKeys'
import type { UnsignedTransactionEnvelope } from '../api/types'
import { useWallet } from '../context/WalletContext'
import { signAndSubmitPolicyTx } from '../lib/policyTx'

/**
 * Every policy form shares the same flow: ask Bridle Backend to build an
 * unsigned transaction for the intended change, have Freighter sign it,
 * submit it to the network, then refresh whatever cached data depends on
 * policy state. This hook is that flow for a single change — see
 * src/hooks/useOnboardingSetup.ts for the sequential, multi-step version
 * used during first-time setup.
 */
export function useSignAndSubmitPolicyTx() {
  const { address, networkPassphrase } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (build: () => Promise<UnsignedTransactionEnvelope>) => {
      if (!address || !networkPassphrase) {
        throw new Error('Connect your wallet before changing policy.')
      }
      return signAndSubmitPolicyTx(build, { address, networkPassphrase })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policy })
      queryClient.invalidateQueries({ queryKey: queryKeys.spendSummary })
    },
  })
}
