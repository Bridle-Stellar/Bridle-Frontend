import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' is reserved for the kill switch and other hard-stop actions — see README "Accessibility and trust signals". */
  tone?: 'default' | 'danger'
  busy?: boolean
  busyLabel?: string
  errorMessage?: string | null
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  busyLabel = 'Working…',
  errorMessage,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-xl border border-border bg-paper p-6 shadow-xl">
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        {errorMessage && (
          <p className="mt-4 rounded-md bg-blocked-soft px-3 py-2 text-sm text-blocked" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-paper-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 ${
              tone === 'danger' ? 'bg-blocked hover:opacity-90' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
