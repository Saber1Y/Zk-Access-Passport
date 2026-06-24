import { rpc, Contract, TransactionBuilder, xdr, scValToNative } from '@stellar/stellar-sdk'
import { signTransaction, getNetworkDetails } from '@stellar/freighter-api'
import { CONTRACT_ID } from './constants'

export interface SubmitParams {
  useCase: number
  piA: number[]
  piB: number[]
  piC: number[]
  publicInputs: number[][]
  publicKey: string
}

export interface SubmitResult {
  hash: string
  publicInputs: string[]
}

function isSuccess(tx: rpc.Api.GetTransactionResponse): tx is rpc.Api.GetSuccessfulTransactionResponse {
  return tx.status === 'SUCCESS'
}

function isFailed(tx: rpc.Api.GetTransactionResponse): tx is rpc.Api.GetFailedTransactionResponse {
  return tx.status === 'FAILED'
}

export async function submitProof(params: SubmitParams): Promise<SubmitResult> {
  const net = await getNetworkDetails()
  const rpcUrl = net.sorobanRpcUrl
  const passphrase = net.networkPassphrase

  if (!rpcUrl) throw new Error('No Soroban RPC URL. Connect Freighter wallet first.')
  if (!passphrase) throw new Error('No network passphrase. Connect Freighter wallet first.')

  const server = new rpc.Server(rpcUrl, { allowHttp: true })
  const contract = new Contract(CONTRACT_ID)

  const account = await server.getAccount(params.publicKey)

  const args: xdr.ScVal[] = [
    xdr.ScVal.scvU32(params.useCase),
    xdr.ScVal.scvBytes(Buffer.from(params.piA)),
    xdr.ScVal.scvBytes(Buffer.from(params.piB)),
    xdr.ScVal.scvBytes(Buffer.from(params.piC)),
    xdr.ScVal.scvVec(
      params.publicInputs.map((pi) => xdr.ScVal.scvBytes(Buffer.from(pi)))
    ),
  ]

  const operation = contract.call('verify', ...args)

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: passphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  const sim = await server.simulateTransaction(tx)

  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Contract error: ${sim.error}`)
  }

  const preparedBuilder = rpc.assembleTransaction(tx, sim)

  const signedResult = await signTransaction(preparedBuilder.build().toXDR(), {
    networkPassphrase: passphrase,
  })

  const signedTx = TransactionBuilder.fromXDR(signedResult.signedTxXdr, passphrase)

  const sendResponse = await server.sendTransaction(signedTx)

  if (sendResponse.status === 'PENDING' || sendResponse.status === 'DUPLICATE') {
    let txResponse = await server.getTransaction(sendResponse.hash)
    while (txResponse.status === 'NOT_FOUND') {
      await new Promise((r) => setTimeout(r, 1000))
      txResponse = await server.getTransaction(sendResponse.hash)
    }

    if (isSuccess(txResponse)) {
      const result = txResponse.returnValue
      if (!result) throw new Error('No return value from contract')
      const parsed: Buffer[] = scValToNative(result)
      return {
        hash: sendResponse.hash,
        publicInputs: parsed.map((b) => Buffer.from(b).toString('hex')),
      }
    }

    if (isFailed(txResponse)) {
      throw new Error(`Transaction failed: ${sendResponse.hash}`)
    }

    throw new Error('Transaction timed out')
  }

  throw new Error(`Submit failed`)
}
