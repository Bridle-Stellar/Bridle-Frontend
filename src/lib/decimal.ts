/**
 * All chain amounts arrive as integers in a token's smallest unit (see the
 * UNIT CONVENTION note in src/api/types.ts). This module is the only place
 * that converts between that and a human-typed/displayed decimal string —
 * never do `amount / 1e7` or similar inline; Decimal keeps the conversion
 * exact instead of subject to binary floating-point rounding.
 */
import Decimal from 'decimal.js'
import { decimalsFor, symbolFor } from './tokens'

function trimTrailingZeros(fixed: string): string {
  if (!fixed.includes('.')) return fixed
  return fixed.replace(/0+$/, '').replace(/\.$/, '')
}

/** Smallest-unit amount (number or decimal string) -> human decimal string, e.g. "12.5". */
export function toDisplayAmount(smallestUnit: number | string, token: string): string {
  const decimals = decimalsFor(token)
  const fixed = new Decimal(smallestUnit).div(new Decimal(10).pow(decimals)).toFixed(decimals)
  return trimTrailingZeros(fixed) || '0'
}

/** Human decimal string (e.g. "12.5") -> smallest-unit integer string, ready for a request body. */
export function toSmallestUnit(displayAmount: string, token: string): string {
  const decimals = decimalsFor(token)
  const value = new Decimal(displayAmount)
  const scaled = value.mul(new Decimal(10).pow(decimals))
  if (!scaled.isInteger()) {
    throw new Error(`Amount has more precision than ${token} supports (${decimals} decimal places).`)
  }
  return scaled.toFixed(0)
}

/** Format a smallest-unit amount with its token symbol for display, e.g. "12.5 XLM". Never render a bare number. */
export function formatMoney(smallestUnit: number | string, token: string): string {
  return `${toDisplayAmount(smallestUnit, token)} ${symbolFor(token)}`
}

/** Validate a user-typed amount string: a positive, finite decimal that fits the token's precision. */
export function isValidAmountInput(displayAmount: string, token: string): boolean {
  if (displayAmount.trim() === '') return false
  let value: Decimal
  try {
    value = new Decimal(displayAmount)
  } catch {
    return false
  }
  if (!value.isFinite() || value.isNaN() || value.lessThanOrEqualTo(0)) return false
  try {
    toSmallestUnit(displayAmount, token)
  } catch {
    return false
  }
  return true
}

/** 0-1 fraction spent, clamped, for progress bars. Returns 0 when cap is 0 (nothing configured yet). */
export function spentFraction(spent: number | string, cap: number | string): number {
  const capDecimal = new Decimal(cap)
  if (capDecimal.lessThanOrEqualTo(0)) return 0
  const fraction = new Decimal(spent).div(capDecimal)
  return Decimal.min(Decimal.max(fraction, 0), 1).toNumber()
}
