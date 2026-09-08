import { useState } from 'react'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/ConfirmDialog'

interface KillSwitchToggleProps {
  active: boolean
  onToggle: (next: boolean) => Promise<void>
  saving: boolean
  error: string | null
}

/**
 * The emergency stop: distinct color, one confirm step — never zero (an
 * accidental tap during normal use would be a self-inflicted outage) and
 * never more than one (an actual emergency needs this reachable fast).
 */
export function KillSwitchToggle({ active, onToggle, saving, error }: KillSwitchToggleProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const next = !active

  return (
    <Card title="Emergency stop" className={active ? 'border-blocked' : undefined}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {active ? 'All spending is currently halted.' : 'Spending is allowed, subject to your allowlist and limits.'}
        </p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold text-white ${
            active ? 'bg-healthy hover:opacity-90' : 'bg-blocked hover:opacity-90'
          }`}
        >
          {active ? 'Resume spending' : 'Stop all spending'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={next ? 'Halt all spending immediately?' : 'Resume spending?'}
        description={
          next
            ? 'The agent will be unable to make any payments until you turn this back off.'
            : 'The agent will be able to spend again, subject to your allowlist and limits.'
        }
        tone={next ? 'danger' : 'default'}
        confirmLabel={next ? 'Sign & stop spending' : 'Sign & resume'}
        busy={saving}
        errorMessage={error}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await onToggle(next)
            setConfirmOpen(false)
          } catch {
            // Dialog stays open; `error` explains what happened.
          }
        }}
      />
    </Card>
  )
}
