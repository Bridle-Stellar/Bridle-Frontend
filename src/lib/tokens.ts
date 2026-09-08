/**
 * Token decimals and display symbols. Stellar's native asset (XLM) always
 * has 7 decimal places; that's the only one this app can state with
 * certainty. Bridle Backend has no endpoint for an arbitrary SEP-41
 * token's decimals, so anything else falls back to 7 with a visible
 * asterisk in the UI rather than silently guessing — see `isKnownToken`.
 */

const DECIMALS: Record<string, number> = {
  native: 7,
}

const SYMBOLS: Record<string, string> = {
  native: 'XLM',
}

const FALLBACK_DECIMALS = 7

export function isKnownToken(token: string): boolean {
  return token in DECIMALS
}

export function decimalsFor(token: string): number {
  return DECIMALS[token] ?? FALLBACK_DECIMALS
}

export function symbolFor(token: string): string {
  if (SYMBOLS[token]) return SYMBOLS[token]
  // Soroban contract IDs are long — shorten for display, never invent a symbol.
  if (token.length > 12) return `${token.slice(0, 4)}…${token.slice(-4)}`
  return token
}
