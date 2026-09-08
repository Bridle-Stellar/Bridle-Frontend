/**
 * Submits a Freighter-signed policy transaction to the network. Bridle
 * Backend's /policy/* endpoints return a *prepared* Soroban invocation
 * (simulated, footprint attached) — signing it is the only step left, so
 * this goes straight to Soroban RPC's sendTransaction/pollTransaction
 * rather than Horizon.
 */
import { rpc, TransactionBuilder } from '@stellar/stellar-sdk'

export class SubmitTxError extends Error {
  hash?: string

  constructor(message: string, hash?: string) {
    super(message)
    this.name = 'SubmitTxError'
    this.hash = hash
  }
}

const sorobanRpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org'

export interface SubmitResult {
  hash: string
}

/** Submits a signed transaction envelope XDR and waits for it to land. */
export async function submitSignedXdr(signedXdr: string, networkPassphrase: string): Promise<SubmitResult> {
  const server = new rpc.Server(sorobanRpcUrl)
  const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)

  const sendResponse = await server.sendTransaction(tx)
  if (sendResponse.status === 'ERROR') {
    throw new SubmitTxError('The network rejected this transaction before it could be included in a ledger.', sendResponse.hash)
  }

  const result = await server.pollTransaction(sendResponse.hash, {
    attempts: 20,
    sleepStrategy: rpc.LinearSleepStrategy,
  })

  if (result.status !== 'SUCCESS') {
    throw new SubmitTxError(
      `The transaction did not succeed on-chain (status: ${result.status}). It may still show up as pending briefly — check the transaction hash if this persists.`,
      sendResponse.hash,
    )
  }

  return { hash: sendResponse.hash }
}
