import type { PaymentStatus, TransactionListParams } from '../../api/types'

export type FilterState = Pick<TransactionListParams, 'status' | 'destination' | 'start_date' | 'end_date'>

function toDateInputValue(iso: string | undefined): string {
  return iso ? iso.slice(0, 10) : ''
}

function fromDateInputValue(value: string): string | undefined {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined
}

export function TransactionFilters({ value, onChange }: { value: FilterState; onChange: (next: FilterState) => void }) {
  const hasFilters = Boolean(value.status || value.destination || value.start_date || value.end_date)

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-ink-muted" htmlFor="filter-status">
          Status
        </label>
        <select
          id="filter-status"
          value={value.status ?? ''}
          onChange={(event) => onChange({ ...value, status: (event.target.value || undefined) as PaymentStatus | undefined })}
          className="mt-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
        >
          <option value="">All</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-muted" htmlFor="filter-destination">
          Destination
        </label>
        <input
          id="filter-destination"
          value={value.destination ?? ''}
          onChange={(event) => onChange({ ...value, destination: event.target.value || undefined })}
          placeholder="G..."
          className="mt-1 w-56 rounded-md border border-border bg-paper px-2 py-1.5 text-sm font-mono text-ink focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-muted" htmlFor="filter-start">
          From
        </label>
        <input
          id="filter-start"
          type="date"
          value={toDateInputValue(value.start_date)}
          onChange={(event) => onChange({ ...value, start_date: fromDateInputValue(event.target.value) })}
          className="mt-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-ink-muted" htmlFor="filter-end">
          To
        </label>
        <input
          id="filter-end"
          type="date"
          value={toDateInputValue(value.end_date)}
          onChange={(event) => onChange({ ...value, end_date: fromDateInputValue(event.target.value) })}
          className="mt-1 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>
      {hasFilters && (
        <button type="button" onClick={() => onChange({})} className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-paper-muted">
          Clear filters
        </button>
      )}
    </div>
  )
}
