import type { PaymentStatus } from '../../api/types'

export function StatusPill({ status }: { status: PaymentStatus }) {
  const isApproved = status === 'approved'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isApproved ? 'bg-healthy-soft text-healthy' : 'bg-blocked-soft text-blocked'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-healthy' : 'bg-blocked'}`} />
      {isApproved ? 'Approved' : 'Rejected'}
    </span>
  )
}
