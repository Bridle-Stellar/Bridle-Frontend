import { describe, expect, it } from 'vitest'
import { looksLikeStellarAddress } from './stellarAddress'

describe('looksLikeStellarAddress', () => {
  it('accepts a valid Ed25519 public key', () => {
    expect(looksLikeStellarAddress('GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ')).toBe(true)
  })

  it('rejects addresses with a bad checksum even if shaped correctly', () => {
    // Same as the valid key above with one character flipped near the end.
    expect(looksLikeStellarAddress('GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGA')).toBe(false)
  })

  it('rejects obviously wrong input', () => {
    expect(looksLikeStellarAddress('')).toBe(false)
    expect(looksLikeStellarAddress('not-an-address')).toBe(false)
    expect(looksLikeStellarAddress('SBQ7HUWEZ3XSGDPKHCFXUTQZKC3P5C6BTPVGZVAEIYGVFN4GVXQTRGCV')).toBe(false) // secret seed, not a public key
  })
})
