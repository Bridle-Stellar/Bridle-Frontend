import type { UnsignedTransactionEnvelope } from '../api/types'
import { signXdr } from './freighter'
import { submitSignedXdr } from './submitTx'

/** Core "build -> sign with Freighter -> submit" step shared by every policy write, whether fired one at a time (see usePolicyMutation) or as a sequence (see the onboarding wizard). */
export async function signAndSubmitPolicyTx(
  build: () => Promise<UnsignedTransactionEnvelope>,
  wallet: { address: string; networkPassphrase: string },
): Promise<{ hash: string }> {
  const envelope = await build()
  const signedXdr = await signXdr(envelope.xdr, { networkPassphrase: envelope.network_passphrase, address: wallet.address })
  return submitSignedXdr(signedXdr, envelope.network_passphrase)
}
