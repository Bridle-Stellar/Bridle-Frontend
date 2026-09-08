import { describe, expect, it } from 'vitest'
import { formatMoney, isValidAmountInput, spentFraction, toDisplayAmount, toSmallestUnit } from './decimal'

describe('toDisplayAmount / toSmallestUnit (native XLM, 7 decimals)', () => {
  it('round-trips whole and fractional amounts exactly', () => {
    expect(toDisplayAmount('1250000000', 'native')).toBe('125')
    expect(toDisplayAmount('1000000', 'native')).toBe('0.1')
    expect(toSmallestUnit('125', 'native')).toBe('1250000000')
    expect(toSmallestUnit('0.1', 'native')).toBe('1000000')
  })

  it('never loses precision the way naive float division/multiplication would', () => {
    // 0.1 + 0.2 style traps: this amount is exactly representable in the
    // token's smallest unit and must come back exact, not 0.30000000000000004.
    expect(toSmallestUnit('0.3', 'native')).toBe('3000000')
    expect(toDisplayAmount('3000000', 'native')).toBe('0.3')
  })

  it('rejects amounts with more precision than the token supports', () => {
    expect(() => toSmallestUnit('0.12345678', 'native')).toThrow()
  })
})

describe('formatMoney', () => {
  it('always includes the token symbol', () => {
    expect(formatMoney('1250000000', 'native')).toBe('125 XLM')
  })
})

describe('isValidAmountInput', () => {
  it('accepts positive decimal strings', () => {
    expect(isValidAmountInput('10', 'native')).toBe(true)
    expect(isValidAmountInput('0.5', 'native')).toBe(true)
  })

  it('rejects zero, negative, empty, and non-numeric input', () => {
    expect(isValidAmountInput('0', 'native')).toBe(false)
    expect(isValidAmountInput('-5', 'native')).toBe(false)
    expect(isValidAmountInput('', 'native')).toBe(false)
    expect(isValidAmountInput('abc', 'native')).toBe(false)
  })

  it('rejects amounts finer than the token precision', () => {
    expect(isValidAmountInput('0.12345678', 'native')).toBe(false)
  })
})

describe('spentFraction', () => {
  it('computes a 0-1 fraction and clamps at the edges', () => {
    expect(spentFraction('50', '100')).toBe(0.5)
    expect(spentFraction('150', '100')).toBe(1)
    expect(spentFraction('-10', '100')).toBe(0)
  })

  it('returns 0 rather than dividing by zero when no cap is configured', () => {
    expect(spentFraction('10', '0')).toBe(0)
  })
})
