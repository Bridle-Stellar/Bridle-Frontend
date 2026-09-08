import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isValidAmountInput, toSmallestUnit } from '../../lib/decimal'
import { useOnboardingSetup } from '../../hooks/useOnboardingSetup'
import { looksLikeStellarAddress } from '../../lib/stellarAddress'
import { Card } from '../common/Card'

const TOKEN = 'native' // Bridle Backend has no way to read a contract's token before it's readable — see README "Known gaps". XLM is the only asset this dashboard can assume up front.

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { run, steps, running } = useOnboardingSetup()

  const [dailyCap, setDailyCap] = useState('')
  const [perCallMax, setPerCallMax] = useState('')
  const [destination, setDestination] = useState('')
  const [category, setCategory] = useState('')
  const [killSwitchActive, setKillSwitchActive] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const dailyCapValid = isValidAmountInput(dailyCap, TOKEN)
  const perCallMaxValid = isValidAmountInput(perCallMax, TOKEN)
  const destinationValid = looksLikeStellarAddress(destination)
  const categoryValid = category.trim().length > 0
  const perCallNotOverCap =
    dailyCapValid && perCallMaxValid && Number(perCallMax) <= Number(dailyCap)
  const canSubmit = dailyCapValid && perCallMaxValid && perCallNotOverCap && destinationValid && categoryValid && !running

  async function handleSubmit() {
    setSubmitError(null)
    try {
      await run({
        dailyCapSmallestUnit: toSmallestUnit(dailyCap, TOKEN),
        perCallMaxSmallestUnit: toSmallestUnit(perCallMax, TOKEN),
        allowlistDestination: destination.trim(),
        allowlistCategory: category.trim(),
        killSwitchActive,
      })
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Setup did not finish. Fix the failed step and try again.')
    }
  }

  if (done) {
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <p className="text-lg font-semibold text-healthy">Policy is set up</p>
        <p className="mt-2 text-sm text-ink-muted">Your agent can now spend within the limits you just set.</p>
        <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover">
          Go to Overview
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-ink">Set up your agent's spending policy</h1>
      <p className="mt-1 text-sm text-ink-muted">
        A few values, then sign to put them on-chain. You can change any of these later from the Policy page.
      </p>

      <div className="mt-6 space-y-4">
        <Card title="Daily cap">
          <p className="mb-2 text-sm text-ink-muted">The most the agent can spend in a UTC day, across all destinations.</p>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 50"
            value={dailyCap}
            onChange={(event) => setDailyCap(event.target.value)}
            className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-ink-muted">In XLM.</p>
        </Card>

        <Card title="Per-call max">
          <p className="mb-2 text-sm text-ink-muted">The most the agent can spend in a single payment.</p>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 5"
            value={perCallMax}
            onChange={(event) => setPerCallMax(event.target.value)}
            className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          {dailyCapValid && perCallMaxValid && !perCallNotOverCap && (
            <p className="mt-2 text-sm text-blocked">Per-call max can't be more than the daily cap.</p>
          )}
        </Card>

        <Card title="First approved destination">
          <p className="mb-2 text-sm text-ink-muted">Payments can only go to addresses you've approved. Add at least one to get started.</p>
          <input
            placeholder="Label, e.g. OpenAI API"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mb-2 w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
          <input
            placeholder="Stellar address (G...)"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-accent focus:outline-none"
          />
          {destination.trim() !== '' && !destinationValid && <p className="mt-2 text-sm text-blocked">That doesn't look like a valid Stellar address.</p>}
        </Card>

        <Card title="Emergency stop">
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" checked={killSwitchActive} onChange={(event) => setKillSwitchActive(event.target.checked)} className="h-4 w-4 rounded border-border" />
            Start with spending halted
          </label>
          <p className="mt-2 text-xs text-ink-muted">
            {killSwitchActive
              ? "The agent won't be able to spend until you turn this off later."
              : 'Recommended: leave this off so spending is allowed from the start — an accidentally-on kill switch just looks like a broken app.'}
          </p>
        </Card>
      </div>

      {steps.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-md border border-border bg-paper p-3 text-sm">
          {steps.map((step) => (
            <li key={step.key} className="flex items-center justify-between gap-3">
              <span className="text-ink-muted">{step.label}</span>
              <span
                className={
                  step.status === 'done'
                    ? 'text-healthy'
                    : step.status === 'error'
                      ? 'text-blocked'
                      : step.status === 'running'
                        ? 'text-accent'
                        : 'text-ink-muted'
                }
              >
                {step.status === 'pending' && 'Waiting'}
                {step.status === 'running' && 'Signing…'}
                {step.status === 'done' && 'Done'}
                {step.status === 'error' && (step.error ?? 'Failed')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {submitError && <p className="mt-3 text-sm text-blocked">{submitError}</p>}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="mt-6 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-40"
      >
        {running ? 'Setting up…' : 'Sign & set up policy'}
      </button>
    </div>
  )
}
