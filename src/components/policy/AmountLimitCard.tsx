import { useState } from 'react'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { DiffRow } from '../common/DiffRow'
import { formatMoney, isValidAmountInput, toDisplayAmount, toSmallestUnit } from '../../lib/decimal'

interface AmountLimitCardProps {
  title: string
  helpText: string
  currentSmallestUnit: string
  token: string
  onSave: (newSmallestUnit: string) => Promise<void>
  saving: boolean
  saveError: string | null
}

/** Shared by the daily cap and per-call max forms — same shape, different contract call. */
export function AmountLimitCard({ title, helpText, currentSmallestUnit, token, onSave, saving, saveError }: AmountLimitCardProps) {
  const currentDisplay = toDisplayAmount(currentSmallestUnit, token)
  const [draft, setDraft] = useState(currentDisplay)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const valid = isValidAmountInput(draft, token)
  let newSmallestUnit: string | null = null
  if (valid) {
    try {
      newSmallestUnit = toSmallestUnit(draft, token)
    } catch {
      newSmallestUnit = null
    }
  }
  const hasChanged = newSmallestUnit !== null && newSmallestUnit !== currentSmallestUnit
  const isLoosening = newSmallestUnit !== null && BigInt(newSmallestUnit) > BigInt(currentSmallestUnit)

  return (
    <Card title={title}>
      <p className="mb-3 text-sm text-ink-muted">{helpText}</p>
      <p className="mb-3 text-sm text-ink-muted">
        Current: <span className="font-medium text-ink">{formatMoney(currentSmallestUnit, token)}</span>
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          aria-label={title}
        />
        <button
          type="button"
          disabled={!hasChanged}
          onClick={() => setConfirmOpen(true)}
          className="shrink-0 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
        >
          Save
        </button>
      </div>
      {draft.trim() !== '' && !valid && <p className="mt-2 text-sm text-blocked">Enter a positive number.</p>}

      <ConfirmDialog
        open={confirmOpen}
        title={`Update ${title.toLowerCase()}?`}
        description={
          isLoosening
            ? 'This raises the limit — the agent will be able to spend more than before.'
            : 'This lowers the limit — some payments the agent could make today may start being blocked.'
        }
        confirmLabel="Sign & save"
        busy={saving}
        errorMessage={saveError}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!newSmallestUnit) return
          try {
            await onSave(newSmallestUnit)
            setConfirmOpen(false)
          } catch {
            // Dialog stays open; saveError (from the caller's mutation state) explains what happened.
          }
        }}
      >
        <DiffRow label={title} from={formatMoney(currentSmallestUnit, token)} to={formatMoney(newSmallestUnit ?? currentSmallestUnit, token)} />
      </ConfirmDialog>
    </Card>
  )
}
