import { StrKey } from '@stellar/stellar-sdk'

/** Full StrKey checksum validation for a Stellar Ed25519 public key (G...). */
export function looksLikeStellarAddress(value: string): boolean {
  return StrKey.isValidEd25519PublicKey(value.trim())
}
