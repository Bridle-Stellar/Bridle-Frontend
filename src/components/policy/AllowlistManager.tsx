import { useState } from 'react'
import type { AllowlistEntry } from '../../api/types'
import { looksLikeStellarAddress } from '../../lib/stellarAddress'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { DiffRow } from '../common/DiffRow'

interface AllowlistManagerProps {
  allowlist: AllowlistEntry[]
  onAdd: (destination: string, category: string) => Promise<void>
  onRemove: (destination: string) => Promise<void>
  saving: boolean
  error: string | null
}

export function AllowlistManager({ allowlist, onAdd, onRemove, saving, error }: AllowlistManagerProps) {
  const [destination, setDestination] = useState('')
  const [category, setCategory] = useState('')
  const [confirmAdd, setConfirmAdd] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const destinationValid = looksLikeStellarAddress(destination)
  const categoryValid = category.trim().length > 0
  const alreadyListed = allowlist.some((entry) => entry.destination === destination.trim())

  return (
    <Card title="Allowed destinations">
      <p className="mb-3 text-sm text-ink-muted">
        The agent can only send payments to addresses on this list. Give each one a name — it's on-chain, so it's
        visible to anyone who reads policy state, but it makes the list recognizable instead of a wall of addresses.
      </p>

      <ul className="mb-4 divide-y divide-border rounded-md border border-border">
        {allowlist.length === 0 && <li className="p-3 text-sm text-ink-muted">No destinations approved yet.</li>}
        {allowlist.map((entry) => (
          <li key={entry.destination} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{entry.category}</p>
              <p className="truncate font-mono text-xs text-ink-muted">{entry.destination}</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmRemove(entry.destination)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blocked hover:bg-blocked-soft"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          placeholder="Label, e.g. OpenAI API"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
        <input
          placeholder="Stellar address (G...)"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-accent focus:outline-none"
        />
        {destination.trim() !== '' && !destinationValid && <p className="text-sm text-blocked">That doesn't look like a valid Stellar address.</p>}
        {destinationValid && alreadyListed && <p className="text-sm text-warning">This destination is already approved.</p>}
        <button
          type="button"
          disabled={!destinationValid || !categoryValid || alreadyListed}
          onClick={() => setConfirmAdd(true)}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
        >
          Approve destination
        </button>
      </div>

      <ConfirmDialog
        open={confirmAdd}
        title="Approve this destination?"
        description="The agent will be able to send payments here as soon as this is signed and submitted."
        confirmLabel="Sign & approve"
        busy={saving}
        errorMessage={error}
        onCancel={() => setConfirmAdd(false)}
        onConfirm={async () => {
          try {
            await onAdd(destination.trim(), category.trim())
            setConfirmAdd(false)
            setDestination('')
            setCategory('')
          } catch {
            // Dialog stays open; `error` explains what happened.
          }
        }}
      >
        <DiffRow label={category || 'New destination'} from="Not approved" to={destination} />
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Remove this destination?"
        description="The agent will no longer be able to send payments here."
        tone="danger"
        confirmLabel="Sign & remove"
        busy={saving}
        errorMessage={error}
        onCancel={() => setConfirmRemove(null)}
        onConfirm={async () => {
          if (!confirmRemove) return
          try {
            await onRemove(confirmRemove)
            setConfirmRemove(null)
          } catch {
            // Dialog stays open; `error` explains what happened.
          }
        }}
      />
    </Card>
  )
}
