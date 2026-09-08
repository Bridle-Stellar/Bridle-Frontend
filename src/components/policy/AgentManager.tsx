import { useState } from 'react'
import { looksLikeStellarAddress } from '../../lib/stellarAddress'
import { shortenAddress } from '../../lib/format'
import { Card } from '../common/Card'
import { ConfirmDialog } from '../common/ConfirmDialog'

interface AgentManagerProps {
  agents: string[]
  onAdd: (agent: string) => Promise<void>
  onRemove: (agent: string) => Promise<void>
  saving: boolean
  error: string | null
}

/** Registered agent wallet(s) — the Soroban contract refuses to remove the last one, so that button is disabled here too rather than letting the signature round-trip fail. */
export function AgentManager({ agents, onAdd, onRemove, saving, error }: AgentManagerProps) {
  const [agent, setAgent] = useState('')
  const [confirmAdd, setConfirmAdd] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const valid = looksLikeStellarAddress(agent)
  const alreadyRegistered = agents.includes(agent.trim())

  return (
    <Card title="Registered agents">
      <p className="mb-3 text-sm text-ink-muted">These are the Stellar addresses allowed to spend under this policy.</p>
      <ul className="mb-4 divide-y divide-border rounded-md border border-border">
        {agents.map((address) => (
          <li key={address} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="truncate font-mono text-ink" title={address}>
              {shortenAddress(address, 8, 8)}
            </span>
            <button
              type="button"
              disabled={agents.length <= 1}
              title={agents.length <= 1 ? 'At least one agent must remain registered.' : undefined}
              onClick={() => setConfirmRemove(address)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blocked hover:bg-blocked-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          placeholder="Agent Stellar address (G...)"
          value={agent}
          onChange={(event) => setAgent(event.target.value)}
          className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-accent focus:outline-none"
        />
        {agent.trim() !== '' && !valid && <p className="text-sm text-blocked">That doesn't look like a valid Stellar address.</p>}
        {valid && alreadyRegistered && <p className="text-sm text-warning">This agent is already registered.</p>}
        <button
          type="button"
          disabled={!valid || alreadyRegistered}
          onClick={() => setConfirmAdd(true)}
          className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
        >
          Register agent
        </button>
      </div>

      <ConfirmDialog
        open={confirmAdd}
        title="Register this agent?"
        description="It will immediately be able to spend under this policy's limits and allowlist."
        confirmLabel="Sign & register"
        busy={saving}
        errorMessage={error}
        onCancel={() => setConfirmAdd(false)}
        onConfirm={async () => {
          try {
            await onAdd(agent.trim())
            setConfirmAdd(false)
            setAgent('')
          } catch {
            // Dialog stays open; `error` explains what happened.
          }
        }}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Deregister this agent?"
        description="It will no longer be able to spend under this policy."
        tone="danger"
        confirmLabel="Sign & deregister"
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
