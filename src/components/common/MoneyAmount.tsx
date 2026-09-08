import { formatMoney } from '../../lib/decimal'

/** Every rendered amount goes through here — never print a bare number for money. */
export function MoneyAmount({ amount, token, className }: { amount: number | string; token: string; className?: string }) {
  return <span className={className}>{formatMoney(amount, token)}</span>
}
