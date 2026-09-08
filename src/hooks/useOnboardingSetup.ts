import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { buildAddAllowlistEntryTx, buildKillSwitchTx, buildSetDailyCapTx, buildSetPerCallMaxTx } from '../api/policy'
import { queryKeys } from '../api/queryKeys'
import type { UnsignedTransactionEnvelope } from '../api/types'
import { useWallet } from '../context/WalletContext'
import { signAndSubmitPolicyTx } from '../lib/policyTx'

export interface OnboardingInput {
  dailyCapSmallestUnit: string
  perCallMaxSmallestUnit: string
  allowlistDestination: string
  allowlistCategory: string
  /** Recommended default is false (spending allowed) — see this app's README, "starting the kill switch off". Only included as a signed step when true, since a fresh contract already starts inactive. */
  killSwitchActive: boolean
}

export type StepStatus = 'pending' | 'running' | 'done' | 'error'

export interface StepState {
  key: string
  label: string
  status: StepStatus
  error?: string
}

interface PlannedStep {
  key: string
  label: string
  build: () => Promise<UnsignedTransactionEnvelope>
}

/**
 * Runs first-time policy setup as a sequence of owner-signed transactions.
 * Each contract dial (cap, per-call max, allowlist entry, kill switch) is
 * its own on-chain call, so this can't be collapsed into a single
 * signature — but it keeps the count to the minimum the contract allows
 * and shows clear per-step progress so a stalled Freighter prompt is
 * obvious rather than a silent hang.
 */
export function useOnboardingSetup() {
  const { address, networkPassphrase } = useWallet()
  const queryClient = useQueryClient()
  const [steps, setSteps] = useState<StepState[]>([])
  const [running, setRunning] = useState(false)

  const run = useCallback(
    async (input: OnboardingInput) => {
      if (!address || !networkPassphrase) throw new Error('Connect your wallet first.')
      const wallet = { address, networkPassphrase }

      const plan: PlannedStep[] = [
        {
          key: 'cap',
          label: 'Set daily cap',
          build: () => buildSetDailyCapTx({ daily_cap: input.dailyCapSmallestUnit, owner_public_key: address }),
        },
        {
          key: 'per_call',
          label: 'Set per-call max',
          build: () => buildSetPerCallMaxTx({ per_call_max: input.perCallMaxSmallestUnit, owner_public_key: address }),
        },
        {
          key: 'allowlist',
          label: `Approve ${input.allowlistCategory || 'first destination'}`,
          build: () =>
            buildAddAllowlistEntryTx({
              destination: input.allowlistDestination,
              category: input.allowlistCategory,
              owner_public_key: address,
            }),
        },
      ]

      if (input.killSwitchActive) {
        plan.push({
          key: 'kill_switch',
          label: 'Turn on emergency stop',
          build: () => buildKillSwitchTx({ active: true, owner_public_key: address }),
        })
      }

      setRunning(true)
      setSteps(plan.map((step) => ({ key: step.key, label: step.label, status: 'pending' })))

      for (const step of plan) {
        setSteps((prev) => prev.map((s) => (s.key === step.key ? { ...s, status: 'running' } : s)))
        try {
          await signAndSubmitPolicyTx(step.build, wallet)
          setSteps((prev) => prev.map((s) => (s.key === step.key ? { ...s, status: 'done' } : s)))
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Something went wrong.'
          setSteps((prev) => prev.map((s) => (s.key === step.key ? { ...s, status: 'error', error: message } : s)))
          setRunning(false)
          throw err
        }
      }

      setRunning(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.policy })
      queryClient.invalidateQueries({ queryKey: queryKeys.spendSummary })
    },
    [address, networkPassphrase, queryClient],
  )

  return { run, steps, running }
}
